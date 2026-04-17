'use strict';

/**
 * WattTime Grid Intensity Adapter
 *
 * Real-time marginal emissions data.
 * Requires API credentials. Commercial license.
 * Data source: WattTime (watttime.org).
 *
 * Environment variables: WATTTIME_USER, WATTTIME_PASSWORD
 */

class WattTimeAdapter {
  constructor(username, password) {
    this.id = 'watttime';
    this.username = username || process.env.WATTTIME_USER || null;
    this.password = password || process.env.WATTTIME_PASSWORD || null;
    this.baseUrl = 'https://api.watttime.org/v3';
    this.token = null;
  }

  getId() { return this.id; }
  supportsRealtime() { return !!(this.username && this.password); }
  supportsHourly() { return !!(this.username && this.password); }
  supportsAnnual() { return false; }

  async _authenticate() {
    if (this.token) return;
    if (!this.username || !this.password) {
      throw new Error('WattTime credentials required. Set WATTTIME_USER and WATTTIME_PASSWORD.');
    }

    const res = await fetch(`${this.baseUrl}/login`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64'),
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`WattTime auth failed: ${res.status}`);
    }

    const data = await res.json();
    this.token = data.token;
  }

  async getRealtime(region) {
    await this._authenticate();

    const url = `${this.baseUrl}/signal-index?region=${encodeURIComponent(region)}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${this.token}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`WattTime API error: ${res.status}`);
    }

    const data = await res.json();
    // WattTime returns a percent index (0-100). Convert to approximate gCO2e/kWh.
    // Using US average as baseline, scaled by index.
    return Math.round((data.percent || 50) / 100 * 750);
  }

  async getHourlyAverage(region) {
    return this.getRealtime(region);
  }

  getAnnualAverage() {
    throw new Error('WattTime adapter does not provide annual averages. Use IEA adapter as fallback.');
  }
}

module.exports = { WattTimeAdapter };
