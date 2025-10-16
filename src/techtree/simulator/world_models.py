from __future__ import annotations

import math

try:  # Optional PyMC dependency
    import pymc as pm  # type: ignore
    _HAS_PYMC = True
except Exception:  # pragma: no cover - optional
    pm = None  # type: ignore
    _HAS_PYMC = False

import numpy as np


def _rng(seed: int | None) -> np.random.Generator:
    return np.random.default_rng(seed)


def sample_milestone_duration(trl_current: str | None, draws: int = 1, seed: int | None = None) -> np.ndarray:
    """Sample milestone duration (years) given a TRL string.

    Uses a lognormal model centered around the deterministic heuristic used by the scheduler,
    i.e., base_years = (9 - trl) * 2.5 with a modest uncertainty.
    Falls back to a NumPy sampler if PyMC is unavailable.
    """
    try:
        trl_token = (trl_current or "5").split("-")[0].split()[0]
        trl_val = float(trl_token)
    except Exception:
        trl_val = 5.0
    base_years = max(0.5, (9.0 - trl_val) * 2.5)

    mu = math.log(base_years) - 0.5 * 0.25**2  # so that median ~ base_years
    sigma = 0.25

    if _HAS_PYMC:  # Use PyMC to define a simple model and draw posterior predictive samples
        with pm.Model() as model:  # pragma: no cover (treated similarly to numpy fallback)
            duration = pm.Lognormal("duration", mu=mu, sigma=sigma)
            samples = pm.draw(duration, draws=draws, random_seed=seed)
        return np.asarray(samples)
    else:
        rng = _rng(seed)
        return rng.lognormal(mean=mu, sigma=sigma, size=draws)


def sample_reactor_twh_per_year(
    avg_capacity_mw: float = 1000.0,
    capacity_factor: float = 0.90,
    draws: int = 1,
    seed: int | None = None,
) -> np.ndarray:
    """Sample annual TWh production for a generic reactor.

    Simple multiplicative uncertainty around the base MWh calculation.
    Returns TWh per year (not discounted)."""
    base_mwh = avg_capacity_mw * capacity_factor * 24 * 365
    base_twh = base_mwh / 1_000_000.0

    # 10% lognormal uncertainty
    mu = math.log(max(1e-6, base_twh)) - 0.5 * 0.10**2
    sigma = 0.10

    if _HAS_PYMC:  # pragma: no cover
        with pm.Model() as model:
            twh = pm.Lognormal("twh", mu=mu, sigma=sigma)
            samples = pm.draw(twh, draws=draws, random_seed=seed)
        return np.asarray(samples)
    else:
        rng = _rng(seed)
        return rng.lognormal(mean=mu, sigma=sigma, size=draws)
