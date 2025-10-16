#!/usr/bin/env python3
"""Run a very basic tech tree simulation and write results to data/simulations/latest.json.

Usage:
    python scripts/run_simulation.py
"""
from __future__ import annotations

from pathlib import Path

from techtree.simulator import simulate_chain, save_results


def main() -> None:
    # Minimal demo chain: two milestones leading to a single concept
    chain = [
        {"id": "m1", "label": "Milestone A", "type": "Milestone", "trl_current": "6"},
        {"id": "m2", "label": "Milestone B", "type": "Milestone", "trl_current": "5"},
        {"id": "c1", "label": "Concept 1", "type": "ReactorConcept"},
    ]

    impact = simulate_chain(chain, years_to_simulate=10, draws=300, seed=123)
    output_path = Path("data/simulations/latest.json")
    save_results(impact, out_path=output_path)
    print(f"Wrote simulation results to: {output_path.resolve()}")


if __name__ == "__main__":
    main()
