'use strict';

/**
 * Electricity Maps Grid Intensity Adapter
 *
 * Real-time and hourly grid carbon intensity.
 * Requires API key for production. Free tier available.
 * Data source: Electricity Maps (electricitymaps.com).
 *
 * Environment variable: ELECTRICITY_MAPS_API_KEY
 */

class ElectricityMapsAdapter {
  constructor(apiKey) {
    this.id = 'electricity_maps';
    this.apiKey = apiKey || process.env.ELECTRICITY_MAPS_API_KEY || null;
    this.baseUrl = 'https://api.electricitymap.org/v3';
  }

  getId() { return this.id; }
  supportsRealtime() { return !!this.apiKey; }
  supportsHourly() { return !!this.apiKey; }
  supportsAnnual() { return false; }

  async getRealtime(region) {
    if (!this.apiKey) {
      throw new Error('Electricity Maps API key required for real-time data. Set ELECTRICITY_MAPS_API_KEY.');
    }

    const url = `${this.baseUrl}/carbon-intensity/latest?zone=${encodeURIComponent(region)}`;
    const res = await fetch(url, {
      headers: { 'auth-token': this.apiKey },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`Electricity Maps API error: ${res.status}`);
    }

    const data = await res.json();
    return data.carbonIntensity;
  }

  async getHourlyAverage(region) {
    if (!this.apiKey) {
      throw new Error('Electricity Maps API key required. Set ELECTRICITY_MAPS_API_KEY.');
    }

    const url = `${this.baseUrl}/carbon-intensity/history?zone=${encodeURIComponent(region)}`;
    const res = await fetch(url, {
      headers: { 'auth-token': this.apiKey },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`Electricity Maps API error: ${res.status}`);
    }

    const data = await res.json();
    if (!data.history || data.history.length === 0) {
      throw new Error('No hourly data available for this region');
    }

    const total = data.history.reduce((sum, h) => sum + (h.carbonIntensity || 0), 0);
    return Math.round(total / data.history.length);
  }

  getAnnualAverage() {
    throw new Error('Electricity Maps adapter does not provide annual averages. Use IEA adapter as fallback.');
  }
}

module.exports = { ElectricityMapsAdapter };
