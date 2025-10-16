"""TechTree core Python package.

Provides scheduling and simulation utilities for the investment tech tree.

Typical usage:
    from techtree.scheduler import NuclearScheduler
"""

from .scheduler import NuclearScheduler  # re-export for convenience
from .simulator import simulate_chain, save_results  # convenience re-exports

__all__ = [
    "NuclearScheduler",
    "simulate_chain",
    "save_results",
]
