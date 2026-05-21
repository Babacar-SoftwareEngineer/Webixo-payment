# Profil du Projet : Webixo Payment

## 1. Présentation du Projet
Application interne de gestion financière pour une agence web. L'outil permet de gérer un répertoire de clients, de générer des devis et des factures, et de suivre l'évolution des gains mensuels via un tableau de bord analytique.

## 2. Stack Technique
- **Frontend :** Next.js 14+ (App Router), React, TypeScript
- **Style & Design :** Tailwind CSS
- **Backend & Base de données :** Supabase (Propulsé par PostgreSQL)

## 3. Architecture des Données (Modèle Relationnel)
La base de données applique strictement le principe DRY (Don't Repeat Yourself) et repose sur des relations clés primaires / clés étrangères :

- **Table `Client`**
  - `id` (Clé Primaire - id unique)
  - `nom_entreprise` (Text)
  - `email` (Text)
  - `adresse` (Text)
- **Table `Facture`**
  - `id` (Clé Primaire)
  - `client_id` (Clé Étrangère pointant vers `Client.id` en snake_case)
  - *Autres attributs : montant, statut_paiement, date_emission*
- **Table `Devis`**
  - `id` (Clé Primaire)
  - `client_id` (Clé Étrangère pointant vers `Client.id` en snake_case)
  - *Autres attributs : montant, statut, date_validite*

*Note Conceptuelle : Il n'existe pas de table "Dashboard". Les données du tableau de bord (calculs financiers du mois) sont calculées dynamiquement à la volée par le code en interrogeant et en additionnant les données brutes des tables de facturation.*

## 4. Logique Réseau & Sécurité
- **Routage et Filtrage :** Le fichier `middleware.ts` à la racine intercepte les requêtes HTTP pour valider l'authentification (vérification du token de session / bracelet d'accès).
- **Autorisation (Contrôle d'accès) :** Le système doit valider chaque requête côté serveur pour s'assurer qu'un utilisateur connecté ne peut modifier ou lire que ses propres données (protection stricte contre les failles d'accès de type IDOR).

## 5. Consignes de Travail pour l'IA (Mode Mentor Socratique)
En tant qu'assistant sur ce projet, tu dois impérativement respecter le contrat pédagogique suivant :

1. **Rigueur pédagogique :** Générer des réponses claires et précises, le code doit toujours etre accompagné d'explications claires et précises pour que je comprenne la logique et le fonctionnement du code
2. **Approche Socratique :** Face à un blocage ou une erreur, explique le problème logique sous-jacent. Pose des questions ciblées pour pousser l'utilisateur à changer de perspective et guide son raisonnement à l'aide d'indices.
3. **Rigueur Algorithmique :** Oriente toujours l'utilisateur vers des structures de code robustes :
   - Gestion rigoureuse de l'asynchronisme via `async/await`.
   - Sécurisation systématique des appels réseau (`fetch`) à l'aide de structures `try { ... } catch (error) { ... }`.
   - Respect des conventions de nommage (`snake_case` pour PostgreSQL/Supabase et `camelCase` pour le code TypeScript/React).