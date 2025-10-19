# Changelog - Training App

## 🎉 Nouvelle Version - Système d'Entraînement Dynamique

### ✨ Nouvelles Fonctionnalités

#### 1. Choix du Nombre de Séances par Semaine
- L'utilisateur peut maintenant choisir entre 2, 3, 4 ou 5 séances par semaine
- Ce choix se fait dans le profil utilisateur lors de la première connexion
- Peut être modifié à tout moment via le bouton "Modifier"

#### 2. 15 Entraînements Variés
Nous avons créé une base de données de 15 entraînements différents:

1. **Corps Complet - Force** - Full body avec focus force
2. **Cardio Intensif + Abdos** - Cardio HIIT et core
3. **Haut du Corps** - Upper body complet
4. **Jambes et Fessiers** - Lower body intense
5. **HIIT Circuit** - Circuit haute intensité
6. **Endurance Cardio** - Cardio longue durée
7. **Force - Push** - Exercices de poussée
8. **Force - Pull** - Exercices de traction
9. **Core et Stabilité** - Focus abdominaux et stabilité
10. **Mobilité et Force Fonctionnelle** - Mouvements fonctionnels
11. **Circuit Métabolique** - Circuits brûle-graisses
12. **Yoga Strength** - Yoga force et flexibilité
13. **Puissance et Explosivité** - Entraînement explosif
14. **Active Recovery** - Récupération active
15. **Superset Challenge** - Supersets avancés

#### 3. Génération Aléatoire Hebdomadaire
- Chaque semaine génère automatiquement un nouveau plan aléatoire
- Le système évite de répéter les mêmes entraînements d'une semaine à l'autre
- Les plans sont sauvegardés dans le localStorage
- Fini la monotonie - chaque semaine est différente!

### 🔧 Modifications Techniques

#### Fichiers Modifiés:
- **`src/App.vue`** - Système dynamique de workouts avec computed properties
- **`src/components/ProfileModal.vue`** - Ajout du champ sessions_per_week
- **`supabase-setup.sql`** - Ajout de la colonne sessions_per_week

#### Nouveaux Fichiers:
- **`src/workouts-data.js`** - Base de données des 15 entraînements + fonction de génération

### 📊 Comment ça Fonctionne

1. **Première Connexion:**
   - L'utilisateur choisit son nombre de séances par semaine (2-5)
   - Le système génère automatiquement la semaine 1

2. **Semaine 1:**
   - Ex: Si tu choisis 3 séances, tu auras 3 entraînements sélectionnés aléatoirement parmi les 15

3. **Changement de Semaine:**
   - Quand tu passes à la semaine 2, le système génère 3 NOUVEAUX entraînements
   - Il évite de te donner les mêmes que la semaine précédente
   - Chaque semaine est unique!

4. **Historique:**
   - Tes plans hebdomadaires sont sauvegardés
   - Tu peux revenir en arrière voir les semaines précédentes
   - Tes séances complétées sont trackées par semaine

### 🗄️ Mise à Jour Supabase Requise

⚠️ **IMPORTANT:** Tu dois exécuter le fichier SQL mis à jour dans Supabase:

```bash
# Ouvre supabase-setup.sql et exécute-le dans SQL Editor de Supabase
```

Cela va ajouter la colonne `sessions_per_week` à la table `profiles`.

### 🚀 Pour Tester

1. Assure-toi d'avoir exécuté le SQL dans Supabase
2. Lance l'app: `npm run dev`
3. Déconnecte-toi et reconnecte-toi (ou crée un nouveau compte)
4. Choisis ton nombre de séances par semaine
5. Regarde tes entraînements générés!
6. Change de semaine pour voir de nouveaux entraînements

### 🎯 Prochaines Étapes Possibles

- Ajouter plus d'entraînements (20, 30, etc.)
- Filtrer par type d'objectif (cardio pour perte de poids, force pour muscle)
- Permettre de "reroller" un entraînement spécifique qu'on n'aime pas
- Statistiques sur les types d'entraînements complétés

---

**Date:** ${new Date().toLocaleDateString('fr-FR')}
**Version:** 2.0.0 - Système Dynamique
