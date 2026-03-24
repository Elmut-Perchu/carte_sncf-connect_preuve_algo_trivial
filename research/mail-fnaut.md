# Mail à la FNAUT

**À** : secretariat@fnaut.fr
**Cc** : nina.soto@fnaut.fr
**Objet** : Preuve technique — SNCF Connect surfacture les détenteurs de cartes de réduction sur les trajets inter-régionaux

---

Madame Soto,

Je me permets de vous contacter en tant que citoyen et développeur, au sujet d'un dysfonctionnement systémique de SNCF Connect que j'ai pu démontrer techniquement.

## Le problème

Lorsqu'un voyageur possède plusieurs cartes de réduction (par exemple une Carte Avantage et une carte TER régionale), SNCF Connect ne sélectionne pas automatiquement la carte la plus avantageuse pour chaque segment du trajet. Le système applique soit une seule carte — pas nécessairement la meilleure —, soit aucune, sans avertir l'utilisateur. Le voyageur paie alors le tarif plein sans le savoir.

Ce bug est particulièrement pénalisant sur les trajets inter-régionaux (ex. : Rouen → Bourges via Paris, qui traverse trois régions TER), où la carte optimale varie d'un segment à l'autre.

## Ce que j'ai développé

J'ai construit un outil open source, « Preuve Citoyenne SNCF », qui démontre qu'un algorithme trivial résout ce problème :

- **Données** : 18 098 tarifs officiels SNCF Open Data (data.gouv.fr), 2 196 gares, 11 régions TER
- **Algorithme** : pour chaque segment, tester chaque carte éligible et retenir le meilleur tarif — complexité O(S × C), temps d'exécution inférieur à 1 milliseconde
- **Résultat** : sur les trajets testés, des économies de 15% à 40% par rapport au comportement actuel de SNCF Connect

Il n'existe aucune justification technique à l'absence de cet algorithme dans SNCF Connect.

## Les victimes sont documentées

J'ai compilé un dossier de témoignages et d'études qui confirment le phénomène :

- **Forum UFC-Que Choisir** : un utilisateur avec Carte Avantage Senior + Carte Régionale Grand Est a payé le tarif plein sur Paris–Orléans. SNCF a reconnu le bug et conseillé de « décocher la carte régionale » — sans remboursement. Une autre utilisatrice qualifie le problème de « vrai scandale » sur Rennes–Angers.
- **Handicap.fr** : depuis janvier 2024, un bug empêche les personnes handicapées d'obtenir la gratuité de l'accompagnant lorsqu'une Carte Avantage est active. Surcharge constatée : 23,50 € sur Paris–Lyon. SNCF a reconnu le bug sans fournir de calendrier de correction.
- **UFC-Que Choisir** (octobre 2024) : étude sur 24 trajets, écarts de prix jusqu'à 85% selon la plateforme.
- **Familles Rurales** (mars 2025) : même train facturé entre 39 € et 118 €, lettre au Premier Ministre.
- **TotalBug.com** : plus de 220 pages de bugs signalés sur SNCF Connect.
- **Trustpilot** : plus de 1 100 avis, dont des cartes achetées mais jamais reconnues par le système.

## Ce que je propose

Mon objectif n'est pas un remboursement personnel (je n'y suis pas non plus opposé) — c'est la défense de l'intérêt collectif. Je souhaite mettre mon outil et mon dossier à disposition de la FNAUT pour :

1. **Documenter le préjudice** de manière technique et chiffrée, avec les données officielles de la SNCF elle-même
2. **Appuyer une action collective** si la FNAUT estime que les conditions sont réunies (loi n°2025-391 du 30 avril 2025)
3. **Alerter les médias** avec une démonstration concrète et reproductible du problème

Je sais que M. Quidort a déjà dénoncé publiquement l'opacité tarifaire de la SNCF, et que la FNAUT est l'association agréée la plus légitime sur les sujets de transport ferroviaire. Mon outil apporte la pièce manquante : la preuve technique que le problème est trivial à résoudre et que SNCF fait le choix de ne pas le corriger.

## Pièces disponibles

- Outil en ligne (code source + démonstration)
- Dossier de 7 conflits de cartes documentés avec sources
- Compilation de témoignages et études institutionnelles
- Données SNCF Open Data utilisées (18 098 paires origine-destination)

Je suis disponible par téléphone ou en personne à Paris pour en discuter.

Cordialement,

Jacques Aupepin
[téléphone]
[email]
