/**
 * scripts/add-tt-companies.ts
 *
 * Standalone seed script that reads tech-tree company data from a local CSV file
 * and upserts:
 *   1. company documents into "tt_companies"
 *   2. company → tech-tree-node mappings into "company_tech_tree_edges"
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/add-tt-companies.ts
 *
 * Optional:
 *   TT_COMPANIES_CSV_PATH=../data/tt-companies.csv
 *   MONGODB_DB_NAME=nuclear_tt_db
 *   REPLACE_TT_COMPANIES=true
 *
 * Environment variables:
 *   MONGODB_URI – MongoDB connection string (required)
 */

import * as fs from "fs";
import * as path from "path";
import { MongoClient, Collection, Document } from "mongodb";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CSV_FILE_PATH = process.env.TT_COMPANIES_CSV_PATH
  ? path.resolve(process.env.TT_COMPANIES_CSV_PATH)
  : path.resolve(__dirname, "../data/tt-companies.csv");

const DB_NAME = process.env.MONGODB_DB_NAME ?? "nuclear_tt_db";

const COMPANIES_COLLECTION = "tt_companies";
const COMPANY_TT_EDGES_COLLECTION = "company_tech_tree_edges";
const TECH_TREE_NODES_COLLECTION = "nodes";

const REPLACE_TT_COMPANIES = process.env.REPLACE_TT_COMPANIES === "true";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CsvRow = Record<string, string>;

type Primitive = string | number | boolean | null;

interface NormalizedCompany extends Record<string, unknown> {
  id: string;
  canonical_name: string;
  country_iso?: string | null;
  country_tier?: number | null;
  country_tier_label?: string | null;
  trl_level?: number | null;
  trl_band?: string | null;
  trl_confidence?: number | null;
  primary_approach?: string | null;
  all_approaches?: string[];
  tech_tree_node_count?: number | null;
  tech_tree_primary_node?: string | null;
  tech_tree_primary_method?: string | null;
  tech_tree_primary_confidence?: number | null;
  tech_tree_primary_reasoning?: string | null;
  tech_tree_primary_source_url?: string | null;
  tech_tree_all_nodes?: string[];
  tech_tree_all_methods?: string[];
  tech_tree_all_confidences?: number[];
  tech_tree_all_reasonings?: string[];
  tech_tree_all_source_urls?: string[];
  tech_tree_product_clusters?: string[];
  key_investors?: string[];
  manufacturing_countries?: string[];
  critical_material_deps?: string[];
  ownership_top_shareholders?: string[];
  last_seen_at?: Date | string | null;
  updated_at: Date;
}

interface CompanyTechTreeEdge {
  id: string;
  company_id: string;
  company_name: string;
  tech_tree_node_id: string;
  relation_type: "maps_to";
  is_primary: boolean;
  method?: string | null;
  confidence?: number | null;
  reasoning?: string | null;
  source_url?: string | null;
  source?: string | null;
  created_from: "tt-companies.csv";
  updated_at: Date;
}

// ---------------------------------------------------------------------------
// Small CSV parser, avoids adding another dependency
// Handles quoted cells, escaped quotes, commas/newlines inside quoted cells.
// ---------------------------------------------------------------------------

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (nonEmptyRows.length === 0) return [];

  const headers = nonEmptyRows[0].map((h) => h.trim());

  return nonEmptyRows.slice(1).map((values) => {
    const obj: CsvRow = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() ?? "";
    });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function emptyToNull(value: string | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.toLowerCase() === "nan") return null;
  return trimmed;
}

function toNumber(value: string | undefined): number | null {
  const normalized = emptyToNull(value);
  if (normalized == null) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: string | undefined): boolean | null {
  const normalized = emptyToNull(value);
  if (normalized == null) return null;

  const lower = normalized.toLowerCase();
  if (["true", "yes", "1"].includes(lower)) return true;
  if (["false", "no", "0"].includes(lower)) return false;

  return null;
}

function toDateOrString(value: string | undefined): Date | string | null {
  const normalized = emptyToNull(value);
  if (normalized == null) return null;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? normalized : date;
}

function splitPipe(value: string | undefined): string[] {
  const normalized = emptyToNull(value);
  if (normalized == null) return [];
  return normalized
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitPipeNumbers(value: string | undefined): number[] {
  return splitPipe(value)
    .map((part) => Number(part))
    .filter((num) => Number.isFinite(num));
}

function parseManufacturingCountries(value: string | undefined): string[] {
  return splitPipe(value).map((entry) => {
    // Example: "US:manufacturing" → "US"
    const [country] = entry.split(":");
    return country.trim();
  });
}

function normalizeGenericValue(key: string, value: string): Primitive | string[] | number[] | Date {
  const arrayFields = new Set([
    "all_approaches",
    "tech_tree_all_nodes",
    "tech_tree_all_methods",
    "tech_tree_all_reasonings",
    "tech_tree_all_source_urls",
    "tech_tree_product_clusters",
    "key_investors",
    "critical_material_deps",
    "ownership_top_shareholders",
  ]);

  const numericArrayFields = new Set(["tech_tree_all_confidences"]);

  const manufacturingArrayFields = new Set(["manufacturing_countries"]);

  const numericFields = new Set([
    "country_tier",
    "trl_level",
    "trl_confidence",
    "trl_history_count",
    "subsystem_count",
    "tech_tree_node_count",
    "tech_tree_primary_confidence",
    "key_investors_count",
    "role_in_supply_chain_confidence",
    "regulatory_risk_score",
    "regulatory_risk_score_confidence",
    "export_control_exposure_confidence",
    "financial_risk_score",
    "commercial_risk_score",
    "manufacturing_risk_score",
    "geopolitical_risk_score",
    "founded_year",
    "funding_total_usd",
    "effective_country_tier",
    "confidence",
  ]);

  const booleanFields = new Set([
    "foreign_ownership_flag",
    "sole_source_dependency",
    "has_ownership_chain",
    "tier_shift",
  ]);

  const dateFields = new Set(["last_seen_at"]);

  if (arrayFields.has(key)) return splitPipe(value);
  if (numericArrayFields.has(key)) return splitPipeNumbers(value);
  if (manufacturingArrayFields.has(key)) return parseManufacturingCountries(value);
  if (numericFields.has(key)) return toNumber(value);
  if (booleanFields.has(key)) return toBoolean(value);
  if (dateFields.has(key)) return toDateOrString(value);

  return emptyToNull(value);
}

function normalizeCompany(row: CsvRow): NormalizedCompany {
  const id = emptyToNull(row.id);
  const canonicalName = emptyToNull(row.canonical_name);

  if (!id) throw new Error(`Company row missing required field "id": ${JSON.stringify(row)}`);
  if (!canonicalName) throw new Error(`Company row missing required field "canonical_name": ${id}`);

  const company: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    company[key] = normalizeGenericValue(key, value);
  }

  company.id = id;
  company.canonical_name = canonicalName;
  company.updated_at = new Date();

  return company as NormalizedCompany;
}

function getArrayValue<T>(values: T[] | undefined, index: number): T | null {
  if (!values || values.length === 0) return null;
  return values[index] ?? null;
}

function buildCompanyTechTreeEdges(company: NormalizedCompany): CompanyTechTreeEdge[] {
  const allNodes = company.tech_tree_all_nodes ?? [];
  const allMethods = company.tech_tree_all_methods ?? [];
  const allConfidences = company.tech_tree_all_confidences ?? [];
  const allReasonings = company.tech_tree_all_reasonings ?? [];
  const allSourceUrls = company.tech_tree_all_source_urls ?? [];

  const primaryNode = company.tech_tree_primary_node ?? null;
  const seen = new Set<string>();

  return allNodes
    .filter((nodeId) => {
      if (seen.has(nodeId)) return false;
      seen.add(nodeId);
      return true;
    })
    .map((nodeId, index) => ({
      id: `${company.id}__${nodeId}`,
      company_id: company.id,
      company_name: company.canonical_name,
      tech_tree_node_id: nodeId,
      relation_type: "maps_to",
      is_primary: primaryNode === nodeId,
      method: getArrayValue(allMethods, index),
      confidence: getArrayValue(allConfidences, index),
      reasoning: getArrayValue(allReasonings, index),
      source_url: getArrayValue(allSourceUrls, index),
      source: typeof company.source === "string" ? company.source : null,
      created_from: "tt-companies.csv",
      updated_at: new Date(),
    }));
}

// ---------------------------------------------------------------------------
// Sanity checks
// ---------------------------------------------------------------------------

async function validateTechTreeNodeIds(
  techTreeNodesCollection: Collection<Document>,
  edges: CompanyTechTreeEdge[]
): Promise<void> {
  const nodeIds = [...new Set(edges.map((edge) => edge.tech_tree_node_id))];

  const existingNodes = await techTreeNodesCollection
    .find({ id: { $in: nodeIds } })
    .project({ id: 1, _id: 0 })
    .toArray();

  const existingNodeIds = new Set(existingNodes.map((node) => node.id));
  const missingNodeIds = nodeIds.filter((id) => !existingNodeIds.has(id));

  if (missingNodeIds.length > 0) {
    throw new Error(
      `Company → tech-tree edge validation FAILED. Missing tech-tree node IDs in "${TECH_TREE_NODES_COLLECTION}": ${missingNodeIds.join(", ")}`
    );
  }

  console.log(`Tech-tree node validation passed: ${nodeIds.length} referenced node ID(s) exist.`);
}

function validateCompanyMappings(companies: NormalizedCompany[], edges: CompanyTechTreeEdge[]): void {
  const companiesWithoutMappings = companies
    .filter((company) => (company.tech_tree_all_nodes ?? []).length === 0)
    .map((company) => company.id);

  if (companiesWithoutMappings.length > 0) {
    console.warn(
      `WARNING: ${companiesWithoutMappings.length} company/company(s) have no tech-tree mappings: ${companiesWithoutMappings
        .slice(0, 20)
        .join(", ")}${companiesWithoutMappings.length > 20 ? " ..." : ""}`
    );
  }

  console.log(
    `Mapping check complete: ${companies.length} company document(s), ${edges.length} company-tech-tree edge document(s).`
  );
}

// ---------------------------------------------------------------------------
// Mongo helpers
// ---------------------------------------------------------------------------

async function createIndexes(
  companiesCollection: Collection<Document>,
  companyTechTreeEdgesCollection: Collection<Document>
): Promise<void> {
  console.log("Creating indexes...");

  await companiesCollection.createIndex({ id: 1 }, { unique: true });
  await companiesCollection.createIndex({ canonical_name: 1 });
  await companiesCollection.createIndex({ country_iso: 1 });
  await companiesCollection.createIndex({ tech_tree_primary_node: 1 });
  await companiesCollection.createIndex({ primary_approach: 1 });
  await companiesCollection.createIndex({ role_in_supply_chain: 1 });

  await companyTechTreeEdgesCollection.createIndex({ id: 1 }, { unique: true });
  await companyTechTreeEdgesCollection.createIndex(
    { company_id: 1, tech_tree_node_id: 1 },
    { unique: true }
  );
  await companyTechTreeEdgesCollection.createIndex({ company_id: 1 });
  await companyTechTreeEdgesCollection.createIndex({ tech_tree_node_id: 1 });
  await companyTechTreeEdgesCollection.createIndex({ is_primary: 1 });

  console.log("Indexes created.");
}

async function upsertCompanies(
  companiesCollection: Collection<Document>,
  companies: NormalizedCompany[]
): Promise<number> {
  if (companies.length === 0) return 0;

  const result = await companiesCollection.bulkWrite(
    companies.map((company) => ({
      updateOne: {
        filter: { id: company.id },
        update: {
          $set: company,
          $setOnInsert: { created_at: new Date() },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  return result.upsertedCount + result.modifiedCount + result.matchedCount;
}

async function upsertCompanyTechTreeEdges(
  companyTechTreeEdgesCollection: Collection<Document>,
  edges: CompanyTechTreeEdge[]
): Promise<number> {
  if (edges.length === 0) return 0;

  const result = await companyTechTreeEdgesCollection.bulkWrite(
    edges.map((edge) => ({
      updateOne: {
        filter: {
          company_id: edge.company_id,
          tech_tree_node_id: edge.tech_tree_node_id,
        },
        update: {
          $set: edge,
          $setOnInsert: { created_at: new Date() },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  return result.upsertedCount + result.modifiedCount + result.matchedCount;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`\nReading company data from: ${CSV_FILE_PATH}`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    throw new Error(
      `CSV file not found at path: ${CSV_FILE_PATH}. ` +
        `Set TT_COMPANIES_CSV_PATH or place the file at data/tt-companies.csv.`
    );
  }

  const rawCsv = fs.readFileSync(CSV_FILE_PATH, "utf-8");
  const rows = parseCsv(rawCsv);
  console.log(`Loaded ${rows.length} CSV row(s).`);

  const companies = rows.map(normalizeCompany);
  const companyTechTreeEdges = companies.flatMap(buildCompanyTechTreeEdges);

  validateCompanyMappings(companies, companyTechTreeEdges);

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. " +
        "Add it to your .env.local file or export it in your shell."
    );
  }

  console.log("Connecting to MongoDB...");
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully.");

    const db = client.db(DB_NAME);
    const companiesCollection = db.collection(COMPANIES_COLLECTION);
    const companyTechTreeEdgesCollection = db.collection(COMPANY_TT_EDGES_COLLECTION);
    const techTreeNodesCollection = db.collection(TECH_TREE_NODES_COLLECTION);

    await createIndexes(companiesCollection, companyTechTreeEdgesCollection);

    await validateTechTreeNodeIds(techTreeNodesCollection, companyTechTreeEdges);

    if (REPLACE_TT_COMPANIES) {
      console.log(`\nREPLACE_TT_COMPANIES=true. Clearing existing company collections...`);
      const deletedCompanies = await companiesCollection.deleteMany({});
      const deletedEdges = await companyTechTreeEdgesCollection.deleteMany({});
      console.log(
        `Removed ${deletedCompanies.deletedCount} company document(s) and ${deletedEdges.deletedCount} company-tech-tree edge document(s).`
      );
    }

    console.log("\nUpserting companies...");
    await upsertCompanies(companiesCollection, companies);
    console.log(`Upserted ${companies.length} company document(s) into "${COMPANIES_COLLECTION}".`);

    console.log("\nUpserting company-tech-tree edges...");
    await upsertCompanyTechTreeEdges(companyTechTreeEdgesCollection, companyTechTreeEdges);
    console.log(
      `Upserted ${companyTechTreeEdges.length} edge document(s) into "${COMPANY_TT_EDGES_COLLECTION}".`
    );

    console.log(
      `\nSuccessfully seeded ${companies.length} companies and ${companyTechTreeEdges.length} company-tech-tree edges into "${DB_NAME}".`
    );
  } catch (err) {
    console.error("\nAn error occurred during the company seeding process:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

main();
