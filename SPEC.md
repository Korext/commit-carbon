# Commit Carbon Specification

Version 1.0
Released under CC0 1.0 Universal (public domain).

## What This Is

Commit Carbon is an open standard for calculating and reporting the carbon footprint of software commits, particularly those assisted by AI coding tools. It extends the ai-attestation standard with emissions estimates suitable for corporate sustainability disclosure.

## Why This Exists

Regulations including the EU Corporate Sustainability Reporting Directive (CSRD), California SB 253, and the SEC Climate Rules require companies to disclose emissions from their operations. AI coding tools are increasingly part of those operations. Without standardized methodology, companies either ignore AI coding emissions, guess, or rely on vendor published aggregates that cannot be independently verified.

Commit Carbon provides the first standardized, auditable, reproducible methodology for calculating AI coding emissions at the commit level.

## Scope

Commit Carbon covers:

- Operational emissions from AI coding tool usage (inference emissions for completions, chat, agents)
- Commit level granularity: each commit can be attributed emissions based on AI tool usage in its creation
- Regional grid carbon intensity at time of commit (where data is available)

Commit Carbon does NOT cover:

- Training emissions (one time cost amortized across users, see academic literature)
- Developer machine emissions (captured by separate Scope 2 accounting)
- Network transit emissions (small, usually ignored per GHG Protocol guidance)
- Water footprint (planned for v2.0 methodology)
- Embodied emissions in data center hardware (upstream Scope 3)

## What This Is Not

Commit Carbon is not a compliance tool. It provides data for compliance reporting. Legal determination of compliance is the responsibility of the company and its auditors.

Commit Carbon is not a greenwashing instrument. Default parameters are conservative. The methodology is transparent. Results are auditable.

## Output Schema

Running `commit-carbon scan` produces a `.commit-carbon.yaml` file with the following structure:

```yaml
schema: https://oss.korext.com/commit-carbon/output-schema
generated: 2026-04-15T12:00:00Z
methodology_version: "1.0"
repository: acme/payments-service
period: all
region: US
grid_intensity_gco2e_per_kwh: 369
total_commits: 1247
total_ai_commits: 438
tools:
  - id: copilot
    name: GitHub Copilot
    commits: 438
    emissions_kgco2e:
      low: 7.30
      central: 14.59
      high: 29.18
total_emissions_kgco2e:
  low: 7.30
  central: 14.59
  high: 29.18
per_ai_commit_average_gco2e:
  low: 16.7
  central: 33.3
  high: 66.6
confidence: central
```

## Report Schema

A Commit Carbon report contains:

- Repository identification
- Reporting period
- AI usage summary (commits, tools, percentages)
- Emissions estimate with low/central/high ranges
- Per commit averages
- Tool breakdown
- Grid context (region, intensity, data source)
- Assumptions documentation
- Disclosure format compatibility flags
- Generation timestamp and methodology version

See `factors.yaml` for the emissions factor schema.

## Regulatory Alignment

| Framework | Geography | Compatibility |
|-----------|-----------|---------------|
| CSRD | EU | Scope 3 disclosure format |
| SEC Climate Rules | US | Other indirect emissions |
| California SB 253 | US (CA) | Scope 3 compatible |
| CDP | Global | Climate questionnaire format |
| GHG Protocol | Global | Scope 3 Category 1 |
| SBTi | Global | Target setting compatible |
| ISO 14064 | Global | Methodology aligned |

## Licensing

- Specification and methodology: CC0 1.0 Universal (public domain)
- Data (emissions factors, reports): CC BY 4.0
- Code (CLI, Action, web): Apache 2.0

The methodology being public domain is critical. Regulators, auditors, and sustainability teams need to adopt and reference it without attribution burden or licensing friction.
