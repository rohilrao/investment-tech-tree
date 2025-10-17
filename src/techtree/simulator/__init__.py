"""Probabilistic simulator for TechTree.

This module provides minimal world models and a runner utility to simulate
chains of dependent entities over a number of years and produce results
compatible with the frontend heatmap/status visualization.
"""

from .runner import simulate_chain, save_results

__all__ = [
    "simulate_chain",
    "save_results",
]
