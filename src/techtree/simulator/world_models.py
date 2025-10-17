from __future__ import annotations

import math

import pymc as pm
import numpy as np


def sample_milestone_duration(trl_current: str | None, draws: int = 1, seed: int | None = None) -> np.ndarray:
    """
    Sample milestone duration (years) given a TRL string.

    Uses a lognormal model centered around the deterministic heuristic used by the scheduler,
    i.e., base_years = (9 - trl) * 2.5 with a modest uncertainty.

    Params:
        trl_current: Current TRL string (e.g., "6" or "5-6"); used to set the median.
        draws: Number of samples to draw.
        seed: Optional RNG seed.

    Returns:
        NumPy array of sampled durations in years.
    """
    try:
        trl_token = (trl_current or "5").split("-")[0].split()[0]
        trl_val = float(trl_token)
    except Exception:
        trl_val = 5.0
    base_years = max(0.5, (9.0 - trl_val) * 2.5)

    mu = math.log(base_years) - 0.5 * 0.25**2  # so that median ~ base_years
    sigma = 0.25

    with pm.Model() as model:
        duration = pm.Lognormal("duration", mu=mu, sigma=sigma)
        samples = pm.draw(duration, draws=draws, random_seed=seed)
    return np.asarray(samples)


def sample_reactor_twh_per_year(
    avg_capacity_mw: float = 1000.0,
    capacity_factor: float = 0.90,
    draws: int = 1,
    seed: int | None = None,
) -> np.ndarray:
    """
    Sample annual TWh production for a generic reactor.

    Simple multiplicative uncertainty around the base MWh calculation.

    Params:
        avg_capacity_mw: Average plant capacity in MW.
        capacity_factor: Capacity factor (0-1).
        draws: Number of samples to draw.
        seed: Optional RNG seed.

    Returns:
        NumPy array of TWh per year samples (not discounted).
    """
    base_mwh = avg_capacity_mw * capacity_factor * 24 * 365
    base_twh = base_mwh / 1_000_000.0

    # 10% lognormal uncertainty
    mu = math.log(max(1e-6, base_twh)) - 0.5 * 0.10**2
    sigma = 0.10

    with pm.Model() as model:
        twh = pm.Lognormal("twh", mu=mu, sigma=sigma)
        samples = pm.draw(twh, draws=draws, random_seed=seed)
    return np.asarray(samples)
