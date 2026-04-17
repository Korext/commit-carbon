#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { loadFactors, getGridIntensity } = require('../src/factors');
const { calculateAggregate } = require('../src/calculator');

// GitHub Actions core helpers (no dependency, implemented inline).
function getInput(name) {
  return process.env[`INPUT_${name.replace(/-/g, '_').toUpperCase()}`] || '';
}
function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `${name}=${value}\n`);
  }
}
function info(msg) { console.log(msg); }
function warning(msg) { console.log(`::warning::${msg}`); }
function setFailed(msg) { console.log(`::error::${msg}`); process.exitCode = 1; }

async function run() {
  try {
    const region = getInput('region') || 'US';
    const maxKg = getInput('max-emissions-kg');

    const attestPath = path.join(process.cwd(), '.ai-attestation.yaml');
    if (!fs.existsSync(attestPath)) {
      warning('No .ai-attestation.yaml found. Run npx @korext/ai-attestation init first.');
      setOutput('status', 'SKIP');
      return;
    }

    const attestation = yaml.load(fs.readFileSync(attestPath, 'utf8'));
    const factors = loadFactors();
    const gridIntensity = getGridIntensity(factors, region);

    // Extract tools
    const toolEntries = [];
    if (attestation.tools) {
      for (const t of attestation.tools) {
        if (t.commits && t.commits > 0) {
          toolEntries.push({
            tool: t.id || t.name.toLowerCase().replace(/\s+/g, '-'),
            commits: t.commits,
          });
        }
      }
    }

    if (toolEntries.length === 0) {
      info('No AI assisted commits found.');
      setOutput('emissions-kg-central', '0');
      setOutput('status', 'PASS');
      return;
    }

    const result = calculateAggregate({ tools: toolEntries, factors, gridIntensity });

    info(`Commit Carbon: ${result.total_kgco2e.central.toFixed(2)} kg CO2e (central)`);
    info(`Range: ${result.total_kgco2e.low.toFixed(2)} - ${result.total_kgco2e.high.toFixed(2)} kg CO2e`);
    info(`AI commits: ${result.total_ai_commits}`);
    info(`Per commit: ${result.per_ai_commit_average_gco2e.central.toFixed(1)} g CO2e`);
    info(`Region: ${region.toUpperCase()} (${gridIntensity} gCO2e/kWh)`);

    setOutput('emissions-kg-central', result.total_kgco2e.central.toFixed(2));
    setOutput('emissions-kg-low', result.total_kgco2e.low.toFixed(2));
    setOutput('emissions-kg-high', result.total_kgco2e.high.toFixed(2));
    setOutput('per-commit-average', result.per_ai_commit_average_gco2e.central.toFixed(1));
    setOutput('region-intensity', String(gridIntensity));

    if (maxKg && result.total_kgco2e.central > parseFloat(maxKg)) {
      setFailed(`Emissions ${result.total_kgco2e.central.toFixed(2)} kg exceeds threshold ${maxKg} kg`);
      setOutput('status', 'FAIL');
    } else {
      setOutput('status', 'PASS');
    }
  } catch (err) {
    setFailed(err.message);
  }
}

run();
