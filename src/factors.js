'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Load emissions factors from bundled factors.yaml.
 * Falls back to remote API for freshness, but always works offline.
 */
function loadFactors() {
  const factorsPath = path.join(__dirname, '..', 'factors.yaml');
  const raw = fs.readFileSync(factorsPath, 'utf8');
  return yaml.load(raw);
}

/**
 * Get the emissions factor for a specific tool.
 */
function getToolFactor(factors, toolId) {
  return factors.ai_tools.find(t => t.id === toolId) || null;
}

/**
 * Get grid intensity for a region.
 * Returns gCO2e/kWh.
 */
function getGridIntensity(factors, region) {
  if (!region) return factors.default_fallback.world_average_gco2e_per_kwh;
  const upper = region.toUpperCase();
  return factors.region_averages[upper] || factors.default_fallback.world_average_gco2e_per_kwh;
}

module.exports = { loadFactors, getToolFactor, getGridIntensity };
