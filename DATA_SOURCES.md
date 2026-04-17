# Data Sources

All data sources used in Commit Carbon with licensing information.

## Grid Carbon Intensity

### IEA Emissions Factors (Default)
- **Source**: International Energy Agency, World Energy Outlook
- **URL**: https://iea.org
- **Coverage**: Global, country level
- **Granularity**: Annual averages
- **License**: Free with attribution to IEA
- **Update frequency**: Annual
- **Used in**: Default grid adapter, bundled with CLI

### EPA eGRID (US Subnational)
- **Source**: US Environmental Protection Agency, eGRID 2022
- **URL**: https://epa.gov/egrid
- **Coverage**: US subnational (eGRID subregions, mapped to states)
- **Granularity**: Annual averages
- **License**: Public domain (US government work)
- **Update frequency**: Annual
- **Used in**: US subnational grid adapter, bundled with CLI

### Electricity Maps (Real-time, Optional)
- **Source**: Electricity Maps
- **URL**: https://electricitymaps.com
- **Coverage**: Global, zone level
- **Granularity**: Hourly, real-time
- **License**: Commercial (free tier available)
- **API key**: Required for access
- **Used in**: Optional real-time grid adapter

### WattTime (Real-time, Optional)
- **Source**: WattTime
- **URL**: https://watttime.org
- **Coverage**: Global
- **Granularity**: Real-time marginal emissions
- **License**: Commercial
- **API key**: Required for access
- **Used in**: Optional real-time grid adapter

## Energy Factor Sources

### Luccioni et al. 2023
- **Paper**: "Power Hungry Processing: Watts Driving the Cost of AI Deployment"
- **How used**: Primary source for inference energy estimates per token
- **License**: Academic publication (cited, not reproduced)

### Patterson et al. 2021
- **Paper**: "Carbon Emissions and Large Neural Network Training"
- **How used**: Methodological reference for carbon accounting approaches
- **License**: arXiv preprint (cited, not reproduced)

## Equivalents

### EPA Greenhouse Gas Equivalencies Calculator
- **Source**: US EPA
- **URL**: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
- **How used**: Converting kg CO2e to human readable equivalents (miles driven, smartphone charges)
- **License**: Public domain (US government work)

## World Average Fallback

- **Value**: 475 gCO2e/kWh
- **Source**: IEA World Energy Outlook 2024
- **Used when**: No regional grid data available
