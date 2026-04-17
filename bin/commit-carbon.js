#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { loadFactors, getToolFactor, getGridIntensity } = require('../src/factors');
const { calculateAggregate, getEquivalents } = require('../src/calculator');
const { generateReport } = require('../src/reporter');

const VERSION = '1.0.0';

// ── Helpers ──

function bold(s) { return process.stdout.isTTY ? `\x1b[1m${s}\x1b[0m` : s; }
function green(s) { return process.stdout.isTTY ? `\x1b[32m${s}\x1b[0m` : s; }
function cyan(s) { return process.stdout.isTTY ? `\x1b[36m${s}\x1b[0m` : s; }
function dim(s) { return process.stdout.isTTY ? `\x1b[2m${s}\x1b[0m` : s; }
function yellow(s) { return process.stdout.isTTY ? `\x1b[33m${s}\x1b[0m` : s; }

function printVersion() {
  console.log(`Commit Carbon v${VERSION}`);
}

function printHelp() {
  console.log(`
${bold('Commit Carbon')} v${VERSION}
The open standard for measuring AI assisted commit carbon emissions.

${bold('Usage:')}
  commit-carbon <command> [options]

${bold('Commands:')}
  scan          Calculate emissions from .ai-attestation.yaml
  report        Generate formatted disclosure report
  calculate     One-off calculation (interactive or flags)
  grid          Query grid intensity for a region
  factors       View current emissions factors

${bold('Options:')}
  --help        Show this help message
  --version     Show version number

${bold('Examples:')}
  ${dim('# Scan current repo')}
  npx @korext/commit-carbon scan

  ${dim('# Generate CSRD disclosure')}
  npx @korext/commit-carbon report --format csrd

  ${dim('# Quick calculation')}
  npx @korext/commit-carbon calculate --tool copilot --commits 100 --region US

  ${dim('# Check grid intensity')}
  npx @korext/commit-carbon grid US

${dim('Methodology: https://oss.korext.com/commit-carbon/methodology')}
${dim('Factors: CC0 1.0 (public domain). Code: Apache 2.0.')}
`);
}

// ── SCAN command ──

function cmdScan(args) {
  const region = getFlag(args, '--region') || detectRegion();
  const period = getFlag(args, '--period') || 'all';
  const output = getFlag(args, '--output') || '.commit-carbon.yaml';

  // Look for .ai-attestation.yaml
  const attestPath = path.join(process.cwd(), '.ai-attestation.yaml');
  if (!fs.existsSync(attestPath)) {
    console.error(`${bold('Error:')} No .ai-attestation.yaml found.`);
    console.error(`Run ${cyan('npx @korext/ai-attestation init')} first.\n`);
    process.exit(1);
  }

  const attestation = yaml.load(fs.readFileSync(attestPath, 'utf8'));
  const factors = loadFactors();
  const gridIntensity = getGridIntensity(factors, region);

  // Extract tool usage from attestation
  const toolEntries = extractToolUsage(attestation);
  if (toolEntries.length === 0) {
    console.log(`\n${bold('Commit Carbon')} v${VERSION}\n`);
    console.log(`No AI assisted commits found in attestation.\n`);
    console.log(`Emissions: ${green('0 kg CO2e')}\n`);
    return;
  }

  const totalCommits = (attestation.range && attestation.range.commits)
    ? attestation.range.commits
    : 0;
  const totalAiCommits = toolEntries.reduce((s, t) => s + t.commits, 0);

  const result = calculateAggregate({ tools: toolEntries, factors, gridIntensity });
  const equiv = getEquivalents(result.total_kgco2e.central);

  // Print results
  console.log(`\n${bold('Commit Carbon')} v${VERSION}\n`);
  console.log(`Repository: ${(attestation.repo && attestation.repo.name) || process.cwd()}`);
  console.log(`Period: ${period === 'all' ? 'All time' : period}`);
  console.log(`Grid region: ${region.toUpperCase()} (avg ${gridIntensity} gCO2e/kWh)\n`);

  console.log(`${bold('AI Usage:')}`);
  if (totalCommits > 0) {
    const pct = ((totalAiCommits / totalCommits) * 100).toFixed(1);
    console.log(`  Total commits: ${totalCommits.toLocaleString()}`);
    console.log(`  AI assisted: ${totalAiCommits.toLocaleString()} (${pct}%)`);
  } else {
    console.log(`  AI assisted commits: ${totalAiCommits.toLocaleString()}`);
  }
  console.log(`  Tools: ${toolEntries.map(t => t.name || t.tool).join(', ')}\n`);

  console.log(`${bold('Emissions Estimate:')}\n`);
  console.log(`  Low:     ${formatKg(result.total_kgco2e.low)}`);
  console.log(`  Central: ${green(formatKg(result.total_kgco2e.central))}`);
  console.log(`  High:    ${formatKg(result.total_kgco2e.high)}\n`);

  console.log(`  Per AI commit average:`);
  console.log(`    ${result.per_ai_commit_average_gco2e.central.toFixed(1)} g CO2e (central)\n`);

  console.log(`  ${dim('For context:')}`);
  console.log(`    ${dim(`Equivalent to driving ~${equiv.driving_miles} miles in an average car`)}`);
  console.log(`    ${dim(`Equivalent to ~${equiv.light_bulb_hours} hours of a 100W light bulb`)}`);
  console.log(`    ${dim(`Equivalent to ~${equiv.smartphone_charges} smartphone charges`)}\n`);

  console.log(`  Confidence: central`);
  console.log(`  Methodology: commit-carbon v1.0\n`);

  // Write report file
  const reportData = { result, region, gridIntensity, period, totalCommits };
  const yamlOutput = generateReport('yaml', reportData);
  fs.writeFileSync(path.join(process.cwd(), output), yamlOutput);
  console.log(`  Report: ${green(output)}\n`);

  console.log(`  Generate disclosure report:`);
  console.log(`  ${cyan('npx @korext/commit-carbon report --format csrd')}\n`);
}

// ── REPORT command ──

function cmdReport(args) {
  const format = getFlag(args, '--format') || 'markdown';
  const region = getFlag(args, '--region') || detectRegion();
  const output = getFlag(args, '--output');

  const attestPath = path.join(process.cwd(), '.ai-attestation.yaml');
  if (!fs.existsSync(attestPath)) {
    console.error(`${bold('Error:')} No .ai-attestation.yaml found.`);
    process.exit(1);
  }

  const attestation = yaml.load(fs.readFileSync(attestPath, 'utf8'));
  const factors = loadFactors();
  const gridIntensity = getGridIntensity(factors, region);
  const toolEntries = extractToolUsage(attestation);
  const totalCommits = (attestation.range && attestation.range.commits) ? attestation.range.commits : 0;

  const result = calculateAggregate({ tools: toolEntries, factors, gridIntensity });
  const reportData = { result, region, gridIntensity, period: 'all', totalCommits };
  const report = generateReport(format, reportData);

  if (output) {
    fs.writeFileSync(path.join(process.cwd(), output), report);
    console.log(`Report written to ${green(output)}`);
  } else {
    console.log(report);
  }
}

// ── CALCULATE command ──

function cmdCalculate(args) {
  const toolId = getFlag(args, '--tool');
  const commits = parseInt(getFlag(args, '--commits') || '100', 10);
  const region = getFlag(args, '--region') || 'US';

  if (!toolId) {
    console.error(`${bold('Usage:')} commit-carbon calculate --tool <tool-id> --commits <n> --region <code>`);
    console.error(`\nAvailable tools:`);
    const factors = loadFactors();
    for (const t of factors.ai_tools) {
      console.error(`  ${t.id.padEnd(20)} ${t.name}`);
    }
    process.exit(1);
  }

  const factors = loadFactors();
  const gridIntensity = getGridIntensity(factors, region);
  const toolEntries = [{ tool: toolId, commits }];

  const result = calculateAggregate({ tools: toolEntries, factors, gridIntensity });
  const equiv = getEquivalents(result.total_kgco2e.central);

  console.log(`\n${bold('Commit Carbon')} v${VERSION}\n`);
  console.log(`Tool: ${toolId}`);
  console.log(`AI commits: ${commits}`);
  console.log(`Region: ${region.toUpperCase()} (${gridIntensity} gCO2e/kWh)\n`);

  console.log(`${bold('Estimated emissions:')}`);
  console.log(`  Low:     ${formatKg(result.total_kgco2e.low)}`);
  console.log(`  Central: ${green(formatKg(result.total_kgco2e.central))}`);
  console.log(`  High:    ${formatKg(result.total_kgco2e.high)}\n`);

  console.log(`  Per commit: ${result.per_ai_commit_average_gco2e.central.toFixed(1)} g CO2e\n`);

  console.log(`  ${dim(`~ ${equiv.driving_miles} miles driven`)}`);
  console.log(`  ${dim(`~ ${equiv.smartphone_charges} smartphone charges`)}\n`);
}

// ── GRID command ──

function cmdGrid(args) {
  const region = args[0] || 'US';

  if (region === '--list') {
    const factors = loadFactors();
    console.log(`\n${bold('Grid Carbon Intensity by Region')}\n`);
    console.log(`${'Region'.padEnd(8)} ${'gCO2e/kWh'.padStart(12)}`);
    console.log(`${''.padEnd(8, '-')} ${''.padEnd(12, '-')}`);
    const sorted = Object.entries(factors.region_averages)
      .sort((a, b) => a[1] - b[1]);
    for (const [code, val] of sorted) {
      const color = val < 100 ? green : val > 500 ? yellow : (s => s);
      console.log(`${code.padEnd(8)} ${color(String(val).padStart(12))}`);
    }
    console.log(`\n${dim('Source: IEA Emissions Factors 2024')}\n`);
    return;
  }

  const factors = loadFactors();
  const intensity = getGridIntensity(factors, region);
  const upper = region.toUpperCase();

  console.log(`\n${bold('Grid Carbon Intensity')}\n`);
  console.log(`Region: ${upper}`);
  console.log(`Intensity: ${intensity} gCO2e/kWh`);
  console.log(`Source: IEA annual average 2024\n`);

  if (intensity < 100) {
    console.log(green(`  Very clean grid. Low carbon intensity.`));
  } else if (intensity < 300) {
    console.log(`  Moderate carbon intensity.`);
  } else if (intensity < 500) {
    console.log(yellow(`  Above average carbon intensity.`));
  } else {
    console.log(yellow(`  High carbon intensity grid.`));
  }
  console.log();
}

// ── FACTORS command ──

function cmdFactors() {
  const factors = loadFactors();

  console.log(`\n${bold('Commit Carbon Emissions Factors')}`);
  console.log(`Methodology: v${factors.methodology_version}`);
  console.log(`Last updated: ${factors.last_updated}\n`);

  console.log(`${'Tool'.padEnd(24)} ${'Low (Ws)'.padStart(10)} ${'Central'.padStart(10)} ${'High'.padStart(10)} ${'Source'.padStart(30)}`);
  console.log(`${''.padEnd(24, '-')} ${''.padEnd(10, '-')} ${''.padEnd(10, '-')} ${''.padEnd(10, '-')} ${''.padEnd(30, '-')}`);

  for (const t of factors.ai_tools) {
    const e = t.completion_energy_estimates;
    const src = t.sources && t.sources[0] ? t.sources[0].citation : 'N/A';
    console.log(
      `${t.name.padEnd(24)} ${String(e.low_watts_seconds).padStart(10)} ${String(e.central_watts_seconds).padStart(10)} ${String(e.high_watts_seconds).padStart(10)} ${src.substring(0, 30).padStart(30)}`
    );
  }

  console.log(`\n${dim('All factors independently derived. See METHODOLOGY.md for details.')}`);
  console.log(`${dim('License: CC0 1.0 (public domain)')}\n`);
}

// ── Utilities ──

function getFlag(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

function detectRegion() {
  // Try to detect from timezone.
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('America/')) return 'US';
    if (tz.startsWith('Europe/London')) return 'GB';
    if (tz.startsWith('Europe/Paris')) return 'FR';
    if (tz.startsWith('Europe/Berlin')) return 'DE';
    if (tz.startsWith('Europe/')) return 'EU';
    if (tz.startsWith('Asia/Tokyo')) return 'JP';
    if (tz.startsWith('Asia/Shanghai') || tz.startsWith('Asia/Beijing')) return 'CN';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'IN';
    if (tz.startsWith('Australia/')) return 'AU';
  } catch {
    // Ignore
  }
  return 'US';
}

function extractToolUsage(attestation) {
  const tools = [];
  // Support both schema layouts:
  //   attestation.ai.tools (current ai-attestation v1.0 schema)
  //   attestation.tools    (legacy / flat layout)
  const toolSource = (attestation.ai && attestation.ai.tools) || attestation.tools || [];
  for (const t of toolSource) {
    const commitCount = t.commit_count || t.commits || 0;
    if (commitCount > 0) {
      tools.push({
        tool: normalizeToolId(t.name || t.identifier || t.id || ''),
        name: t.name || t.identifier || t.id || '',
        commits: commitCount,
        avgLinesPerCommit: t.avg_lines_per_commit || 50,
      });
    }
  }
  return tools;
}

function normalizeToolId(name) {
  const map = {
    'github copilot': 'copilot',
    'copilot': 'copilot',
    'cursor': 'cursor',
    'claude code': 'claude-code',
    'claude-code': 'claude-code',
    'codeium': 'codeium',
    'aider': 'aider',
    'openai codex cli': 'codex-cli',
    'codex cli': 'codex-cli',
    'codex-cli': 'codex-cli',
    'gemini code assist': 'gemini-code-assist',
    'windsurf': 'windsurf',
    'tabnine': 'tabnine',
    'devin': 'devin',
    'openhands': 'openhands',
    'amazon q developer': 'amazon-q',
    'amazon q': 'amazon-q',
    'amazon-q': 'amazon-q',
    'jetbrains ai assistant': 'jetbrains-ai',
    'jetbrains ai': 'jetbrains-ai',
    'jetbrains-ai': 'jetbrains-ai',
    'sourcegraph cody': 'sourcegraph-cody',
    'cody': 'sourcegraph-cody',
    'replit ai': 'replit-ai',
    'replit': 'replit-ai',
    'cline': 'cline',
    'continue': 'continue',
    'gpt engineer': 'gpt-engineer',
    'gpt-engineer': 'gpt-engineer',
    'bolt': 'bolt',
  };
  return map[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '-');
}

function formatKg(val) {
  if (val < 0.01) return `${(val * 1000).toFixed(1)} g CO2e`;
  return `${val.toFixed(2)} kg CO2e`;
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    printVersion();
    return;
  }

  const subArgs = args.slice(1);

  switch (command) {
    case 'scan': cmdScan(subArgs); break;
    case 'report': cmdReport(subArgs); break;
    case 'calculate': cmdCalculate(subArgs); break;
    case 'grid': cmdGrid(subArgs); break;
    case 'factors': cmdFactors(subArgs); break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main();
