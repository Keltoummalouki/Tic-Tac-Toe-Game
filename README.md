# Tic Tac Toe Dynamique – PlayInnovate

Bienvenue sur le projet **Tic Tac Toe Dynamique**, développé pour l'entreprise PlayInnovate, une start-up dédiée à l'innovation dans le gaming en ligne. Ce jeu revisite le célèbre "morpion" en offrant une expérience personnalisable et évolutive sur le web.

## Sommaire
- [Tic Tac Toe Dynamique – PlayInnovate](#tic-tac-toe-dynamique--playinnovate)
  - [Sommaire](#sommaire)
  - [Présentation](#présentation)
  - [Fonctionnalités](#fonctionnalités)
  - [Interface Utilisateur](#interface-utilisateur)
  - [Prise en main](#prise-en-main)
  - [Architecture du code](#architecture-du-code)
  - [Technologies utilisées](#technologies-utilisées)
  - [Tests et validation](#tests-et-validation)
  - [Contribution](#contribution)
  - [Licence](#licence)

---

## Présentation

Le jeu Tic Tac Toe de PlayInnovate permet à deux joueurs d’affronter en ligne avec une grille entièrement configurable (taille _n x n_ et condition de victoire _k_ alignements). Il s’adapte aussi bien aux débutants qu’aux joueurs aguerris, tout en offrant une interface moderne et responsive.

## Fonctionnalités

- **Grille dynamique** : Choisissez la taille (_n_) de la grille et le nombre d'alignements requis (_k_) pour gagner.
- **Deux joueurs** : Le joueur 1 commence, alternance automatique des tours.
- **Détection automatique** : Victoire si un joueur aligne _k_ symboles horizontalement, verticalement ou en diagonale.
- **Match nul** : Détecté si la grille est pleine sans gagnant.
- **Scores persistants** : Victoires, égalités sauvegardées en localStorage.
- **Personnalisation** : Choix des symboles des joueurs (X, O, ou autres), configuration simple via les paramètres.
- **Interface moderne** : Responsive, animations, accessible clavier/souris.
- **Boutons dédiés** : Nouvelle partie instantanée, réinitialisation des scores.

## Interface Utilisateur

- **Grille interactive** : Cliquez sur une case vide pour jouer.
- **Indicateur de joueur actif** : Couleur et symbole affichés.
- **Affichage du score** : Victoires de chaque joueur et nombre de matchs nuls.
- **Paramètres** : Configurez la taille de la grille, la condition de victoire et les symboles.
- **Accessibilité** : Navigation au clavier (flèches, Entrée/Espace).

## Prise en main

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Keltoummalouki/Tic-Tac-Toe-Game.git
   ```

2. **Ouvrir le jeu**
   - Ouvrez le fichier `index.html` dans votre navigateur (aucune installation requise).

3. **Jouer !**
   - Configurez les paramètres selon vos préférences.
   - Cliquez (ou utilisez le clavier) pour jouer.
   - Visualisez les scores et recommencez autant de parties que souhaité.

## Architecture du code

- **HTML (`index.html`)** : Structure de la page, composants du jeu et des paramètres.
- **CSS (`style.css`)** : Design moderne, animations, adaptation responsive.
- **JavaScript (`main.js`)** :
  - Gestion de la logique du jeu (détection des alignements, alternance des joueurs, victoire/nul).
  - Interactions DOM, mises à jour dynamiques de l’interface.
  - Sauvegarde et chargement des scores/préférences via `localStorage`.
  - Modularité : Fonctions dédiées à chaque aspect (jeu, interface, data).
  - Commentaires pour faciliter la maintenance.

## Technologies utilisées

- **HTML5**
- **CSS3** (flex, grid, animations, responsive design)
- **JavaScript Vanilla**

## Tests et validation

- **Cas classiques et limites** :
  - Différentes tailles de grille (de 3x3 à 10x10)
  - Conditions de victoire (_k_) variables
  - Joueurs avec symboles identiques/interdits
  - Navigation clavier et souris
  - Persistance des scores après rafraîchissement
  - Réinitialisation sans bug

- **Recommandation** : Tester sur desktop, tablette et mobile pour garantir la réactivité.

## Contribution

Les contributions sont les bienvenues !  
Merci de suivre les bonnes pratiques :
- Forkez le projet
- Proposez vos améliorations via Pull Request
- Documentez votre code et testez toutes les fonctionnalités

## Licence

Ce projet est proposé sous licence MIT.  
Voir le fichier [LICENSE](LICENSE) pour plus d’informations.

---

**PlayInnovate** – Tic Tac Toe Dynamique  
_Expérience de jeu flexible, moderne et accessible à tous !_