// =============================================================================
// UI.JS — Composants d'interface
// =============================================================================

// --- Autocomplete ---

/**
 * Initialise l'autocomplete sur un champ de saisie.
 * Utilise un pattern "search function" au lieu d'une liste statique
 * pour supporter la recherche dynamique parmi 2000+ gares.
 *
 * @param {HTMLElement} inputEl - Champ input
 * @param {HTMLElement} listEl - Liste de suggestions
 * @param {Array} stations - Liste de gares à chercher
 * @param {Function} onSelect - Callback quand une gare est sélectionnée
 */
function initAutocomplete(inputEl, listEl, stations, onSelect) {
  let activeIndex = -1;

  // Stocker les stations sur l'élément pour pouvoir les mettre à jour
  inputEl._acStations = stations;
  inputEl._acOnSelect = onSelect;

  // Éviter les listeners dupliqués
  if (inputEl._acInitialized) return;
  inputEl._acInitialized = true;

  inputEl.addEventListener('input', () => {
    const query = inputEl.value.trim().toLowerCase();
    if (query.length < 2) {
      listEl.classList.remove('visible');
      return;
    }

    const stns = inputEl._acStations;
    const qNorm = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const matches = stns.filter(s => {
      const name = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return name.includes(qNorm) || s.code.toLowerCase().includes(qNorm);
    }).slice(0, 12);

    renderAutocompleteList(listEl, matches, (station) => {
      inputEl._acOnSelect(station);
      inputEl.value = station.name;
    });
    activeIndex = -1;
  });

  inputEl.addEventListener('keydown', (e) => {
    const items = listEl.querySelectorAll('.autocomplete-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActiveItem(items, activeIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActiveItem(items, activeIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      listEl.classList.remove('visible');
    }
  });

  // Fermer quand on clique ailleurs
  document.addEventListener('click', (e) => {
    if (!inputEl.contains(e.target) && !listEl.contains(e.target)) {
      listEl.classList.remove('visible');
    }
  });
}

function renderAutocompleteList(listEl, stations, onSelect) {
  listEl.innerHTML = '';
  if (stations.length === 0) {
    listEl.classList.remove('visible');
    return;
  }

  stations.forEach(station => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.innerHTML = `
      ${station.name}
      <span class="region-tag">${REGION_LABELS[station.region]}</span>
    `;
    item.addEventListener('click', () => {
      onSelect(station);
      listEl.classList.remove('visible');
    });
    listEl.appendChild(item);
  });

  listEl.classList.add('visible');
}

function updateActiveItem(items, activeIndex) {
  items.forEach((item, i) => {
    item.classList.toggle('active', i === activeIndex);
  });
}

// --- Card selector ---

function renderCardSelector(containerEl, cards, selectedCardIds, onChange) {
  containerEl.innerHTML = '';

  cards.forEach(card => {
    const label = document.createElement('label');
    label.className = 'card-checkbox' + (selectedCardIds.has(card.id) ? ' checked' : '');

    const checked = selectedCardIds.has(card.id) ? 'checked' : '';

    // Age badge
    let ageBadge = '';
    if (card.ageMin !== null && card.ageMax !== null) {
      ageBadge = `<span class="card-age">${card.ageMin}-${card.ageMax} ans</span>`;
    } else if (card.ageMin !== null) {
      ageBadge = `<span class="card-age">${card.ageMin}+ ans</span>`;
    } else if (card.ageMax !== null) {
      ageBadge = `<span class="card-age">&le;${card.ageMax} ans</span>`;
    }

    // Conditions tooltip
    const conditionsAttr = card.conditions ? ` title="${card.conditions.replace(/"/g, '&quot;')}"` : '';

    label.innerHTML = `
      <input type="checkbox" value="${card.id}" ${checked}>
      <span class="card-color" style="background: ${card.color}"></span>
      <span class="card-info"${conditionsAttr}>
        <span class="card-name">${card.name}</span>
        <span class="card-meta">
          <span class="card-price">${card.price}${String.fromCharCode(8364)}/an</span>
          ${ageBadge}
        </span>
      </span>
    `;

    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedCardIds.add(card.id);
      } else {
        selectedCardIds.delete(card.id);
      }
      label.classList.toggle('checked', checkbox.checked);
      onChange();
    });

    containerEl.appendChild(label);
  });
}

// --- Showcase routes ---

function renderShowcaseRoutes(containerEl, routes, onSelect) {
  containerEl.innerHTML = '';

  routes.forEach(route => {
    const btn = document.createElement('button');
    btn.className = 'showcase-btn';
    btn.textContent = route.label;
    btn.dataset.routeId = route.id;
    btn.addEventListener('click', () => {
      // Highlight active
      containerEl.querySelectorAll('.showcase-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onSelect(route);
    });
    containerEl.appendChild(btn);
  });
}

// --- Results rendering ---

function renderResults(containerEl, optimal, sncfConnect, route) {
  containerEl.classList.add('visible');
  containerEl.innerHTML = '';

  // Grille de comparaison
  const grid = document.createElement('div');
  grid.className = 'results-grid fade-in';

  // Colonne SNCF Connect
  grid.appendChild(renderResultColumn(sncfConnect, 'sncf', 'SNCF Connect', 'Comportement actuel'));

  // Colonne Algo optimal
  grid.appendChild(renderResultColumn(optimal, 'optimal', 'Algorithme optimal', 'Meilleure carte par segment'));

  containerEl.appendChild(grid);

  // Bandeau d'économie
  const savings = optimal.totalSavings;
  if (savings > 0) {
    const banner = document.createElement('div');
    banner.className = 'savings-banner fade-in animate';
    banner.innerHTML = `
      <div class="savings-amount">${savings.toFixed(2)} ${String.fromCharCode(8364)} d'${String.fromCharCode(233)}conomie</div>
      <div class="savings-percent">soit -${optimal.savingsPercent}% sur ce trajet</div>
      <div class="savings-label">en s${String.fromCharCode(233)}lectionnant automatiquement la meilleure carte par segment</div>
    `;
    containerEl.appendChild(banner);
  } else {
    const banner = document.createElement('div');
    banner.className = 'no-savings-banner fade-in';
    banner.innerHTML = '<strong>Aucune r&eacute;duction applicable</strong> avec les cartes s&eacute;lectionn&eacute;es.';
    containerEl.appendChild(banner);
  }

  // Stratégie
  const strategy = document.createElement('div');
  strategy.className = 'strategy-box fade-in';
  strategy.innerHTML = `<strong>Strat${String.fromCharCode(233)}gie recommand${String.fromCharCode(233)}e :</strong> ${optimal.strategy}`;
  containerEl.appendChild(strategy);

  // Disclaimer
  const disclaimer = document.createElement('div');
  disclaimer.className = 'disclaimer fade-in';
  disclaimer.innerHTML = `
    <strong>Note :</strong> SNCF Connect applique le tarif plein lorsque les cartes r${String.fromCharCode(233)}gionales
    entrent en conflit sur un trajet inter-r${String.fromCharCode(233)}gional. L'utilisateur doit d${String.fromCharCode(233)}sactiver
    manuellement ses cartes, ce qui est contre-intuitif et co${String.fromCharCode(251)}teux.
    <br>Cet algorithme d${String.fromCharCode(233)}montre qu'une s${String.fromCharCode(233)}lection automatique est triviale ${String.fromCharCode(224)} impl${String.fromCharCode(233)}menter.
  `;
  containerEl.appendChild(disclaimer);

  // Badge source de données
  if (route) renderDataSourceBadge(containerEl, route);
}

/** Affiche un badge de source de données sous les résultats. */
function renderDataSourceBadge(containerEl, route) {
  if (!route) return;
  const badge = document.createElement('div');
  badge.className = 'data-source-badge fade-in';
  if (route.isDynamic) {
    badge.innerHTML = `
      <span style="color: var(--teal); font-weight: 600;">Source :</span>
      SNCF Open Data (data.gouv.fr) \u2014 tarif normal 2de classe, mars 2025
    `;
  } else {
    badge.innerHTML = `
      <span style="color: var(--teal); font-weight: 600;">Source :</span>
      Tarifs constat${String.fromCharCode(233)}s sur SNCF Connect, Omio, Trainline (mars 2026)
    `;
  }
  containerEl.appendChild(badge);
}

function renderResultColumn(result, type, title, subtitle) {
  const col = document.createElement('div');
  col.className = `result-column ${type}`;

  const icon = type === 'sncf' ? '\u274C' : '\u2705';

  let segmentsHtml = '';
  result.segments.forEach(seg => {
    const cardBadge = seg.bestCard
      ? `<span class="segment-card-badge" style="background: ${seg.bestCard.color}">${seg.bestCard.name}</span>
         <span class="segment-rate">-${Math.round(seg.appliedRate * 100)}%</span>`
      : '<span class="segment-rate" style="color: var(--gray-500)">Tarif plein</span>';

    segmentsHtml += `
      <div class="segment-row">
        <div class="segment-name">${seg.segment.name}</div>
        <div class="segment-subtitle">${seg.segment.subtitle || ''}</div>
        <div class="segment-price">${seg.finalPrice.toFixed(2)} \u20AC</div>
        <div>${cardBadge}</div>
      </div>
    `;
  });

  col.innerHTML = `
    <h3>${icon} ${title}</h3>
    <p style="font-size: 0.8rem; color: var(--gray-500); margin-bottom: var(--space-md);">${subtitle}</p>
    ${segmentsHtml}
    <div class="result-total">
      <span class="result-total-label">Total</span>
      <span class="result-total-price">${result.totalOptimal.toFixed(2)} \u20AC</span>
    </div>
  `;

  return col;
}
