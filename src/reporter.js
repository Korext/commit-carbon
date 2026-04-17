'use strict';

const yaml = require('js-yaml');

/**
 * Report generator for Commit Carbon.
 *
 * Generates disclosure-ready reports in multiple formats:
 * CSRD, SEC, CDP, GHG Protocol, JSON, Markdown, YAML.
 */

/**
 * Generate a YAML report (default output format for .commit-carbon.yaml).
 */
function generateYamlReport(data) {
  const report = buildReportObject(data);
  return yaml.dump(report, { lineWidth: 80, noRefs: true });
}

/**
 * Generate a JSON report.
 */
function generateJsonReport(data) {
  return JSON.stringify(buildReportObject(data), null, 2);
}

/**
 * Generate a Markdown report.
 */
function generateMarkdownReport(data) {
  const r = data;
  const lines = [
    `# Commit Carbon Report`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    `Methodology: commit-carbon v1.0`,
    ``,
    `## Repository`,
    ``,
    `- Period: ${r.period || 'All time'}`,
    `- Region: ${r.region || 'US'} (${r.gridIntensity} gCO2e/kWh)`,
    ``,
    `## AI Usage Summary`,
    ``,
    `- Total commits: ${r.totalCommits || 'N/A'}`,
    `- AI assisted commits: ${r.result.total_ai_commits}`,
    ``,
    `## Emissions Estimate`,
    ``,
    `| Estimate | kg CO2e |`,
    `|----------|---------|`,
    `| Low | ${r.result.total_kgco2e.low.toFixed(2)} |`,
    `| Central | ${r.result.total_kgco2e.central.toFixed(2)} |`,
    `| High | ${r.result.total_kgco2e.high.toFixed(2)} |`,
    ``,
    `### Per AI Commit Average`,
    ``,
    `| Estimate | g CO2e |`,
    `|----------|--------|`,
    `| Low | ${r.result.per_ai_commit_average_gco2e.low.toFixed(1)} |`,
    `| Central | ${r.result.per_ai_commit_average_gco2e.central.toFixed(1)} |`,
    `| High | ${r.result.per_ai_commit_average_gco2e.high.toFixed(1)} |`,
    ``,
    `### By Tool`,
    ``,
    `| Tool | Commits | Low kg | Central kg | High kg |`,
    `|------|---------|--------|------------|---------|`,
  ];

  for (const t of r.result.by_tool) {
    lines.push(`| ${t.name} | ${t.commits} | ${t.kgco2e.low.toFixed(2)} | ${t.kgco2e.central.toFixed(2)} | ${t.kgco2e.high.toFixed(2)} |`);
  }

  lines.push('', `## Methodology`, '', `Version: 1.0`);
  lines.push(`Published: https://oss.korext.com/commit-carbon/methodology`);
  lines.push(`License: CC0 1.0 Universal (public domain)`);
  lines.push('', `## Data Sources`, '');
  lines.push(`- Grid intensity: IEA / EPA eGRID annual averages`);
  lines.push(`- Tool energy factors: Derived from Luccioni et al. 2023`);
  lines.push(`- Equivalents: EPA Greenhouse Gas Equivalencies Calculator`);
  lines.push('', `## Assumptions`, '');
  lines.push(`- Invocation estimate: 1 per ~20 lines changed (3x for agent tools)`);
  lines.push(`- Conservative bias applied at every calculation step`);
  lines.push(`- Vendor telemetry not available; values derived from academic research`);
  lines.push('', `## Limitations`, '');
  lines.push(`- Does not include training emissions (amortized one-time cost)`);
  lines.push(`- Does not include developer machine emissions (Scope 2)`);
  lines.push(`- Does not include water consumption (planned v2.0)`);
  lines.push(`- Grid data is annual average, not real-time`);

  return lines.join('\n');
}

/**
 * Generate a CSRD disclosure fragment.
 */
function generateCsrdReport(data) {
  const r = data;
  const lines = [
    `# CSRD Disclosure Fragment`,
    `# Topic E1: Climate Change`,
    `# Scope 3, Category 1: Purchased Goods and Services`,
    ``,
    `## AI Coding Tool Emissions`,
    ``,
    `The following emissions are associated with AI coding tool usage`,
    `during the reporting period, calculated using the Commit Carbon`,
    `open methodology (v1.0, CC0 1.0 licensed).`,
    ``,
    `### Reporting Period`,
    ``,
    `${r.period || 'Reporting period not specified'}`,
    ``,
    `### Emissions Data`,
    ``,
    `| Metric | Low | Central | High | Unit |`,
    `|--------|-----|---------|------|------|`,
    `| Total AI coding emissions | ${r.result.total_kgco2e.low.toFixed(2)} | ${r.result.total_kgco2e.central.toFixed(2)} | ${r.result.total_kgco2e.high.toFixed(2)} | kg CO2e |`,
    `| Per AI assisted commit | ${r.result.per_ai_commit_average_gco2e.low.toFixed(1)} | ${r.result.per_ai_commit_average_gco2e.central.toFixed(1)} | ${r.result.per_ai_commit_average_gco2e.high.toFixed(1)} | g CO2e |`,
    ``,
    `### GHG Protocol Alignment`,
    ``,
    `These emissions fall under GHG Protocol Scope 3, Category 1`,
    `(Purchased Goods and Services). AI coding tools are procured`,
    `services whose inference compute generates emissions.`,
    ``,
    `### Methodology`,
    ``,
    `Methodology: Commit Carbon v1.0`,
    `License: CC0 1.0 Universal (public domain)`,
    `Full document: https://oss.korext.com/commit-carbon/methodology`,
    ``,
    `The methodology produces ranged estimates (low/central/high)`,
    `reflecting genuine uncertainty in AI tool energy consumption.`,
    `Conservative bias is applied at every step.`,
    ``,
    `### Uncertainties and Limitations`,
    ``,
    `- AI tool vendors do not publish per-request energy data`,
    `- Estimates are derived from academic inference energy research`,
    `- Grid carbon intensity uses annual averages, not real-time data`,
    `- Training emissions are excluded (one-time amortized cost)`,
    `- Developer workstation emissions are captured separately (Scope 2)`,
    ``,
    `### Data Sources`,
    ``,
    `- Tool energy factors: Luccioni et al. 2023, Patterson et al. 2021`,
    `- Grid intensity: IEA Emissions Factors 2024`,
    `- Equivalents: EPA Greenhouse Gas Equivalencies Calculator`,
  ];

  return lines.join('\n');
}

/**
 * Generate an SEC Climate Rules disclosure fragment.
 */
function generateSecReport(data) {
  const r = data;
  return [
    `# SEC Climate Rules Disclosure Fragment`,
    `# Other Indirect Emissions from Operations`,
    ``,
    `## AI Coding Tool Emissions (Scope 3)`,
    ``,
    `Period: ${r.period || 'Not specified'}`,
    ``,
    `Total emissions from AI coding tool usage:`,
    `${r.result.total_kgco2e.central.toFixed(2)} kg CO2e (central estimate)`,
    `Range: ${r.result.total_kgco2e.low.toFixed(2)} to ${r.result.total_kgco2e.high.toFixed(2)} kg CO2e`,
    ``,
    `AI assisted commits: ${r.result.total_ai_commits}`,
    `Average per AI commit: ${r.result.per_ai_commit_average_gco2e.central.toFixed(1)} g CO2e`,
    ``,
    `Methodology: Commit Carbon v1.0 (CC0 1.0, public domain)`,
    `Full methodology: https://oss.korext.com/commit-carbon/methodology`,
    ``,
    `Note: These estimates reflect genuine uncertainty in AI tool`,
    `energy consumption. Conservative bias is applied. Vendor`,
    `telemetry is not available; values derived from peer-reviewed`,
    `academic research.`,
  ].join('\n');
}

/**
 * Generate a CDP response fragment.
 */
function generateCdpReport(data) {
  const r = data;
  return [
    `# CDP Climate Change Questionnaire Fragment`,
    `# C6.5: Scope 3 Emissions`,
    ``,
    `## Category 1: Purchased Goods and Services`,
    `## Sub-category: AI Coding Tool Usage`,
    ``,
    `Metric tonnes CO2e: ${(r.result.total_kgco2e.central / 1000).toFixed(4)}`,
    `Range: ${(r.result.total_kgco2e.low / 1000).toFixed(4)} to ${(r.result.total_kgco2e.high / 1000).toFixed(4)} (tCO2e)`,
    ``,
    `Activity data: ${r.result.total_ai_commits} AI assisted software commits`,
    `Emission factor source: Commit Carbon v1.0 methodology`,
    `(derived from Luccioni et al. 2023, Patterson et al. 2021)`,
    ``,
    `Methodology: Commit Carbon v1.0`,
    `License: CC0 1.0 Universal (public domain)`,
    `Calculation approach: bottom-up per-commit estimation`,
    ``,
    `Uncertainty: ranged estimates provided (low/central/high).`,
    `Conservative (higher) estimates used by default.`,
  ].join('\n');
}

/**
 * Generate a GHG Protocol Scope 3 report fragment.
 */
function generateGhgReport(data) {
  const r = data;
  return [
    `# GHG Protocol Scope 3 Report Fragment`,
    `# Category 1: Purchased Goods and Services`,
    ``,
    `## AI Coding Tool Emissions`,
    ``,
    `Source category: Digital services (AI coding tools)`,
    `Calculation method: Average-data method (academic inference estimates)`,
    ``,
    `Period: ${r.period || 'Not specified'}`,
    `AI assisted commits: ${r.result.total_ai_commits}`,
    ``,
    `Emissions (kg CO2e):`,
    `  Low:     ${r.result.total_kgco2e.low.toFixed(2)}`,
    `  Central: ${r.result.total_kgco2e.central.toFixed(2)}`,
    `  High:    ${r.result.total_kgco2e.high.toFixed(2)}`,
    ``,
    `Emissions (tCO2e):`,
    `  Low:     ${(r.result.total_kgco2e.low / 1000).toFixed(4)}`,
    `  Central: ${(r.result.total_kgco2e.central / 1000).toFixed(4)}`,
    `  High:    ${(r.result.total_kgco2e.high / 1000).toFixed(4)}`,
    ``,
    `Grid region: ${r.region || 'US'}`,
    `Grid intensity: ${r.gridIntensity} gCO2e/kWh`,
    `Grid data source: IEA Emissions Factors 2024`,
    ``,
    `Methodology: Commit Carbon v1.0 (CC0 1.0)`,
    `Full document: https://oss.korext.com/commit-carbon/methodology`,
  ].join('\n');
}

/**
 * Build the canonical report object used by YAML and JSON outputs.
 */
function buildReportObject(data) {
  return {
    schema: 'https://oss.korext.com/commit-carbon/report-schema',
    version: '1.0',
    methodology_version: '1.0',
    reporting_period: data.period || null,
    region: data.region || 'US',
    grid_intensity_gco2e_per_kwh: data.gridIntensity,
    emissions_estimate: {
      total_kgco2e: data.result.total_kgco2e,
      per_ai_commit_average_gco2e: data.result.per_ai_commit_average_gco2e,
      by_tool: data.result.by_tool,
    },
    total_ai_commits: data.result.total_ai_commits,
    assumptions: {
      completion_energy_basis: 'Luccioni et al. 2023, adjusted for tool class',
      grid_intensity_basis: 'IEA country average 2024',
      invocations_per_commit: '1 per ~20 lines changed (3x for agent tools)',
      conservative_bias_applied: true,
    },
    disclosure_compatibility: {
      csrd: true,
      sec_climate_rules: true,
      cdp: true,
      ghg_protocol_scope: 'Scope 3, Category 1',
      california_sb_253: true,
    },
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate report in specified format.
 * @param {string} format - csrd|sec|cdp|ghg|json|markdown|yaml
 * @param {object} data - { result, region, gridIntensity, period, totalCommits }
 */
function generateReport(format, data) {
  switch (format) {
    case 'csrd': return generateCsrdReport(data);
    case 'sec': return generateSecReport(data);
    case 'cdp': return generateCdpReport(data);
    case 'ghg': return generateGhgReport(data);
    case 'json': return generateJsonReport(data);
    case 'markdown': return generateMarkdownReport(data);
    case 'yaml': return generateYamlReport(data);
    default: return generateYamlReport(data);
  }
}

module.exports = { generateReport, buildReportObject };
