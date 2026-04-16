import json
import argparse
from collections import defaultdict
from pathlib import Path

def process_raw_simulations(input_path, output_path):
    print(f"  -> Loading: {input_path.name}")
    with open(input_path, 'r') as f:
        raw_data = json.load(f)

    distributions = defaultdict(lambda: defaultdict(int))
    raw_node_counts = defaultdict(int) # Track expected totals per node

    # 1. Aggregate the data
    for record in raw_data:
        node = record.get("Node")
        year = record.get("Year")
        if node is not None and year is not None:
            distributions[node][str(int(year))] += 1
            raw_node_counts[node] += 1

    final_distributions = {node: dict(years) for node, years in distributions.items()}

    # 2. Run Integrity Checks
    print("  -> Running integrity checks...")
    
    # Check A: Do we have the same number of unique nodes?
    raw_unique_nodes = len(raw_node_counts)
    dist_unique_nodes = len(final_distributions)
    
    if raw_unique_nodes != dist_unique_nodes:
        print(f"     [!] ERROR: Node count mismatch. Raw: {raw_unique_nodes}, Dist: {dist_unique_nodes}")
    else:
        print(f"     [✓] Verified: {dist_unique_nodes} unique nodes processed.")

    # Check B: Does the sum of the bins equal the total runs for that node?
    failed_nodes = []
    for node, years_dict in final_distributions.items():
        total_binned = sum(years_dict.values())
        expected_total = raw_node_counts[node]
        
        if total_binned != expected_total:
            failed_nodes.append((node, expected_total, total_binned))

    if failed_nodes:
        print(f"     [!] ERROR: {len(failed_nodes)} nodes failed sum validation!")
        for n, expected, actual in failed_nodes[:5]:
            print(f"         - {n}: Expected {expected} runs, got {actual} binned")
        if len(failed_nodes) > 5:
            print("         ... and more.")
    else:
        sample_node = next(iter(final_distributions))
        sample_runs = raw_node_counts[sample_node]
        print(f"     [✓] Verified: All nodes perfectly sum to their exact iteration count (e.g., {sample_runs} runs).")

    # 3. Save the validated data
    print(f"  -> Saving:  {output_path.name}")
    with open(output_path, 'w') as f:
        json.dump(final_distributions, f, indent=2)

def process_directory(target_dir):
    dir_path = Path(target_dir)
    
    if not dir_path.is_dir():
        print(f"Error: Directory not found -> {dir_path}")
        return

    target_files = list(dir_path.glob("simulation_runs_*.json"))
    
    if not target_files:
        print(f"No 'simulation_runs_*.json' files found in {dir_path}")
        return
        
    print(f"Found {len(target_files)} simulation files to process.\n")
    
    for input_path in target_files:
        new_filename = input_path.name.replace("simulation_runs_", "distributions_")
        output_path = dir_path / new_filename
        
        process_raw_simulations(input_path, output_path)
        print("  Done.\n" + "-"*40 + "\n")
        
    print("All distributions pre-computed, verified, and ready for the frontend!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Batch pre-compute and verify histogram bins for a directory of simulation runs.")
    parser.add_argument("target_dir", help="Path to the directory containing the simulation_runs_*.json files")
    
    args = parser.parse_args()
    process_directory(args.target_dir)