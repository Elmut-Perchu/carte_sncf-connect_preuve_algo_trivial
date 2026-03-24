// =============================================================================
// TARIFS-LOADER.JS — Charge les tarifs SNCF Open Data (data.gouv.fr)
// 18 098 paires OD × 11 régions, tarif normal 2nde classe
// Source : Parquet cache data.gouv.fr (données SNCF mars 2025)
// =============================================================================

const TarifsDB = {
  stations: [],       // [{name, uic, region}]
  pricing: {},        // "uicOrig__uicDest" -> {p: prix, r: region}
  loaded: false,
  loading: false,
  _onLoadCallbacks: [],

  /**
   * Charge le fichier tarifs.json (async).
   * Appeler au démarrage, les callbacks sont exécutés quand prêt.
   */
  async load() {
    if (this.loaded || this.loading) return;
    this.loading = true;

    try {
      const resp = await fetch('data/tarifs.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      this.stations = data.stations;
      this.pricing = data.pricing;
      this.loaded = true;

      // Badge de statut
      const badge = document.getElementById('data-badge');
      if (badge) {
        badge.textContent = `${this.stations.length.toLocaleString('fr-FR')} gares \u00b7 ${Object.keys(this.pricing).length.toLocaleString('fr-FR')} tarifs officiels`;
        badge.style.display = 'inline-block';
        badge.style.background = '#00A550';
      }

      // Notifier les callbacks
      this._onLoadCallbacks.forEach(cb => cb());
      this._onLoadCallbacks = [];
    } catch (err) {
      console.error('[TarifsDB] Erreur de chargement:', err);
      this.loading = false;

      const badge = document.getElementById('data-badge');
      if (badge) {
        badge.textContent = 'Donn\u00e9es \u00e9tendues indisponibles';
        badge.style.display = 'inline-block';
        badge.style.background = '#E4003A';
      }
    }
  },

  /** Enregistre un callback exécuté quand les données sont prêtes. */
  onLoad(cb) {
    if (this.loaded) {
      cb();
    } else {
      this._onLoadCallbacks.push(cb);
    }
  },

  /**
   * Cherche le prix tarif normal entre deux gares (par code UIC).
   * Essaie les deux sens.
   * @returns {Object|null} {price, region} ou null
   */
  getPrice(uicFrom, uicTo) {
    const key = `${uicFrom}__${uicTo}`;
    const entry = this.pricing[key];
    if (entry) return { price: entry.p, region: entry.r };

    const keyRev = `${uicTo}__${uicFrom}`;
    const entryRev = this.pricing[keyRev];
    if (entryRev) return { price: entryRev.p, region: entryRev.r };

    return null;
  },

  /**
   * Cherche des gares par nom (autocomplete).
   * @param {string} query
   * @param {number} limit
   * @returns {Array}
   */
  searchStations(query, limit = 10) {
    if (!this.loaded) return [];
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return this.stations
      .filter(s => {
        const name = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return name.includes(q);
      })
      .slice(0, limit);
  },
};
