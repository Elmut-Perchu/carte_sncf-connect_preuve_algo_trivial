// =============================================================================
// ALGORITHM.JS — Port de l'algorithme Dart calculerMeilleureTarification()
// Complexité : O(S × C) — S segments, C cartes
// =============================================================================

/**
 * Retourne le taux de réduction applicable pour une carte sur un segment.
 * @param {Object} card - Carte de réduction
 * @param {string} departRegion - Région de départ du segment
 * @param {string} arriveRegion - Région d'arrivée du segment
 * @param {string} dayType - 'weekday' ou 'weekend'
 * @returns {number} Taux entre 0.0 et 1.0
 */
function getReductionRate(card, departRegion, arriveRegion, dayType) {
  const key = segmentKey(departRegion, arriveRegion);
  const rules = card.reductions[key];
  if (!rules) return 0;
  return rules[dayType] ?? rules[DayType.WEEKDAY] ?? 0;
}

/**
 * Calcule la tarification optimale pour un trajet multi-segments.
 * Sélectionne la meilleure carte par segment indépendamment.
 *
 * @param {Array} segments - Liste des segments du trajet
 * @param {Array} availableCards - Cartes possédées par l'utilisateur
 * @param {string} dayType - 'weekday' ou 'weekend'
 * @returns {Object} Résultat global avec détail par segment
 */
function computeOptimalPricing(segments, availableCards, dayType) {
  const segmentResults = segments.map(segment => {
    let bestCard = null;
    let bestRate = 0;
    const allOptions = [];

    for (const card of availableCards) {
      const rate = getReductionRate(card, segment.departRegion, segment.arriveRegion, dayType);
      allOptions.push({
        card,
        rate,
        resultPrice: round2(segment.basePrice * (1 - rate)),
      });

      if (rate > bestRate) {
        bestRate = rate;
        bestCard = card;
      }
    }

    // Trier par taux décroissant
    allOptions.sort((a, b) => b.rate - a.rate);

    const finalPrice = round2(segment.basePrice * (1 - bestRate));

    return {
      segment,
      bestCard,
      appliedRate: bestRate,
      finalPrice,
      savings: round2(segment.basePrice - finalPrice),
      allOptions,
    };
  });

  const totalBase = round2(segments.reduce((sum, s) => sum + s.basePrice, 0));
  const totalOptimal = round2(segmentResults.reduce((sum, r) => sum + r.finalPrice, 0));
  const totalSavings = round2(totalBase - totalOptimal);

  return {
    segments: segmentResults,
    totalBase,
    totalOptimal,
    totalSavings,
    savingsPercent: totalBase > 0 ? Math.round((totalSavings / totalBase) * 100) : 0,
    strategy: generateStrategy(segmentResults),
  };
}

/**
 * Simule le comportement de SNCF Connect quand les cartes régionales
 * sont en conflit sur un trajet inter-régional.
 * Worst case : tarif plein sur tous les segments.
 *
 * @param {Array} segments - Liste des segments
 * @returns {Object} Résultat "SNCF Connect"
 */
function computeSncfConnectBehavior(segments) {
  const segmentResults = segments.map(segment => ({
    segment,
    bestCard: null,
    appliedRate: 0,
    finalPrice: segment.basePrice,
    savings: 0,
    allOptions: [],
  }));

  const totalBase = round2(segments.reduce((sum, s) => sum + s.basePrice, 0));

  return {
    segments: segmentResults,
    totalBase,
    totalOptimal: totalBase,
    totalSavings: 0,
    savingsPercent: 0,
    strategy: 'Tarif plein — cartes régionales en conflit.',
  };
}

/**
 * Génère une description de la stratégie optimale.
 */
function generateStrategy(segmentResults) {
  const cardsUsed = new Set(
    segmentResults
      .filter(r => r.bestCard && r.appliedRate > 0)
      .map(r => r.bestCard.name)
  );

  if (cardsUsed.size === 0) return 'Aucune réduction applicable.';
  if (cardsUsed.size === 1) return `Utiliser ${[...cardsUsed][0]} sur tout le trajet.`;
  return 'Carte optimale différente par segment (détail ci-dessous).';
}

/** Arrondi à 2 décimales */
function round2(n) {
  return Math.round(n * 100) / 100;
}
