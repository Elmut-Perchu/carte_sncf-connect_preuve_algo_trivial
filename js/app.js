// =============================================================================
// APP.JS — Controller principal
// =============================================================================

(function () {
  // --- État de l'application ---
  const state = {
    departStation: null,
    arriveStation: null,
    dayType: DayType.WEEKDAY,
    selectedCardIds: new Set(CARDS.map(c => c.id)), // toutes cochées par défaut
    currentRoute: null,
    age: null, // null = pas de filtre âge
  };

  // --- Éléments DOM ---
  const els = {};

  /**
   * Fusionne les gares statiques (STATIONS) et les gares SNCF Open Data.
   * Déduplique par nom normalisé + région.
   */
  function getAllStations() {
    const seen = new Set();
    const result = [];

    // Priorité aux gares statiques (elles ont un code court)
    for (const s of STATIONS) {
      const key = s.name.toLowerCase() + '|' + s.region;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(s);
      }
    }

    // Ajouter les gares SNCF Open Data
    if (TarifsDB.loaded) {
      for (const s of TarifsDB.stations) {
        const key = s.name.toLowerCase() + '|' + s.region;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ code: 'UIC_' + s.uic, name: s.name, region: s.region, uic: s.uic });
        }
      }
    }

    return result;
  }

  function init() {
    // Cache des éléments
    els.departInput = document.getElementById('depart-input');
    els.departList = document.getElementById('depart-list');
    els.arriveInput = document.getElementById('arrive-input');
    els.arriveList = document.getElementById('arrive-list');
    els.dayToggle = document.getElementById('day-toggle');
    els.cardsGrid = document.getElementById('cards-grid');
    els.showcaseRoutes = document.getElementById('showcase-routes');
    els.results = document.getElementById('results');
    els.ageInput = document.getElementById('age-input');
    els.ageClear = document.getElementById('age-clear');
    els.cardsCount = document.getElementById('cards-count');

    // Charger les tarifs SNCF Open Data (async)
    TarifsDB.load();
    TarifsDB.onLoad(() => {
      // Mettre à jour les listes de gares dans les autocomplete
      const allStations = getAllStations();
      els.departInput._acStations = allStations;
      els.arriveInput._acStations = allStations;
    });

    // --- Autocomplete ---
    const allStations = getAllStations();

    initAutocomplete(els.departInput, els.departList, allStations, (station) => {
      state.departStation = station;
      tryFindRoute();
    });

    initAutocomplete(els.arriveInput, els.arriveList, allStations, (station) => {
      state.arriveStation = station;
      tryFindRoute();
    });

    // --- Day toggle ---
    els.dayToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      state.dayType = btn.dataset.day;
      els.dayToggle.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (state.currentRoute) compute();
    });

    // --- Age input ---
    els.ageInput.addEventListener('input', () => {
      const val = parseInt(els.ageInput.value, 10);
      state.age = (val >= 4 && val <= 99) ? val : null;
      updateCardVisibility();
      if (state.currentRoute) compute();
    });

    els.ageClear.addEventListener('click', () => {
      els.ageInput.value = '';
      state.age = null;
      updateCardVisibility();
      if (state.currentRoute) compute();
    });

    // --- Card selector ---
    renderCardSelector(els.cardsGrid, CARDS, state.selectedCardIds, () => {
      if (state.currentRoute) compute();
    });

    // --- Showcase routes ---
    renderShowcaseRoutes(els.showcaseRoutes, ROUTES, (route) => {
      state.currentRoute = route;
      const fromStation = STATIONS.find(s => s.code === route.from);
      const toStation = STATIONS.find(s => s.code === route.to);
      if (fromStation) {
        state.departStation = fromStation;
        els.departInput.value = fromStation.name;
      }
      if (toStation) {
        state.arriveStation = toStation;
        els.arriveInput.value = toStation.name;
      }
      compute();
    });
  }

  // --- Chercher un trajet prédéfini ou dynamique ---
  function tryFindRoute() {
    if (!state.departStation || !state.arriveStation) return;

    // 1) Chercher dans les trajets prédéfinis (multi-segments)
    const route = ROUTES.find(r =>
      (r.from === state.departStation.code && r.to === state.arriveStation.code) ||
      (r.to === state.departStation.code && r.from === state.arriveStation.code)
    );

    if (route) {
      state.currentRoute = route;
      els.showcaseRoutes.querySelectorAll('.showcase-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.routeId === route.id);
      });
      compute();
      return;
    }

    // 2) Essayer via TarifsDB (mono-segment, données SNCF Open Data)
    if (TarifsDB.loaded) {
      const dynRoute = buildDynamicRoute(state.departStation, state.arriveStation);
      if (dynRoute) {
        state.currentRoute = dynRoute;
        els.showcaseRoutes.querySelectorAll('.showcase-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        compute();
        return;
      }
    }

    // 3) Aucun trajet trouvé
    els.results.classList.remove('visible');
    els.results.innerHTML = `
      <div class="panel" style="text-align: center; color: var(--gray-500);">
        <p>Ce trajet n'est pas dans la base SNCF Open Data.</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">
          Possibilit\u00e9s : trajet inter-r\u00e9gional non couvert,
          gare non r\u00e9f\u00e9renc\u00e9e, ou liaison TGV/Intercit\u00e9s (hors TER).
          <br>Essayez un des trajets pr\u00e9d\u00e9finis ci-dessus.
        </p>
      </div>
    `;
    els.results.classList.add('visible');
  }

  /**
   * Construit un trajet mono-segment à partir des données SNCF Open Data.
   */
  function buildDynamicRoute(fromStation, toStation) {
    const uicFrom = resolveUIC(fromStation);
    const uicTo = resolveUIC(toStation);
    if (!uicFrom || !uicTo) return null;

    const result = TarifsDB.getPrice(uicFrom, uicTo);
    if (!result) return null;

    return {
      id: '_dynamic',
      label: `${fromStation.name} \u2192 ${toStation.name}`,
      from: fromStation.code,
      to: toStation.code,
      description: `Tarif TER ${REGION_LABELS[result.region] || result.region} (SNCF Open Data)`,
      isDynamic: true,
      segments: [{
        name: `${fromStation.name} \u2192 ${toStation.name}`,
        subtitle: `TER ${REGION_LABELS[result.region] || result.region} \u2014 tarif normal 2de classe`,
        departRegion: fromStation.region,
        arriveRegion: toStation.region,
        basePrice: result.price,
      }],
    };
  }

  /**
   * Résout le code UIC d'une gare.
   * Les gares TarifsDB ont directement .uic.
   * Les gares statiques (STATIONS) : recherche par nom dans TarifsDB.
   */
  function resolveUIC(station) {
    if (station.uic) return station.uic;
    if (!TarifsDB.loaded) return null;

    const nameNorm = normalizeName(station.name);

    // 1) Match exact normalisé
    let match = TarifsDB.stations.find(s => normalizeName(s.name) === nameNorm);
    if (match) return match.uic;

    // 2) Match partiel (l'un contient l'autre)
    match = TarifsDB.stations.find(s => {
      const sNorm = normalizeName(s.name);
      return sNorm.includes(nameNorm) || nameNorm.includes(sNorm);
    });
    if (match) return match.uic;

    // 3) Match par premiers mots (ex: "Angers Saint-Laud" → "Angers St Laud")
    const firstWord = nameNorm.split(/[\s-]/)[0];
    if (firstWord.length >= 4) {
      const candidates = TarifsDB.stations.filter(s =>
        normalizeName(s.name).startsWith(firstWord)
      );
      if (candidates.length === 1) return candidates[0].uic;
    }

    return null;
  }

  /** Normalise un nom de gare (minuscules, sans accents, sans tirets). */
  function normalizeName(name) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // --- Filtrer les cartes par âge ---
  function isCardEligible(card, age) {
    if (age === null) return true;
    if (card.ageMin !== null && age < card.ageMin) return false;
    if (card.ageMax !== null && age > card.ageMax) return false;
    return true;
  }

  function updateCardVisibility() {
    const labels = els.cardsGrid.querySelectorAll('.card-checkbox');
    let visibleCount = 0;
    let totalCount = CARDS.length;

    CARDS.forEach((card, i) => {
      const eligible = isCardEligible(card, state.age);
      const label = labels[i];
      if (!label) return;

      if (eligible) {
        label.classList.remove('card-ineligible');
        visibleCount++;
      } else {
        label.classList.add('card-ineligible');
      }
    });

    if (state.age !== null) {
      els.cardsCount.textContent = `(${visibleCount}/${totalCount} pour ${state.age} ans)`;
    } else {
      els.cardsCount.textContent = '';
    }
  }

  // --- Calculer et afficher ---
  function compute() {
    const route = state.currentRoute;
    if (!route) return;

    const selectedCards = CARDS.filter(c =>
      state.selectedCardIds.has(c.id) && isCardEligible(c, state.age)
    );

    let optimal;
    if (selectedCards.length > 0) {
      optimal = computeOptimalPricing(route.segments, selectedCards, state.dayType);
    } else {
      optimal = computeSncfConnectBehavior(route.segments);
    }

    const sncfConnect = computeSncfConnectBehavior(route.segments);

    renderResults(els.results, optimal, sncfConnect, route);
  }

  // --- Lancer ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
