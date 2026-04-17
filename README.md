# Commit Carbon

The open standard for measuring AI assisted commit carbon emissions. CSRD, SEC, and CDP compatible disclosure reporting.

[![License: Code](https://img.shields.io/badge/code-Apache%202.0-blue)](LICENSE)
[![License: Methodology](https://img.shields.io/badge/methodology-CC0%201.0-green)](LICENSE-SPEC)
[![License: Data](https://img.shields.io/badge/data-CC%20BY%204.0-orange)](LICENSE-DATA)
[![npm](https://img.shields.io/npm/v/@korext/commit-carbon)](https://www.npmjs.com/package/@korext/commit-carbon)

Regulations now require companies to disclose emissions from digital operations. The EU Corporate Sustainability Reporting Directive (CSRD), California SB 253, and SEC Climate Rules all apply. AI coding tools are part of those operations. But nobody measures AI coding emissions at the code level.

Commit Carbon does.

## Quick Start

```bash
# Get your AI attestation first
npx @korext/ai-attestation init

# Calculate carbon emissions
npx @korext/commit-carbon scan
```

## Example Output

```
Commit Carbon v1.0.0

Repository: acme/payments-service
Period: All time
Grid region: US (avg 369 gCO2e/kWh)

AI Usage:
  Total commits: 1,247
  AI assisted: 438 (35.1%)
  Tools: GitHub Copilot, Cursor, Claude Code

Emissions Estimate:

  Low:     7.30 kg CO2e
  Central: 14.59 kg CO2e
  High:    29.18 kg CO2e

  Per AI commit average:
    33.3 g CO2e (central)

  For context:
    Equivalent to driving ~36 miles in an average car
    Equivalent to ~1,775 smartphone charges
```

## What Makes This Different

- **First code level methodology**: others measure aggregate AI emissions. We measure per commit.
- **Public methodology**: CC0 licensed. No vendor lock in. Any tool can implement.
- **Regulatory alignment**: CSRD, SEC, CDP, GHG Protocol Scope 3 compatible outputs.
- **Auditable**: every number is sourced. Every calculation is reproducible.
- **Conservative bias**: higher emission estimates by default. No greenwashing.
- **Ranged estimates**: low/central/high. Reflects genuine uncertainty.

## Disclosure Formats

```bash
# CSRD disclosure
npx @korext/commit-carbon report --format csrd

# SEC Climate Rules
npx @korext/commit-carbon report --format sec

# CDP response
npx @korext/commit-carbon report --format cdp

# GHG Protocol Scope 3
npx @korext/commit-carbon report --format ghg
```

## Methodology

Published at [oss.korext.com/commit-carbon/methodology](https://oss.korext.com/commit-carbon/methodology).

See [METHODOLOGY.md](METHODOLOGY.md) for the complete document.

## Regulatory Frameworks

| Framework | Geography | Compatibility |
|-----------|-----------|---------------|
| CSRD | EU | Direct disclosure format |
| SEC Climate Rules | US | Direct disclosure format |
| California SB 253 | US (CA) | Scope 3 compatible |
| CDP | Global | Direct format |
| GHG Protocol | Global | Scope 3 Category 1 |
| SBTi | Global | Target setting compatible |
| ISO 14064 | Global | Methodology aligned |

## For Sustainability Teams

Free. Open. Auditable. See [AUDIT_GUIDE.md](AUDIT_GUIDE.md) for verification procedures.

## Grid Data

| Source | Coverage | Granularity | API Key |
|--------|----------|-------------|---------|
| IEA | Global (country) | Annual | Not needed |
| EPA eGRID | US (subnational) | Annual | Not needed |
| Electricity Maps | Global (zone) | Real-time | Optional |
| WattTime | Global | Real-time | Required |

## CI/CD Integration

```yaml
- uses: korext/commit-carbon/action@v1
  with:
    region: US
    period: last_month
    max-emissions-kg: 50
```

## Other Commands

```bash
# One-off calculation
npx @korext/commit-carbon calculate --tool copilot --commits 100 --region US

# View grid intensity
npx @korext/commit-carbon grid US
npx @korext/commit-carbon grid --list

# View emissions factors
npx @korext/commit-carbon factors
```

## Relationship to Other Projects

Commit Carbon extends [ai-attestation](https://oss.korext.com/ai-attestation) with carbon data. Can be used alongside [ai-license](https://oss.korext.com/ai-license), [supply-chain-attestation](https://oss.korext.com/supply-chain), [ai-incident-registry](https://oss.korext.com/incidents), [ai-regression-database](https://oss.korext.com/regressions), and [ai-code-radar](https://oss.korext.com/radar).

## Licensing

- Code: Apache 2.0
- Methodology and schema: CC0 1.0 (public domain)
- Data: CC BY 4.0 (attribution required)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Particularly welcome: methodology improvements, grid data adapters, regional factor refinements, citation updates.

## Built by

[Korext](https://korext.com) builds AI code governance tools.
