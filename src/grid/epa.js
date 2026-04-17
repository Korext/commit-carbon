'use strict';

/**
 * EPA eGRID Adapter
 *
 * US subnational grid intensity data.
 * No API key required. Bundled data.
 * Data source: EPA eGRID (public domain).
 *
 * eGRID subregions mapped to state codes for convenience.
 */

// EPA eGRID 2022 subregion averages (lbs CO2/MWh converted to gCO2e/kWh).
// Source: EPA eGRID2022, released January 2024.
const EGRID_SUBREGIONS = {
  AKGD: 397,  // Alaska Grid
  AKMS: 190,  // Alaska Misc
  AZNM: 389,  // Arizona/New Mexico
  CAMX: 205,  // California/Mexico
  ERCT: 373,  // Texas (ERCOT)
  FRCC: 363,  // Florida
  HIMS: 522,  // Hawaii Misc
  HIOA: 658,  // Hawaii Oahu
  MROE: 535,  // Midwest (MISO)
  MROW: 410,  // Midwest West
  NEWE: 202,  // New England
  NWPP: 247,  // Northwest
  NYCW: 224,  // NYC/Westchester
  NYLI: 452,  // Long Island
  NYUP: 111,  // Upstate NY
  RFCE: 290,  // Mid-Atlantic
  RFCM: 516,  // Michigan
  RFCW: 475,  // Ohio Valley
  RMPA: 477,  // Rocky Mountain
  SPNO: 414,  // Southwest Power Pool North
  SPSO: 378,  // Southwest Power Pool South
  SRMV: 344,  // Mississippi Valley
  SRMW: 567,  // Midwest South
  SRSO: 345,  // Southeast
  SRTV: 401,  // Tennessee Valley
  SRVC: 313,  // Virginia/Carolina
};

// Map US states to eGRID subregions (primary).
const STATE_TO_SUBREGION = {
  AL: 'SRSO', AK: 'AKGD', AZ: 'AZNM', AR: 'SRMV',
  CA: 'CAMX', CO: 'RMPA', CT: 'NEWE', DE: 'RFCE',
  FL: 'FRCC', GA: 'SRSO', HI: 'HIOA', ID: 'NWPP',
  IL: 'RFCW', IN: 'RFCW', IA: 'MROW', KS: 'SPNO',
  KY: 'SRTV', LA: 'SRMV', ME: 'NEWE', MD: 'RFCE',
  MA: 'NEWE', MI: 'RFCM', MN: 'MROW', MS: 'SRMV',
  MO: 'SRMW', MT: 'NWPP', NE: 'MROW', NV: 'NWPP',
  NH: 'NEWE', NJ: 'RFCE', NM: 'AZNM', NY: 'NYUP',
  NC: 'SRVC', ND: 'MROW', OH: 'RFCW', OK: 'SPSO',
  OR: 'NWPP', PA: 'RFCE', RI: 'NEWE', SC: 'SRVC',
  SD: 'MROW', TN: 'SRTV', TX: 'ERCT', UT: 'NWPP',
  VT: 'NEWE', VA: 'SRVC', WA: 'NWPP', WV: 'RFCW',
  WI: 'MROE', WY: 'RMPA', DC: 'RFCE',
};

class EPAAdapter {
  constructor() {
    this.id = 'epa_egrid';
  }

  getId() { return this.id; }
  supportsRealtime() { return false; }
  supportsHourly() { return false; }
  supportsAnnual() { return true; }

  getAnnualAverage(region) {
    const upper = (region || '').toUpperCase();

    // Check if it is a state code.
    if (STATE_TO_SUBREGION[upper]) {
      return EGRID_SUBREGIONS[STATE_TO_SUBREGION[upper]] || 369;
    }

    // Check if it is a subregion code.
    if (EGRID_SUBREGIONS[upper]) {
      return EGRID_SUBREGIONS[upper];
    }

    // US national average fallback.
    if (upper === 'US') return 369;

    return null;
  }

  async getRealtime() {
    throw new Error('EPA eGRID adapter does not support real-time data');
  }

  async getHourlyAverage(region) {
    return this.getAnnualAverage(region);
  }

  listSubregions() {
    return Object.keys(EGRID_SUBREGIONS);
  }

  listStates() {
    return Object.keys(STATE_TO_SUBREGION);
  }
}

module.exports = { EPAAdapter };
