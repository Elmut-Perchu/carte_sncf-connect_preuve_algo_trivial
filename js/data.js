// =============================================================================
// DATA.JS — Base de données SNCF (données publiques)
// Sources : ter.sncf.com, sncf-connect.com, ressources.data.sncf.com
// =============================================================================

// --- Régions TER ---
const Region = Object.freeze({
  NORMANDIE: 'normandie',
  CENTRE_VAL_DE_LOIRE: 'centre_val_de_loire',
  ILE_DE_FRANCE: 'ile_de_france',
  HAUTS_DE_FRANCE: 'hauts_de_france',
  PAYS_DE_LA_LOIRE: 'pays_de_la_loire',
  GRAND_EST: 'grand_est',
  NOUVELLE_AQUITAINE: 'nouvelle_aquitaine',
  BOURGOGNE_FC: 'bourgogne_franche_comte',
  AUVERGNE_RA: 'auvergne_rhone_alpes',
  OCCITANIE: 'occitanie',
  PACA: 'paca',
  BRETAGNE: 'bretagne',
});

const REGION_LABELS = {
  [Region.NORMANDIE]: 'Normandie',
  [Region.CENTRE_VAL_DE_LOIRE]: 'Centre-Val de Loire',
  [Region.ILE_DE_FRANCE]: 'Île-de-France',
  [Region.HAUTS_DE_FRANCE]: 'Hauts-de-France',
  [Region.PAYS_DE_LA_LOIRE]: 'Pays de la Loire',
  [Region.GRAND_EST]: 'Grand Est',
  [Region.NOUVELLE_AQUITAINE]: 'Nouvelle-Aquitaine',
  [Region.BOURGOGNE_FC]: 'Bourgogne-Franche-Comté',
  [Region.AUVERGNE_RA]: 'Auvergne-Rhône-Alpes',
  [Region.OCCITANIE]: 'Occitanie',
  [Region.PACA]: 'Provence-Alpes-Côte d\'Azur',
  [Region.BRETAGNE]: 'Bretagne',
};

// --- Types de jour ---
const DayType = Object.freeze({
  WEEKDAY: 'weekday',
  WEEKEND: 'weekend',
});

// --- Clé de segment normalisée (tri alphabétique) ---
function segmentKey(regionA, regionB) {
  return [regionA, regionB].sort().join('__');
}

// =============================================================================
// CARTES DE RÉDUCTION
// Sources vérifiées le 22 mars 2026 sur les sites TER régionaux
// Recherche détaillée : voir research/*.md
//
// PDF clé Carte Avantage :
//   sncf-voyageurs.com/medias-publics/2025-02/
//   sncfv-acceptation-tarifs-avantage-liberte-sur-ter.pdf
// =============================================================================

const CARDS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // NORMANDIE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'tempo_normandie_26',
    name: 'Carte Tempo Normandie +26',
    region: Region.NORMANDIE,
    price: 30,
    ageMin: 26, ageMax: null,
    color: '#0072BC',
    source: 'ter.sncf.com/normandie',
    lastVerified: '2026-03-22',
    conditions: 'Intra-Normandie uniquement. Pour Paris, il faut la Tempo Paris (49\u20AC).',
    reductions: {
      // INTRA-Normandie uniquement (la +26 à 30€ ne couvre PAS l'inter-régional)
      [segmentKey(Region.NORMANDIE, Region.NORMANDIE)]: { weekday: 0.25, weekend: 0.50 },
    },
  },
  {
    id: 'tempo_paris_26',
    name: 'Carte Tempo Normandie-Paris +26',
    region: Region.NORMANDIE,
    price: 49,
    ageMin: 26, ageMax: null,
    color: '#0072BC',
    source: 'ter.sncf.com/normandie',
    lastVerified: '2026-03-22',
    conditions: 'Normandie + lignes vers Paris (St-Lazare, Montparnasse).',
    reductions: {
      [segmentKey(Region.NORMANDIE, Region.NORMANDIE)]: { weekday: 0.25, weekend: 0.50 },
      [segmentKey(Region.NORMANDIE, Region.ILE_DE_FRANCE)]: { weekday: 0.25, weekend: 0.50 },
    },
  },
  {
    id: 'tempo_interregionale',
    name: 'Carte Tempo Interr\u00e9gionale -26',
    region: Region.NORMANDIE,
    price: 10,
    ageMin: null, ageMax: 25,
    color: '#0072BC',
    source: 'ter.sncf.com/normandie',
    lastVerified: '2026-03-22',
    conditions: '-50% tous les jours sans contrainte. Accompagnants : -50% adultes, -75% enfants.',
    reductions: {
      // -50% flat tous les jours, couverture large
      [segmentKey(Region.NORMANDIE, Region.NORMANDIE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NORMANDIE, Region.ILE_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NORMANDIE, Region.BRETAGNE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NORMANDIE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NORMANDIE, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NORMANDIE, Region.HAUTS_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CENTRE-VAL DE LOIRE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'remi_liberte',
    name: 'Carte R\u00e9mi Libert\u00e9 CVL',
    region: Region.CENTRE_VAL_DE_LOIRE,
    price: 30,
    ageMin: 26, ageMax: null,
    color: '#E30613',
    source: 'ter.sncf.com/centre-val-de-loire',
    lastVerified: '2026-03-22',
    conditions: '-33% semaine, -50% WE/f\u00e9ri\u00e9s. 6 r\u00e9gions limitrophes couvertes.',
    reductions: {
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.33, weekend: 0.50 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.ILE_DE_FRANCE)]: { weekday: 0.33, weekend: 0.50 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.NORMANDIE)]: { weekday: 0.33, weekend: 0.50 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.33, weekend: 0.50 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.NOUVELLE_AQUITAINE)]: { weekday: 0.33, weekend: 0.50 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.BOURGOGNE_FC)]: { weekday: 0.33, weekend: 0.50 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.AUVERGNE_RA)]: { weekday: 0.33, weekend: 0.50 },
    },
  },
  {
    id: 'remi_liberte_jeune',
    name: 'Carte R\u00e9mi Libert\u00e9 Jeune CVL',
    region: Region.CENTRE_VAL_DE_LOIRE,
    price: 20,
    ageMin: 15, ageMax: 25,
    color: '#E30613',
    source: 'ter.sncf.com/centre-val-de-loire',
    lastVerified: '2026-03-22',
    conditions: '-50% semaine, -66% WE/f\u00e9ri\u00e9s. Gratuit pour les 4-14 ans.',
    reductions: {
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.50, weekend: 0.66 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.ILE_DE_FRANCE)]: { weekday: 0.50, weekend: 0.66 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.NORMANDIE)]: { weekday: 0.50, weekend: 0.66 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.50, weekend: 0.66 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.NOUVELLE_AQUITAINE)]: { weekday: 0.50, weekend: 0.66 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.BOURGOGNE_FC)]: { weekday: 0.50, weekend: 0.66 },
      [segmentKey(Region.CENTRE_VAL_DE_LOIRE, Region.AUVERGNE_RA)]: { weekday: 0.50, weekend: 0.66 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAUTS-DE-FRANCE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'carte_ter_hdf',
    name: 'Ma Carte TER Hauts-de-France +26',
    region: Region.HAUTS_DE_FRANCE,
    price: 30,
    ageMin: 26, ageMax: null,
    color: '#00A3E0',
    source: 'ter.sncf.com/hauts-de-france',
    lastVerified: '2026-03-22',
    conditions: '-50% tous les jours (semaine + WE). GE limit\u00e9 aux d\u00e9pts 08, 10, 51, 52.',
    reductions: {
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.HAUTS_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.ILE_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.NORMANDIE)]: { weekday: 0.50, weekend: 0.50 },
      // Grand Est : limité aux départements Ardennes, Aube, Marne, Haute-Marne
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.GRAND_EST)]: { weekday: 0.50, weekend: 0.50 },
    },
  },
  {
    id: 'carte_ter_hdf_jeune',
    name: 'Ma Carte TER Hauts-de-France -26',
    region: Region.HAUTS_DE_FRANCE,
    price: 15,
    ageMin: null, ageMax: 25,
    color: '#00A3E0',
    source: 'ter.sncf.com/hauts-de-france',
    lastVerified: '2026-03-22',
    conditions: '-50% tous les jours. Valable jusqu\'\u00e0 expiration m\u00eame apr\u00e8s 26 ans.',
    reductions: {
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.HAUTS_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.ILE_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.NORMANDIE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.GRAND_EST)]: { weekday: 0.50, weekend: 0.50 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRAND EST
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'fluo_grand_est',
    name: 'Carte Fluo Grand Est',
    region: Region.GRAND_EST,
    price: 30,
    ageMin: 26, ageMax: null,
    color: '#6F2282',
    source: 'ter.sncf.com/grand-est',
    lastVerified: '2026-03-22',
    conditions: '-50% tous les jours 7j/7. Prix pass\u00e9 de 20\u20AC \u00e0 30\u20AC en janvier 2026.',
    reductions: {
      [segmentKey(Region.GRAND_EST, Region.GRAND_EST)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.GRAND_EST, Region.ILE_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.GRAND_EST, Region.HAUTS_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.GRAND_EST, Region.BOURGOGNE_FC)]: { weekday: 0.50, weekend: 0.50 },
    },
  },
  {
    id: 'fluo_jeune',
    name: 'Carte Fluo Jeune Grand Est',
    region: Region.GRAND_EST,
    price: 10,
    ageMin: null, ageMax: 25,
    color: '#6F2282',
    source: 'ter.sncf.com/grand-est',
    lastVerified: '2026-03-22',
    conditions: '-50% tous les jours. Prix pass\u00e9 de 1\u20AC \u00e0 10\u20AC en janvier 2026.',
    reductions: {
      [segmentKey(Region.GRAND_EST, Region.GRAND_EST)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.GRAND_EST, Region.ILE_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.GRAND_EST, Region.HAUTS_DE_FRANCE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.GRAND_EST, Region.BOURGOGNE_FC)]: { weekday: 0.50, weekend: 0.50 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYS DE LA LOIRE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'mezzo_pdl',
    name: 'Carte Mezzo Pays de la Loire',
    region: Region.PAYS_DE_LA_LOIRE,
    price: 30,
    ageMin: 26, ageMax: null,
    color: '#FF6600',
    source: 'ter.sncf.com/pays-de-la-loire',
    lastVerified: '2026-03-22',
    conditions: '-50% 7j/7. 3 accompagnants adultes \u00e0 -50%, 3 enfants -12 ans gratuits. PDL\u2194IDF non couvert (Le Mans-Paris = TGV).',
    reductions: {
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.BRETAGNE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.NORMANDIE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.NOUVELLE_AQUITAINE)]: { weekday: 0.50, weekend: 0.50 },
      // Note : PDL ↔ IDF NON couvert (Le Mans→Paris est TGV, pas TER)
    },
  },
  {
    id: 'mezzo_pdl_jeune',
    name: 'Carte Mezzo -26 Pays de la Loire',
    region: Region.PAYS_DE_LA_LOIRE,
    price: 20,
    ageMin: null, ageMax: 25,
    color: '#FF6600',
    source: 'ter.sncf.com/pays-de-la-loire',
    lastVerified: '2026-03-22',
    conditions: '-50% 7j/7. M\u00eames avantages accompagnants que la Mezzo adulte.',
    reductions: {
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.BRETAGNE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.NORMANDIE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.NOUVELLE_AQUITAINE)]: { weekday: 0.50, weekend: 0.50 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NOUVELLE-AQUITAINE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'carte_plus_naq',
    name: 'Carte+ Nouvelle-Aquitaine',
    region: Region.NOUVELLE_AQUITAINE,
    price: 29,
    ageMin: 28, ageMax: null,
    color: '#E20025',
    source: 'ter.sncf.com/nouvelle-aquitaine',
    lastVerified: '2026-03-22',
    conditions: '-50% 7j/7. \u00c0 partir de 28 ans (les -28 ans ont le Billet Jeunes \u00e0 -50% sans carte).',
    reductions: {
      [segmentKey(Region.NOUVELLE_AQUITAINE, Region.NOUVELLE_AQUITAINE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NOUVELLE_AQUITAINE, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NOUVELLE_AQUITAINE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NOUVELLE_AQUITAINE, Region.OCCITANIE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.NOUVELLE_AQUITAINE, Region.AUVERGNE_RA)]: { weekday: 0.50, weekend: 0.50 },
      // Note : NAQ ↔ IDF NON couvert (Limoges→Paris = Intercités, pas TER)
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUVERGNE-RHÔNE-ALPES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'illico_liberte_aura',
    name: 'Carte illico Libert\u00e9 AURA',
    region: Region.AUVERGNE_RA,
    price: 30,
    ageMin: 26, ageMax: null,
    color: '#E1251B',
    source: 'ter.sncf.com/auvergne-rhone-alpes',
    lastVerified: '2026-03-22',
    conditions: '-25% semaine, -50% WE/f\u00e9ri\u00e9s/vacances. Jusqu\'\u00e0 3 accompagnants \u00e0 -50% le WE.',
    reductions: {
      [segmentKey(Region.AUVERGNE_RA, Region.AUVERGNE_RA)]: { weekday: 0.25, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.BOURGOGNE_FC)]: { weekday: 0.25, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.25, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.OCCITANIE)]: { weekday: 0.25, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.NOUVELLE_AQUITAINE)]: { weekday: 0.25, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.PACA)]: { weekday: 0.25, weekend: 0.50 },
    },
  },
  {
    id: 'illico_liberte_jeune_aura',
    name: 'Carte illico Libert\u00e9 Jeunes AURA',
    region: Region.AUVERGNE_RA,
    price: 15,
    ageMin: 12, ageMax: 25,
    color: '#E1251B',
    source: 'ter.sncf.com/auvergne-rhone-alpes',
    lastVerified: '2026-03-22',
    conditions: '-50% tous les jours toute l\u2019ann\u00e9e. R\u00e9sidents AURA.',
    reductions: {
      [segmentKey(Region.AUVERGNE_RA, Region.AUVERGNE_RA)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.BOURGOGNE_FC)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.OCCITANIE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.NOUVELLE_AQUITAINE)]: { weekday: 0.50, weekend: 0.50 },
      [segmentKey(Region.AUVERGNE_RA, Region.PACA)]: { weekday: 0.50, weekend: 0.50 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PACA (Région Sud)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'zou_malin_paca',
    name: 'Carte ZOU! Malin PACA',
    region: Region.PACA,
    price: 20,
    ageMin: 4, ageMax: null,
    color: '#0077C0',
    source: 'zou.maregionsud.fr',
    lastVerified: '2026-03-22',
    conditions: '-30% tous les jours (flat). 1 accompagnant \u00e0 -30%.',
    reductions: {
      [segmentKey(Region.PACA, Region.PACA)]: { weekday: 0.30, weekend: 0.30 },
      [segmentKey(Region.PACA, Region.AUVERGNE_RA)]: { weekday: 0.30, weekend: 0.30 },
      [segmentKey(Region.PACA, Region.OCCITANIE)]: { weekday: 0.30, weekend: 0.30 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOURGOGNE-FRANCHE-COMTÉ
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'mobigo_plus_bfc',
    name: 'Carte TRAIN Mobigo+ BFC',
    region: Region.BOURGOGNE_FC,
    price: 20,
    ageMin: 12, ageMax: null,
    color: '#009B3A',
    source: 'ter.sncf.com/bourgogne-franche-comte',
    lastVerified: '2026-03-22',
    conditions: '-30% semaine, -60% WE/f\u00e9ri\u00e9s/vacances. 1 accompagnant au m\u00eame tarif. 2nde classe uniquement.',
    reductions: {
      [segmentKey(Region.BOURGOGNE_FC, Region.BOURGOGNE_FC)]: { weekday: 0.30, weekend: 0.60 },
      [segmentKey(Region.BOURGOGNE_FC, Region.AUVERGNE_RA)]: { weekday: 0.30, weekend: 0.60 },
      [segmentKey(Region.BOURGOGNE_FC, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.30, weekend: 0.60 },
      // BFC vers Paris (Bercy, Gare de Lyon) via TER
      [segmentKey(Region.BOURGOGNE_FC, Region.ILE_DE_FRANCE)]: { weekday: 0.30, weekend: 0.60 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CARTE NATIONALE — Carte Avantage Adulte
  // Source : PDF officiel SNCF Voyageurs (fév. 2025)
  //
  // NOTES :
  // - "25%/50%" dans le PDF = 25% période blanche (pointe) / 50% bleue (creuse)
  //   → On modélise : weekday=0.25, weekend=0.50 (approximation)
  // - "30%" flat = weekday=0.30, weekend=0.30
  // - "25%" flat = weekday=0.25, weekend=0.25
  // - REFUSÉE dans : IDF (intra), PACA, CVL (intra), NAQ (intra), Occitanie (intra)
  // - Contrainte A/R + WE en AURA, Bretagne, PDL (non modélisée, trop complexe)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'avantage_adulte',
    name: 'Carte Avantage Adulte (nationale)',
    region: null, // nationale
    price: 49,
    ageMin: 27, ageMax: 59,
    color: '#82368C',
    source: 'sncf-voyageurs.com (PDF acceptation TER)',
    lastVerified: '2026-03-22',
    conditions: '27-59 ans. Refus\u00e9e en IDF, PACA, CVL/NAQ/Occitanie (intra). A/R+WE obligatoire en AURA/Bretagne/PDL.',
    reductions: {
      // --- INTRA-RÉGIONAL ---
      // Normandie : 30% flat (TER sans résa)
      [segmentKey(Region.NORMANDIE, Region.NORMANDIE)]: { weekday: 0.30, weekend: 0.30 },
      // Hauts-de-France : 25% flat
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.HAUTS_DE_FRANCE)]: { weekday: 0.25, weekend: 0.25 },
      // Grand Est : 25% flat
      [segmentKey(Region.GRAND_EST, Region.GRAND_EST)]: { weekday: 0.25, weekend: 0.25 },
      // Pays de la Loire : 30% flat (contrainte A/R+WE)
      [segmentKey(Region.PAYS_DE_LA_LOIRE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.30, weekend: 0.30 },
      // AURA : 25%/50% (contrainte A/R+WE)
      [segmentKey(Region.AUVERGNE_RA, Region.AUVERGNE_RA)]: { weekday: 0.25, weekend: 0.50 },
      // Bretagne : 30% flat (contrainte A/R+WE)
      [segmentKey(Region.BRETAGNE, Region.BRETAGNE)]: { weekday: 0.30, weekend: 0.30 },
      // REFUSÉE intra : IDF, PACA, BFC, CVL, NAQ, Occitanie

      // --- INTER-RÉGIONAL (Carte Adulte acceptée) ---
      // Normandie ↔ IDF : inclus dans couverture Normandie
      [segmentKey(Region.NORMANDIE, Region.ILE_DE_FRANCE)]: { weekday: 0.30, weekend: 0.30 },
      // Normandie ↔ HdF : 30%
      [segmentKey(Region.NORMANDIE, Region.HAUTS_DE_FRANCE)]: { weekday: 0.30, weekend: 0.30 },
      // Normandie ↔ CVL : 30%
      [segmentKey(Region.NORMANDIE, Region.CENTRE_VAL_DE_LOIRE)]: { weekday: 0.30, weekend: 0.30 },
      // Normandie ↔ PDL : 30%
      [segmentKey(Region.NORMANDIE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.30, weekend: 0.30 },
      // Normandie ↔ Bretagne : 25%/50%
      [segmentKey(Region.NORMANDIE, Region.BRETAGNE)]: { weekday: 0.25, weekend: 0.50 },
      // HdF ↔ IDF : inclus dans couverture HdF
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.ILE_DE_FRANCE)]: { weekday: 0.25, weekend: 0.25 },
      // HdF ↔ Grand Est : 25%
      [segmentKey(Region.HAUTS_DE_FRANCE, Region.GRAND_EST)]: { weekday: 0.25, weekend: 0.25 },
      // Grand Est ↔ IDF : inclus dans couverture GE
      [segmentKey(Region.GRAND_EST, Region.ILE_DE_FRANCE)]: { weekday: 0.25, weekend: 0.25 },
      // Grand Est ↔ BFC : 25%/50%
      [segmentKey(Region.GRAND_EST, Region.BOURGOGNE_FC)]: { weekday: 0.25, weekend: 0.50 },
      // Bretagne ↔ PDL : 25%/50%
      [segmentKey(Region.BRETAGNE, Region.PAYS_DE_LA_LOIRE)]: { weekday: 0.25, weekend: 0.50 },
    },
  },
];

// =============================================================================
// GARES (corridors principaux)
// Source : ressources.data.sncf.com/explore/dataset/gares-de-voyageurs
// =============================================================================

const STATIONS = [
  // --- Normandie ---
  { code: 'ROUEN', name: 'Rouen Rive-Droite', region: Region.NORMANDIE },
  { code: 'CAEN', name: 'Caen', region: Region.NORMANDIE },
  { code: 'LE_HAVRE', name: 'Le Havre', region: Region.NORMANDIE },
  { code: 'EVREUX', name: 'Évreux', region: Region.NORMANDIE },
  { code: 'ALENCON', name: 'Alençon', region: Region.NORMANDIE },
  { code: 'LISIEUX', name: 'Lisieux', region: Region.NORMANDIE },

  // --- Île-de-France ---
  { code: 'PARIS_SL', name: 'Paris Saint-Lazare', region: Region.ILE_DE_FRANCE },
  { code: 'PARIS_MONTPARNASSE', name: 'Paris Montparnasse', region: Region.ILE_DE_FRANCE },
  { code: 'PARIS_NORD', name: 'Paris Nord', region: Region.ILE_DE_FRANCE },
  { code: 'PARIS_EST', name: 'Paris Est', region: Region.ILE_DE_FRANCE },
  { code: 'PARIS_AUSTERLITZ', name: 'Paris Austerlitz', region: Region.ILE_DE_FRANCE },

  // --- Centre-Val de Loire ---
  { code: 'CHARTRES', name: 'Chartres', region: Region.CENTRE_VAL_DE_LOIRE },
  { code: 'TOURS', name: 'Tours', region: Region.CENTRE_VAL_DE_LOIRE },
  { code: 'ORLEANS', name: 'Orléans', region: Region.CENTRE_VAL_DE_LOIRE },
  { code: 'BOURGES', name: 'Bourges', region: Region.CENTRE_VAL_DE_LOIRE },
  { code: 'BLOIS', name: 'Blois', region: Region.CENTRE_VAL_DE_LOIRE },
  { code: 'VIERZON', name: 'Vierzon', region: Region.CENTRE_VAL_DE_LOIRE },

  // --- Hauts-de-France ---
  { code: 'LILLE', name: 'Lille Flandres', region: Region.HAUTS_DE_FRANCE },
  { code: 'AMIENS', name: 'Amiens', region: Region.HAUTS_DE_FRANCE },
  { code: 'ARRAS', name: 'Arras', region: Region.HAUTS_DE_FRANCE },
  { code: 'COMPIEGNE', name: 'Compiègne', region: Region.HAUTS_DE_FRANCE },
  { code: 'BEAUVAIS', name: 'Beauvais', region: Region.HAUTS_DE_FRANCE },

  // --- Grand Est ---
  { code: 'STRASBOURG', name: 'Strasbourg', region: Region.GRAND_EST },
  { code: 'METZ', name: 'Metz', region: Region.GRAND_EST },
  { code: 'NANCY', name: 'Nancy', region: Region.GRAND_EST },
  { code: 'REIMS', name: 'Reims', region: Region.GRAND_EST },
  { code: 'MULHOUSE', name: 'Mulhouse', region: Region.GRAND_EST },

  // --- Pays de la Loire ---
  { code: 'NANTES', name: 'Nantes', region: Region.PAYS_DE_LA_LOIRE },
  { code: 'LE_MANS', name: 'Le Mans', region: Region.PAYS_DE_LA_LOIRE },
  { code: 'ANGERS', name: 'Angers Saint-Laud', region: Region.PAYS_DE_LA_LOIRE },
  { code: 'LAVAL', name: 'Laval', region: Region.PAYS_DE_LA_LOIRE },

  // --- Nouvelle-Aquitaine ---
  { code: 'BORDEAUX', name: 'Bordeaux Saint-Jean', region: Region.NOUVELLE_AQUITAINE },
  { code: 'POITIERS', name: 'Poitiers', region: Region.NOUVELLE_AQUITAINE },
  { code: 'LA_ROCHELLE', name: 'La Rochelle', region: Region.NOUVELLE_AQUITAINE },
  { code: 'LIMOGES', name: 'Limoges-Bénédictins', region: Region.NOUVELLE_AQUITAINE },

  // --- Bretagne ---
  { code: 'RENNES', name: 'Rennes', region: Region.BRETAGNE },
  { code: 'BREST', name: 'Brest', region: Region.BRETAGNE },
  { code: 'QUIMPER', name: 'Quimper', region: Region.BRETAGNE },
];

// =============================================================================
// TRAJETS PRÉDÉFINIS (tarifs normaux 2de classe, constatés 2025)
// Sources : SNCF Connect, Omio, Trainline, sites TER régionaux
//
// NOTES SUR LES PRIX :
// - Tarif normal = plein tarif sans carte ni réduction
// - Prix fixes TER (pas de yield management comme le TGV)
// - Vérifiés sur Omio/Trainline/SNCF Connect (prix jour même)
// =============================================================================

const ROUTES = [
  // ─── ROUEN → BOURGES ───────────────────────────────────────────────
  // Itinéraire réel : Rouen → Paris SL (TER Normandie) puis
  // Paris Austerlitz → Bourges (TER CVL via Étampes, Orléans, Vierzon)
  {
    id: 'rouen_bourges',
    label: 'Rouen → Bourges',
    from: 'ROUEN',
    to: 'BOURGES',
    description: 'Normandie → IDF → Centre-Val de Loire (via Paris)',
    segments: [
      {
        name: 'Rouen → Paris Saint-Lazare',
        subtitle: 'TER Normandie (Nomad Train)',
        departRegion: Region.NORMANDIE,
        arriveRegion: Region.ILE_DE_FRANCE,
        basePrice: 26.40, // Trainline tarif normal constaté
      },
      {
        name: 'Paris Austerlitz → Bourges',
        subtitle: 'TER Centre-Val de Loire (Rémi)',
        departRegion: Region.ILE_DE_FRANCE,
        arriveRegion: Region.CENTRE_VAL_DE_LOIRE,
        basePrice: 41.10, // ter.sncf.com/centre-val-de-loire tarif normal
      },
    ],
  },

  // ─── ROUEN → LILLE ─────────────────────────────────────────────────
  // Itinéraire réel : Rouen → Amiens (TER) puis Amiens → Lille (TER HdF)
  {
    id: 'rouen_lille',
    label: 'Rouen → Lille',
    from: 'ROUEN',
    to: 'LILLE',
    description: 'Normandie → Hauts-de-France (via Amiens)',
    segments: [
      {
        name: 'Rouen → Amiens',
        subtitle: 'TER Normandie / Hauts-de-France',
        departRegion: Region.NORMANDIE,
        arriveRegion: Region.HAUTS_DE_FRANCE,
        basePrice: 19.80, // Omio tarif constaté
      },
      {
        name: 'Amiens → Lille Flandres',
        subtitle: 'TER Hauts-de-France',
        departRegion: Region.HAUTS_DE_FRANCE,
        arriveRegion: Region.HAUTS_DE_FRANCE,
        basePrice: 21.50, // Omio tarif constaté
      },
    ],
  },

  // ─── LILLE → TOURS ─────────────────────────────────────────────────
  // Itinéraire réel : Lille → Paris Nord (TER HdF) puis
  // Paris Austerlitz → Tours (TER CVL)
  {
    id: 'lille_tours',
    label: 'Lille → Tours',
    from: 'LILLE',
    to: 'TOURS',
    description: 'Hauts-de-France → IDF → Centre-Val de Loire',
    segments: [
      {
        name: 'Lille → Paris Nord',
        subtitle: 'TER Hauts-de-France (via Arras, Creil)',
        departRegion: Region.HAUTS_DE_FRANCE,
        arriveRegion: Region.ILE_DE_FRANCE,
        basePrice: 35.30, // Omio/SNCF Connect tarif normal
      },
      {
        name: 'Paris Austerlitz → Tours',
        subtitle: 'TER Centre-Val de Loire (Rémi)',
        departRegion: Region.ILE_DE_FRANCE,
        arriveRegion: Region.CENTRE_VAL_DE_LOIRE,
        basePrice: 30.80, // SNCF Connect tarif normal
      },
    ],
  },

  // ─── LILLE → STRASBOURG ────────────────────────────────────────────
  // Itinéraire TER réel : Lille → Paris Nord puis Paris Est → Strasbourg
  // (ou Lille → Reims → Strasbourg selon horaires)
  {
    id: 'lille_strasbourg',
    label: 'Lille → Strasbourg',
    from: 'LILLE',
    to: 'STRASBOURG',
    description: 'Hauts-de-France → IDF → Grand Est (via Paris)',
    segments: [
      {
        name: 'Lille → Paris Nord',
        subtitle: 'TER Hauts-de-France',
        departRegion: Region.HAUTS_DE_FRANCE,
        arriveRegion: Region.ILE_DE_FRANCE,
        basePrice: 35.30, // Omio tarif normal
      },
      {
        name: 'Paris Est → Strasbourg',
        subtitle: 'TER Grand Est (via Meaux, Châlons, Nancy)',
        departRegion: Region.ILE_DE_FRANCE,
        arriveRegion: Region.GRAND_EST,
        basePrice: 51.20, // Omio TER tarif normal (pas TGV)
      },
    ],
  },

  // ─── NANTES → TOURS ────────────────────────────────────────────────
  // Itinéraire réel : Nantes → Angers (TER PDL) puis Angers → Tours (TER PDL/CVL)
  // ou Nantes → Le Mans → Tours
  {
    id: 'nantes_tours',
    label: 'Nantes → Tours',
    from: 'NANTES',
    to: 'TOURS',
    description: 'Pays de la Loire → Centre-Val de Loire (via Angers)',
    segments: [
      {
        name: 'Nantes → Angers',
        subtitle: 'TER Pays de la Loire (Aléop)',
        departRegion: Region.PAYS_DE_LA_LOIRE,
        arriveRegion: Region.PAYS_DE_LA_LOIRE,
        basePrice: 18.40, // Omio/SNCF Connect tarif normal
      },
      {
        name: 'Angers → Tours',
        subtitle: 'TER Pays de la Loire / CVL',
        departRegion: Region.PAYS_DE_LA_LOIRE,
        arriveRegion: Region.CENTRE_VAL_DE_LOIRE,
        basePrice: 21.60, // Omio tarif normal
      },
    ],
  },

  // ─── CAEN → LE MANS ────────────────────────────────────────────────
  // Itinéraire réel : Caen → Alençon (TER Normandie) puis
  // Alençon → Le Mans (TER PDL)
  {
    id: 'caen_le_mans',
    label: 'Caen → Le Mans',
    from: 'CAEN',
    to: 'LE_MANS',
    description: 'Normandie → Pays de la Loire (via Alençon)',
    segments: [
      {
        name: 'Caen → Alençon',
        subtitle: 'TER Normandie (Nomad Train)',
        departRegion: Region.NORMANDIE,
        arriveRegion: Region.NORMANDIE,
        basePrice: 18.30, // ter.sncf.com/normandie
      },
      {
        name: 'Alençon → Le Mans',
        subtitle: 'TER Pays de la Loire (Aléop)',
        departRegion: Region.PAYS_DE_LA_LOIRE,
        arriveRegion: Region.PAYS_DE_LA_LOIRE,
        basePrice: 15.90, // Omio/ter.sncf.com tarif normal
      },
    ],
  },

  // ─── NANTES → BORDEAUX ─────────────────────────────────────────────
  // Itinéraire TER réel : Nantes → La Roche-sur-Yon → La Rochelle (TER PDL/NAQ)
  // puis La Rochelle → Bordeaux (TER NAQ)
  {
    id: 'nantes_bordeaux',
    label: 'Nantes → Bordeaux',
    from: 'NANTES',
    to: 'BORDEAUX',
    description: 'Pays de la Loire → Nouvelle-Aquitaine (via La Rochelle)',
    segments: [
      {
        name: 'Nantes → La Rochelle',
        subtitle: 'TER Pays de la Loire / NAQ',
        departRegion: Region.PAYS_DE_LA_LOIRE,
        arriveRegion: Region.NOUVELLE_AQUITAINE,
        basePrice: 28.60, // SNCF Connect tarif normal
      },
      {
        name: 'La Rochelle → Bordeaux',
        subtitle: 'TER Nouvelle-Aquitaine',
        departRegion: Region.NOUVELLE_AQUITAINE,
        arriveRegion: Region.NOUVELLE_AQUITAINE,
        basePrice: 27.30, // Omio/SNCF Connect tarif normal
      },
    ],
  },

  // ─── AMIENS → ORLÉANS ──────────────────────────────────────────────
  // Itinéraire : Amiens → Paris Nord (TER HdF) puis
  // Paris Austerlitz → Orléans (TER CVL)
  {
    id: 'amiens_orleans',
    label: 'Amiens → Orléans',
    from: 'AMIENS',
    to: 'ORLEANS',
    description: 'Hauts-de-France → IDF → Centre-Val de Loire',
    segments: [
      {
        name: 'Amiens → Paris Nord',
        subtitle: 'TER Hauts-de-France',
        departRegion: Region.HAUTS_DE_FRANCE,
        arriveRegion: Region.ILE_DE_FRANCE,
        basePrice: 28.00, // Omio tarif jour même
      },
      {
        name: 'Paris Austerlitz → Orléans',
        subtitle: 'TER Centre-Val de Loire (Rémi)',
        departRegion: Region.ILE_DE_FRANCE,
        arriveRegion: Region.CENTRE_VAL_DE_LOIRE,
        basePrice: 24.00, // SNCF Connect tarif normal
      },
    ],
  },

  // ─── RENNES → TOURS ────────────────────────────────────────────────
  // Itinéraire : Rennes → Nantes ou Le Mans (TER Bretagne/PDL) puis vers Tours
  {
    id: 'rennes_tours',
    label: 'Rennes → Tours',
    from: 'RENNES',
    to: 'TOURS',
    description: 'Bretagne → Pays de la Loire → CVL (via Le Mans)',
    segments: [
      {
        name: 'Rennes → Le Mans',
        subtitle: 'TER Bretagne / Pays de la Loire',
        departRegion: Region.BRETAGNE,
        arriveRegion: Region.PAYS_DE_LA_LOIRE,
        basePrice: 28.50, // SNCF Connect tarif normal
      },
      {
        name: 'Le Mans → Tours',
        subtitle: 'TER Pays de la Loire / CVL',
        departRegion: Region.PAYS_DE_LA_LOIRE,
        arriveRegion: Region.CENTRE_VAL_DE_LOIRE,
        basePrice: 19.80, // Omio/SNCF Connect tarif normal
      },
    ],
  },

  // ─── ROUEN → NANTES ────────────────────────────────────────────────
  // Itinéraire : Rouen → Caen → (Alençon) → Le Mans → Nantes
  // 3 segments, 2 régions
  {
    id: 'rouen_nantes',
    label: 'Rouen → Nantes',
    from: 'ROUEN',
    to: 'NANTES',
    description: 'Normandie → Pays de la Loire (via Caen, Le Mans)',
    segments: [
      {
        name: 'Rouen → Caen',
        subtitle: 'TER Normandie (Nomad Train)',
        departRegion: Region.NORMANDIE,
        arriveRegion: Region.NORMANDIE,
        basePrice: 24.80, // ter.sncf.com/normandie
      },
      {
        name: 'Caen → Le Mans',
        subtitle: 'TER Normandie → PDL (via Alençon)',
        departRegion: Region.NORMANDIE,
        arriveRegion: Region.PAYS_DE_LA_LOIRE,
        basePrice: 28.40, // SNCF Connect tarif normal
      },
      {
        name: 'Le Mans → Nantes',
        subtitle: 'TER Pays de la Loire (Aléop)',
        departRegion: Region.PAYS_DE_LA_LOIRE,
        arriveRegion: Region.PAYS_DE_LA_LOIRE,
        basePrice: 25.20, // Omio tarif normal
      },
    ],
  },

  // ─── STRASBOURG → PARIS EST ────────────────────────────────────────
  // Segment unique (mono-région, mais montre la Carte Fluo vs Avantage)
  {
    id: 'strasbourg_paris',
    label: 'Strasbourg → Paris',
    from: 'STRASBOURG',
    to: 'PARIS_EST',
    description: 'Grand Est → Île-de-France (TER direct)',
    segments: [
      {
        name: 'Strasbourg → Paris Est',
        subtitle: 'TER Grand Est (via Saverne, Sarrebourg, Nancy)',
        departRegion: Region.GRAND_EST,
        arriveRegion: Region.ILE_DE_FRANCE,
        basePrice: 51.20, // Omio TER tarif normal
      },
    ],
  },
];
