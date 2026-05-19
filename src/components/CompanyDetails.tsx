'use client';

import React from 'react';
import { CompanyInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface CompanyDetailsProps {
  company: CompanyInfo;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="space-y-1 pb-2 border-b last:border-b-0">
      <h4 className="font-semibold text-sm text-gray-700">{label}</h4>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} variant="secondary" className="text-xs">
          {item}
        </Badge>
      ))}
    </div>
  );
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  return (
    <div className="p-4 flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 gap-4 border-b-2 mb-4">
          <CardTitle className="text-lg font-bold leading-tight">
            {company.canonical_name}
          </CardTitle>
          <Badge className="bg-yellow-400 text-yellow-900 shrink-0">Company</Badge>
        </CardHeader>

        <CardContent className="overflow-auto flex-grow space-y-3">
          {company.is_primary && (
            <div className="bg-yellow-50 border border-yellow-300 rounded px-3 py-2 text-xs text-yellow-800 font-medium">
              Primary match for this tech tree node
            </div>
          )}

          <InfoRow label="Country" value={company.country_iso ?? null} />
          <InfoRow label="Country Tier" value={
            company.country_tier != null
              ? `${company.country_tier}${company.country_tier_label ? ` — ${company.country_tier_label}` : ''}`
              : null
          } />
          <InfoRow label="TRL Level" value={
            company.trl_level != null
              ? `${company.trl_level}${company.trl_band ? ` (${company.trl_band})` : ''}`
              : null
          } />
          <InfoRow
            label="Primary Approach"
            value={company.primary_approach ?? null}
          />
          <InfoRow
            label="All Approaches"
            value={
              company.all_approaches?.length
                ? <TagList items={company.all_approaches} />
                : null
            }
          />

          {(company.relation_confidence != null ||
            company.relation_method != null ||
            company.relation_reasoning != null) && (
            <div className="space-y-2 pb-2 border-b">
              <h4 className="font-semibold text-sm text-gray-700">
                Tech Tree Mapping
              </h4>
              <div className="space-y-1 text-sm">
                {company.relation_method && (
                  <p>
                    <span className="font-medium">Method:</span>{' '}
                    {company.relation_method}
                  </p>
                )}
                {company.relation_confidence != null && (
                  <p>
                    <span className="font-medium">Confidence:</span>{' '}
                    {typeof company.relation_confidence === 'number'
                      ? `${(company.relation_confidence * 100).toFixed(0)}%`
                      : company.relation_confidence}
                  </p>
                )}
                {company.relation_reasoning && (
                  <p>
                    <span className="font-medium">Reasoning:</span>{' '}
                    {company.relation_reasoning}
                  </p>
                )}
              </div>
            </div>
          )}

          <Accordion type="multiple" className="w-full">
            {company.key_investors?.length ? (
              <AccordionItem value="investors">
                <AccordionTrigger className="text-sm font-semibold text-gray-700">
                  Key Investors ({company.key_investors.length})
                </AccordionTrigger>
                <AccordionContent>
                  <TagList items={company.key_investors} />
                </AccordionContent>
              </AccordionItem>
            ) : null}

            {company.manufacturing_countries?.length ? (
              <AccordionItem value="manufacturing">
                <AccordionTrigger className="text-sm font-semibold text-gray-700">
                  Manufacturing Countries
                </AccordionTrigger>
                <AccordionContent>
                  <TagList items={company.manufacturing_countries} />
                </AccordionContent>
              </AccordionItem>
            ) : null}

            {company.critical_material_deps?.length ? (
              <AccordionItem value="materials">
                <AccordionTrigger className="text-sm font-semibold text-gray-700">
                  Critical Material Dependencies
                </AccordionTrigger>
                <AccordionContent>
                  <TagList items={company.critical_material_deps} />
                </AccordionContent>
              </AccordionItem>
            ) : null}

            {company.ownership_top_shareholders?.length ? (
              <AccordionItem value="shareholders">
                <AccordionTrigger className="text-sm font-semibold text-gray-700">
                  Top Shareholders
                </AccordionTrigger>
                <AccordionContent>
                  <TagList items={company.ownership_top_shareholders} />
                </AccordionContent>
              </AccordionItem>
            ) : null}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDetails;
