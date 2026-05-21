# 💳 Webixo Payment

**Webixo Payment** est une application web interne et moderne de gestion financière conçue spécifiquement pour les agences web. Elle permet de centraliser la gestion des clients, de concevoir et d'émettre des devis et des factures via un éditeur interactif en temps réel, de suivre l'évolution des gains mensuels sur un tableau de bord analytique, et de générer des exports PDF haute fidélité prêts à être partagés.

---

## 🚀 Fonctionnalités Clés

### 📊 1. Tableau de bord Analytique (Dashboard)
- **Indicateurs clés (KPIs) :** Calcul en temps réel du chiffre d'affaires global, du total encaissé, des factures en attente et en retard.
- **Bénéfices Mensuels :** Graphique interactif permettant de comparer l'évolution des bénéfices sur 1 mois ou 12 mois.
- **Architecture DRY :** Les indicateurs financiers ne sont pas stockés en base de données, ils sont recalculés dynamiquement à la volée en interrogeant directement les tables transactionnelles de facturation.

### 👥 2. Répertoire Clients
- **Gestion des fiches :** Création et modification des informations d'un client (nom de l'entreprise, adresse email, adresse physique, interlocuteur).
- **Synchronisation automatique :** Les données clients sont partagées à travers toute l'application et alimentent instantanément les formulaires de facturation et de devis.

### 📄 3. Éditeur de Factures Interactif
- **Split-Screen Layout :** Saisie des informations à gauche (informations de paiement, coordonnées bancaires, notes, clauses de retard, services, quantités, tarifs unitaires) avec mise à jour en temps réel de la feuille de facturation stylisée à droite.
- **Envoi d'Email :** Génération de liens `mailto:` automatiques pré-remplis avec l'adresse email du client, l'objet formel et le corps du message structuré.
- **Processus d'encaissement :** Boutons d'actions rapides pour enregistrer en brouillon, marquer comme encaissé ou relancer par SMS/Email en cas de retard.

### 📝 4. Rédacteur de Devis & Propositions Commerciales
- **Lots de travaux :** Découpage de l'offre en plusieurs natures de lots de travaux distincts et tarification modulaire.
- **Suivi et Conversion :** Module de suivi de statut (Brouillon, Envoyé, Accepté, Refusé) avec possibilité de convertir un devis validé en facture active en un seul clic.

---

## 🎨 Design System & Esthétique Premium

L'application applique une charte graphique premium, vivante et épurée :
- **Color Palette :** Vert émeraude profond (`#046A4E`), gris ardoise élégants (`slate`), arrières-plans neutres et aérés.
- **Micro-animations :** Transitions fluides lors de la navigation latérale et des ouvertures d'accordéons de saisie.
- **Effet Papier Imprimable :** Conception de feuilles d'aperçu d'aspect physique avec des ombres extrêmement légères (`shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100`) et typographies élégantes (`Outfit` pour la structure de texte, `Georgia` en italique pour les blocs de signature).
- **Responsive Web Design :** Interface 100% adaptée et pensée pour la consultation sur mobile, tablette et desktop.

---

## 🛠️ Stack Technique

- **Frontend :** [Next.js 14+](https://nextjs.org/) (App Router), React, TypeScript
- **Styling :** [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
- **Backend & Base de données :** [Supabase](https://supabase.com/) (PostgreSQL)
- **Moteur PDF :** [html2pdf.js](https://github.com/eKoopmans/html2pdf.js/) (`html2canvas` + `jsPDF`)

---

## 🧬 Innovation Technique : Le Duplicateur de Styles Calculés

L'utilisation de **Tailwind CSS v4** introduit des formats de couleurs ultra-modernes (comme `oklch()`) à travers toute la feuille de style globale compilée. Le parseur classique de `html2pdf.js` (`html2canvas`) plante systématiquement lors de l'analyse de ces chaînes de couleurs non reconnues.

Pour résoudre cela tout en conservant une fidélité visuelle absolue sans crash :
1. **Évaluation en direct :** Au clic sur "Télécharger PDF", notre algorithme parcourt l'arbre DOM de l'aperçu réel et lit les styles calculés résolus par le navigateur (lesquels traduisent toutes les variables et fonctions complexes en pixels absolus et couleurs `rgb()` ou `rgba()`).
2. **Clonage inline :** Ces styles calculés sont directement injectés en tant qu'attributs `style` inline sur les nœuds du clone DOM de `html2canvas`.
3. **Suppression des styles Tailwind :** Toutes les feuilles de styles Tailwind sont ensuite désactivées sur le document cloné pour éviter le crash du parseur.
4. **Maintien des polices :** Seules les balises `@font-face` nécessaires au rendu vectoriel des polices (Outfit & Georgia) sont conservées, ce qui assure un PDF final 100% similaire à l'aperçu écran de l'application web.

---

## 💾 Modèle Relationnel (PostgreSQL / Supabase)

L'architecture de la base de données est structurée en relations clés primaires / clés étrangères :

### Table `Client`
- `id` (uuid, Clé Primaire)
- `nom_entreprise` (text)
- `email` (text)
- `adresse` (text)
- `nom_contact` (text)

### Table `Facture`
- `id` (uuid, Clé Primaire)
- `client_id` (uuid, Clé Étrangère pointant vers `Client.id`)
- `service` (text)
- `montant` (numeric)
- `statut_paiement` (text : *Terminé, En attente, En retard*)
- `date_emission` (date)

### Table `Devis`
- `id` (uuid, Clé Primaire)
- `client_id` (uuid, Clé Étrangère pointant vers `Client.id`)
- `service` (text)
- `montant` (numeric)
- `statut` (text : *Brouillon, Envoyé, Accepté, Refusé*)
- `date_validite` (text)

---

## ⚙️ Installation & Démarrage

### 1. Cloner le dépôt et installer les dépendances
```bash
git clone https://github.com/Babacar-SoftwareEngineer/Webixo-payment.git
cd Webixo-payment
npm install
```

### 2. Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine du projet et configurez vos accès Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique_anon
```

### 3. Lancer le serveur de développement local
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### 4. Compiler pour la production
```bash
npm run build
npm start
```
