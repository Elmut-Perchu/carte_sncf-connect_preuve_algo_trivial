# Recherche APIs + Cartes régionales manquantes
> Recherche effectuée le 2026-03-22

---

## PARTIE A : SOURCES DE DONNÉES TARIFAIRES TER

### 1. SNCF Open Data — Datasets régionaux (MEILLEURE SOURCE)

**URL pattern** : `https://ressources.data.sncf.com/explore/dataset/tarifs-ter-{code_region}/`

| Région | Dataset ID | Dernière MAJ |
|--------|-----------|-------------|
| Auvergne-Rhône-Alpes | `tarifs-ter-aura` | 01/03/2025 |
| Bretagne | `tarifs-ter-bret` | 01/03/2025 |
| Centre-Val de Loire | `tarifs-ter-cvdl` | 01/01/2025 |
| Grand Est | `tarifs-ter-ge` (sur data.gouv.fr) | 01/03/2025 |
| Normandie | `tarifs-ter-norm` | 01/03/2025 |
| Nouvelle-Aquitaine | `tarifs-ter-naq` | 01/03/2025 |
| Occitanie | `tarifs-ter-occ` | 01/03/2025 |
| PACA | `tarifs-ter-paca` | 2025 |

- **Format** : CSV + JSON + PDF (grille détaillée en PDF)
- **Structure** : Par paire origine-destination (OD), en 2nde classe
- **Colonnes** : 3 catégories tarifaires par trajet : tarif normal, abonnement jeune, abonnement tout public
- **Authentification** : Aucune (Open Data)
- **Prix avec/sans carte** : CSV = tarifs normaux uniquement. Tarifs avec cartes dans les PDF annexes.

**Dataset consolidé national** : `https://www.data.gouv.fr/en/datasets/tarifs-ter/`
- Format CSV (3.1 MB), JSON (7.4 MB) — MAJ 30/05/2024 (archivé, préférer les régionaux)

### 2. API Navitia (officielle SNCF)

- **Doc** : https://doc.navitia.io/
- **Endpoint** : `/journeys` retourne un objet `fare`
- **Auth** : Clé API gratuite (Basic HTTP, username=clé)
- **Inscription** : https://numerique.sncf.com/startup/api/
- **Limites** : Objet `fare` peu documenté, probablement tarif plein uniquement

### 3. API oui.sncf / SNCF Connect (non officielle, reverse-engineered)

Documentée par GitHub [benoitdemaegdt/TGVmax](https://github.com/benoitdemaegdt/TGVmax/blob/master/doc/sncf.md) :

- **Calendar** : `GET https://www.oui.sncf/apim/calendar/train/v4/{origin}/{destination}/{startDate}/{endDate}/{cardCode}/{passengers}/{locale}`
  → Prix le plus bas par jour, paramètre `cardCode` pour carte de réduction
- **Travel** : `POST https://www.oui.sncf/proposition/rest/travels/outward/train`
  → `minPrice` par train
- **Auth** : Aucune documentée
- **⚠️ Risque** : Non officielle, peut casser sans préavis

### 4. Lyko (API commerciale)
- URL : https://lyko.tech/en/portfolio/train-api/sncf-connect-api/
- Couverture : TGV + TER — contrat commercial requis

### 5. Projets GitHub
| Projet | URL | Notes |
|--------|-----|-------|
| adipasquale/voyages-sncf-api | github.com/adipasquale/voyages-sncf-api | Scraper Scrapy |
| juliuste/sncf | github.com/juliuste/sncf | Archivé 2025, client JS |
| Kryzo/mcp-sncf | github.com/Kryzo/mcp-sncf | Actif, wrapper Python |

### 6. transport.data.gouv.fr
- **Résultat** : 0 dataset tarifaire TER. Contient GTFS (horaires) mais PAS les tarifs.

---

## PARTIE B : CARTES RÉGIONALES MANQUANTES

### 1. BRETAGNE — PAS de carte de réduction grand public

**Système tarifaire simplifié (depuis 2021)** : Paliers fixes par distance
- <29km : 5€
- 30-69km : 10€
- 70-109km : 15€
- 110-149km : 20€
- 150km+ : 28€

**Formules** :
- **Pack 5 voyages** : -20% à -40%
- **Carte BreizhGo Solidaire** : Gratuite, -75%, sous conditions de ressources
- **Carte KorriGo** : Support physique (PAS une carte de réduction)
- **Cartes nationales acceptées** : Carte Avantage (-30%), Carte Liberté (-50%)

**Inter-régional** : Extension vers PDL avec Solidaire uniquement

**Source** : breizhgo.bzh/tarifs-et-achats/ter

---

### 2. AUVERGNE-RHÔNE-ALPES — Carte illico Liberté

**illico Liberté** (26+) :
- **Prix** : 30€/an
- **Semaine** : -25%
- **WE/fériés/vacances** : -50%
- **Accompagnants** : Jusqu'à 3 personnes à -50% le WE
- **Couverture inter-régionale** : BFC, CVL, Occitanie, NAQ, PACA + Genève

**illico Liberté Jeunes** (12-25) :
- **Prix** : 15€/an
- **Réduction** : -50% tous les jours toute l'année
- **Couverture** : Identique

**illico Solidaire** : Gratuite, -75%, sous conditions

**Source** : ter.sncf.com/auvergne-rhone-alpes/tarifs-cartes/cartes-reduction

---

### 3. OCCITANIE — PAS de carte grand public (27-59 ans)

La carte LibertiO a été **supprimée le 31/07/2023** (trop peu d'utilisateurs).

**Formules par âge** :
- **LibertiO' Jeunes** (<27 ans) : Gratuit, -50% partout en Occitanie
- **Formule +=- (seniors 60+)** : Gratuit (compte mobilité Fairtiq), -10% à -90% progressif, plafond 97€/mois
- **Formule +=0 (12-26 ans)** : Gratuit dès le 11e trajet/mois
- **27-59 ans** : AUCUNE carte régionale. Cartes nationales uniquement (Avantage à 49€)

**Bons plans** : 1er samedi et dimanche du mois = 1€/trajet

**Source** : ter.sncf.com/occitanie/tarifs-cartes/ | lio-occitanie.fr/titres-et-tarifs/

---

### 4. PACA / Région Sud — Carte ZOU! Malin

- **Prix** : 20€/an
- **Réduction** : **-30% tous les jours** (pas de différence semaine/WE)
- **Accompagnant** : 1 personne bénéficie aussi du -30%
- **Âge** : À partir de 4 ans
- **Couverture inter-régionale** : **AURA et Occitanie** (-30% pour le titulaire)
- **Périmètre** : TER, bus LER, Chemin de fer de Provence

**Source** : ter.sncf.com/sud-provence-alpes-cote-d-azur/tarifs-cartes/cartes-reduction | zou.maregionsud.fr

---

### 5. BOURGOGNE-FRANCHE-COMTÉ — Carte TRAIN Mobigo+

- **Prix** : 20€/an
- **Semaine** : **-30%**
- **WE/fériés/vacances scolaires** : **-60%**
- **Accompagnant** : 1 personne au même tarif sans carte
- **Âge** : À partir de 12 ans
- **Couverture inter-régionale** : **AURA, CVL, et certains trajets vers Paris** (Bercy, Gare de Lyon)
- **Classe** : 2nde uniquement

**Source** : ter.sncf.com/bourgogne-franche-comte/tarifs-cartes/cartes-reduction

---

## TABLEAU RÉCAPITULATIF — TOUTES LES CARTES RÉGIONALES

| Région | Carte grand public | Prix | Semaine | WE | Âge | Inter-régional |
|--------|-------------------|------|---------|-----|-----|----------------|
| Normandie | Tempo +26 | 30€ | -25% | -50% | 26+ | Intra seulement (+Paris à 49€) |
| Normandie | Tempo Interrég. -26 | 10€ | -50% | -50% | <26 | BRE, PDL, CVL, HdF, IDF |
| Centre-VdL | Rémi Liberté | 30€ | -33% | -50% | 26+ | IDF, PDL, BFC, ARA, NAQ, NOR |
| Centre-VdL | Rémi Liberté Jeune | 0-20€ | -50% | -66% | <26 | Idem |
| Hauts-de-France | Ma Carte TER +26 | 30€ | -50% | -50% | 26+ | IDF, NOR, GE (partiel) |
| Hauts-de-France | Ma Carte TER -26 | 15€ | -50% | -50% | <26 | Idem |
| Grand Est | Fluo | 30€ | -50% | -50% | 26+ | IDF, HdF, BFC |
| Grand Est | Fluo Jeune | 10€ | -50% | -50% | <26 | Idem |
| Pays de la Loire | Mezzo | 30€ | -50% | -50% | 26+ | BRE, NOR, CVL, NAQ |
| Pays de la Loire | Mezzo -26 | 20€ | -50% | -50% | <26 | Idem |
| Nouvelle-Aquitaine | Carte+ | 29€ | -50% | -50% | 28+ | CVL, PDL, OCC, ARA |
| Bretagne | ❌ Aucune | — | — | — | — | Paliers fixes par distance |
| Auvergne-RA | illico Liberté | 30€ | -25% | -50% | 26+ | BFC, CVL, OCC, NAQ, PACA + Genève |
| Auvergne-RA | illico Liberté Jeunes | 15€ | -50% | -50% | 12-25 | Idem |
| Occitanie | ❌ Aucune (27-59) | — | — | — | 27-59 | Cartes nationales uniquement |
| Occitanie | LibertiO' Jeunes | Gratuit | -50% | -50% | <27 | Intra seulement |
| PACA | ZOU! Malin | 20€ | -30% | -30% | 4+ | ARA, OCC |
| BFC | TRAIN Mobigo+ | 20€ | -30% | -60% | 12+ | ARA, CVL, Paris |
| **Nationale** | Carte Avantage Adulte | 49€ | 25-30% | 25-50% | 27-59 | Variable (voir tableau détaillé) |
