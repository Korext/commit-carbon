'use strict';

/**
 * IEA Grid Intensity Adapter
 *
 * Default adapter. No API key required. Uses bundled annual averages.
 * Data source: IEA World Energy Outlook, Emissions Factors (annual).
 * License: Free with attribution to IEA.
 */

const { loadFactors } = require('../factors');

class IEAAdapter {
  constructor() {
    this.id = 'iea';
    this.factors = null;
  }

  getId() { return this.id; }
  supportsRealtime() { return false; }
  supportsHourly() { return false; }
  supportsAnnual() { return true; }

  _ensureLoaded() {
    if (!this.factors) this.factors = loadFactors();
  }

  getAnnualAverage(region) {
    this._ensureLoaded();
    const upper = (region || '').toUpperCase();
    return this.factors.region_averages[upper]
      || this.factors.default_fallback.world_average_gco2e_per_kwh;
  }

  async getRealtime() {
    throw new Error('IEA adapter does not support real-time data');
  }

  async getHourlyAverage(region) {
    return this.getAnnualAverage(region);
  }

  listRegions() {
    this._ensureLoaded();
    return Object.keys(this.factors.region_averages);
  }
}

module.exports = { IEAAdapter };
