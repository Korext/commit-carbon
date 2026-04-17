# Commit Carbon Methodology v1.0

Released under CC0 1.0 Universal (public domain).

## Overview

Commit Carbon estimates the carbon emissions associated with AI assisted software commits. The estimation combines:

1. AI tool usage data (from ai-attestation)
2. Token generation energy estimates (from emissions factor database)
3. Grid carbon intensity (regional and temporal where available)
4. Conservative bias and uncertainty ranges

## Calculation Formula

For each AI assisted commit:

```
commit_emissions_gco2e =
  estimated_tokens_per_commit /
  1000 *
  energy_per_1k_tokens_watt_seconds /
  3600 *
  grid_intensity_gco2e_per_kwh
```

Where:

- `estimated_tokens_per_commit`: estimated total tokens generated during the commit's AI interactions. Default: 2500 tokens. Scaled by commit size (lines changed * 40, minimum 2500). Agent tools apply a 3x multiplier for multi-step generation.

- `energy_per_1k_tokens_watt_seconds`: from the emissions factor database, tool specific, with low/central/high uncertainty range. Derived from academic inference energy research. Includes data center overhead (PUE 1.2x).

- `grid_intensity_gco2e_per_kwh`: regional grid carbon intensity from data source (IEA annual average by default, real-time from Electricity Maps or WattTime if configured).

## Token Estimation

The default of 2500 tokens per commit accounts for:

- Multiple code completions (some accepted, some rejected, all consuming inference energy)
- Chat interactions for debugging and planning
- Context window tokens consumed in prompt construction
- Conservative bias: errs toward higher count

For commits with more lines changed, tokens scale proportionally (40 tokens per line, minimum 2500). Agent tools (Claude Code, Devin, OpenHands, Cline, GPT Engineer, Bolt) apply a 3x multiplier reflecting sustained multi-turn inference sessions.

This is the most uncertain input in the calculation. We document it openly and invite refinement from tool vendors and researchers.

## Ranged Estimates

Every emission estimate produces three values:

- **Low**: optimistic estimate using low energy factors and clean grid assumptions
- **Central**: most likely estimate using central factors and representative grid data
- **High**: pessimistic estimate using high energy factors and dirty grid assumptions

The ratio between high and low is typically 4x, reflecting genuine uncertainty in AI tool energy consumption. This ratio is documented and justified.

## Uncertainty Treatment

Sources of uncertainty, documented:

1. **Energy per token**: AI tool vendors do not publish per-request energy data. We estimate from inference energy research on models of similar capability and parameter count.

2. **Grid intensity**: hourly data available only for some regions and requires API access. Annual averages used as default fallback. Annual averages smooth real-time variations.

3. **Tokens per commit**: actual token count is private to AI tool vendors. We use conservative estimates based on typical usage patterns and commit size.

4. **Regional attribution**: which grid powers the AI tool's inference? Usually the vendor's data center, not the developer's location. Data centers may be in cleaner or dirtier grids than the developer.

We apply conservative bias at each step, leaning toward higher emissions estimates.

## Scope Alignment

Emissions calculated by Commit Carbon fall under:

- **GHG Protocol** Scope 3, Category 1 (Purchased Goods and Services)
- **CSRD** Topic E1: Climate Change, specifically emissions from supply chain purchased services
- **SEC** proposed rule category "other indirect emissions from operations"

## Data Sources

All data sources are documented in DATA_SOURCES.md with license information.

Primary sources:
- IEA Emissions Factors 2024 (annual grid intensity by country)
- EPA eGRID 2022 (US subnational grid intensity)
- Electricity Maps API (real-time global, optional)
- WattTime API (real-time marginal emissions, optional)
- Luccioni et al. 2023 "Power Hungry Processing" (inference energy baselines)
- Patterson et al. 2021 "Carbon Emissions and Large Neural Network Training"

## Review Process

This methodology is public and open for review. Feedback from climate scientists, sustainability professionals, and AI researchers is incorporated into subsequent versions.

Comment at: https://github.com/korext/commit-carbon/discussions

## Limitations

Known limitations of this methodology:

1. Does not measure training emissions (one time, amortized)
2. Does not measure water consumption (planned v2.0)
3. Does not measure embodied emissions of data center hardware
4. Grid data availability varies by region
5. Vendor telemetry not available; must estimate token counts
6. Annual grid averages smooth real-time variations

Companies using this methodology should document these limitations in their sustainability reports.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-15 | Initial release |
