'use strict';

/**
 * Commit Carbon Calculation Engine
 *
 * Every calculation is reproducible from its inputs.
 * Every assumption is documented. Conservative bias at every step.
 *
 * Methodology v1.0: Token-based estimation.
 *
 * Formula:
 *   commit_emissions_gco2e =
 *     estimated_tokens_per_commit *
 *     energy_per_1k_tokens_kwh *
 *     grid_intensity_gco2e_per_kwh
 *
 * Tokens per commit default: 2500 (conservative estimate based on
 * average completion size, multiple completions per commit, and
 * rejected completions that still consume inference energy).
 */

const DEFAULT_TOKENS_PER_COMMIT = 2500;
const AGENT_MULTIPLIER = 3;

/**
 * Estimate tokens generated per commit.
 *
 * @param {number} linesChanged - additions + deletions
 * @param {string} toolId - AI tool identifier
 * @returns {number} estimated tokens
 */
function estimateTokens(linesChanged, toolId) {
  // Base: 2500 tokens per commit (accounts for completions,
  // rejected suggestions that still consume energy, chat context).
  // Scale up for commits with more lines changed.
  const lines = linesChanged || 50;
  const base = Math.max(DEFAULT_TOKENS_PER_COMMIT, lines * 40);

  const agentTools = [
    'claude-code', 'devin', 'openhands', 'cline',
    'gpt-engineer', 'bolt'
  ];

  if (agentTools.includes(toolId)) {
    return base * AGENT_MULTIPLIER;
  }

  return base;
}

/**
 * Calculate emissions for a single commit.
 *
 * @param {object} params
 * @param {string} params.toolId - AI tool identifier
 * @param {number} params.linesChanged - lines added + deleted
 * @param {object} params.toolFactor - factor entry from factors.yaml
 * @param {number} params.gridIntensity - gCO2e/kWh for the region
 * @returns {{ low: number, central: number, high: number, inputs: object }}
 */
function calculateCommitEmissions({ toolId, linesChanged, toolFactor, gridIntensity }) {
  if (!toolFactor) {
    return {
      low: 0, central: 0, high: 0,
      notes: ['Tool not found in emissions factor database']
    };
  }

  const tokens = estimateTokens(linesChanged, toolId);
  const tokenBatches = tokens / 1000;

  const chat = toolFactor.chat_energy_estimates;

  // Convert watt-seconds to kWh, then multiply by grid intensity.
  const calc = (wsPerBatch) => {
    const kWh = (wsPerBatch * tokenBatches) / 3600;
    return kWh * gridIntensity;
  };

  const low = calc(chat.low_watts_seconds_per_1k_tokens);
  const central = calc(chat.central_watts_seconds_per_1k_tokens);
  const high = calc(chat.high_watts_seconds_per_1k_tokens);

  return {
    low,
    central,
    high,
    inputs: {
      tool: toolId,
      estimated_tokens: tokens,
      energy_low_ws_per_1k: chat.low_watts_seconds_per_1k_tokens,
      energy_central_ws_per_1k: chat.central_watts_seconds_per_1k_tokens,
      energy_high_ws_per_1k: chat.high_watts_seconds_per_1k_tokens,
      grid_intensity_gco2e_per_kwh: gridIntensity,
    }
  };
}

/**
 * Calculate aggregate emissions for a batch of commits.
 *
 * @param {object} params
 * @param {Array<{tool: string, commits: number, avgLinesPerCommit?: number}>} params.tools
 * @param {object} params.factors - loaded factors database
 * @param {number} params.gridIntensity - gCO2e/kWh
 * @returns {object} Full emissions breakdown
 */
function calculateAggregate({ tools, factors, gridIntensity }) {
  let totalLow = 0;
  let totalCentral = 0;
  let totalHigh = 0;
  let totalAiCommits = 0;
  const byTool = [];

  for (const entry of tools) {
    const toolFactor = factors.ai_tools.find(t => t.id === entry.tool);
    const commits = entry.commits || 0;
    const avgLines = entry.avgLinesPerCommit || 50;
    totalAiCommits += commits;

    let toolLow = 0;
    let toolCentral = 0;
    let toolHigh = 0;

    for (let i = 0; i < commits; i++) {
      const result = calculateCommitEmissions({
        toolId: entry.tool,
        linesChanged: avgLines,
        toolFactor,
        gridIntensity,
      });
      toolLow += result.low;
      toolCentral += result.central;
      toolHigh += result.high;
    }

    totalLow += toolLow;
    totalCentral += toolCentral;
    totalHigh += toolHigh;

    byTool.push({
      tool: entry.tool,
      name: toolFactor ? toolFactor.name : entry.tool,
      commits,
      kgco2e: {
        low: toolLow / 1000,
        central: toolCentral / 1000,
        high: toolHigh / 1000,
      },
    });
  }

  return {
    total_gco2e: {
      low: totalLow,
      central: totalCentral,
      high: totalHigh,
    },
    total_kgco2e: {
      low: totalLow / 1000,
      central: totalCentral / 1000,
      high: totalHigh / 1000,
    },
    per_ai_commit_average_gco2e: totalAiCommits > 0 ? {
      low: totalLow / totalAiCommits,
      central: totalCentral / totalAiCommits,
      high: totalHigh / totalAiCommits,
    } : { low: 0, central: 0, high: 0 },
    total_ai_commits: totalAiCommits,
    by_tool: byTool,
    grid_intensity_gco2e_per_kwh: gridIntensity,
  };
}

/**
 * Get human readable equivalents for kg CO2e.
 * Based on EPA Greenhouse Gas Equivalencies Calculator.
 * Source: https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator
 */
function getEquivalents(kgCo2e) {
  return {
    driving_miles: Math.round(kgCo2e / 0.404 * 10) / 10,
    light_bulb_hours: Math.round(kgCo2e / 0.00617 * 10) / 10,
    smartphone_charges: Math.round(kgCo2e / 0.00822 * 10) / 10,
    tree_days_absorbed: Math.round(kgCo2e / 0.06 * 10) / 10,
  };
}

module.exports = {
  estimateTokens,
  calculateCommitEmissions,
  calculateAggregate,
  getEquivalents
};

