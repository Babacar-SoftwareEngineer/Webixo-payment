# Design System - Webixo Payment

Ce document définit la charte graphique et technique, les jetons de design (design tokens) et les directives d'implémentation de **Webixo Payment**. Toutes les pages futures et fonctionnalités de l'application doivent s'appuyer strictement sur ce système afin de garantir une cohérence visuelle et algorithmique absolue.

---

## 🎨 1. Jetons de Design (Design Tokens)

### Palette de Couleurs Sémantiques

La palette de couleurs est conçue autour d'une esthétique SaaS Premium, utilisant le vert émeraude comme couleur identitaire et des tons HSL harmonisés pour les indicateurs de statuts.

| Categorie | Token CSS (Tailwind) | Valeur Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Marque (Primaire)** | `brand-primary` | `#046A4E` | Boutons principaux, liens actifs, accents forts |
| **Marque (Survol)** | `brand-hover` | `#03543E` | État de survol des éléments primaires |
| **Marque (Léger)** | `brand-light` | `#A3D1C6` | Bordures actives, fonds secondaires, barres de graphes |
| **Marque (Fond)** | `brand-bg` | `#F3FAF7` | Fonds de cartes actives ou indicateurs positifs |
| **Marque (Sombre)** | `brand-dark` | `#013C2B` | Textes de marque très contrastés |
| **Succès (Payé)** | `success-bg` / `success-text` | `#ECFDF5` / `#065F46` | Badges "Terminé", montants encaissés |
| **Attente (En attente)** | `warning-bg` / `warning-text` | `#FFFBEB` / `#92400E` | Badges "En attente", factures non échues |
| **Danger (Retard)** | `danger-bg` / `danger-text` | `#FEF2F2` / `#991B1B` | Badges "En retard", alertes de recouvrement |
| **Neutre / Soft** | `slate-50` à `slate-900` | Variable | Fonds d'écran, textes principaux, bordures neutres |

### Typographie et Hiérarchie

* **Police de Titres (Headings) :** `Outfit` (sans-serif) - pour les titres de section, KPIs majeurs et en-têtes de cartes. Donne une signature moderne et géométrique.
* **Police de Labeurs (Body) :** `Inter` (sans-serif) - pour les textes de paragraphe, les tableaux et les contrôles de formulaire. Offre une lisibilité optimale.

### Élévations et Arrondis (Elevation & Borders)

* **Arrondis standards :**
  * `rounded-3xl` (`24px`) : Grandes cartes (`Card`) et conteneurs principaux.
  * `rounded-2xl` (`16px`) : Modals, dropdowns, champs de saisie (`Input`), boutons de filtres.
  * `rounded-xl` (`12px`) : Boutons d'action standards, petits badges d'icône.
  * `rounded-full` : Badges de statut textuels, avatars circulaires.
* **Effet d'élévation (Micro-animations) :**
  * Toutes les cartes interactives doivent utiliser la transition fluide :
    `hover:-translate-y-0.5 hover:shadow-md transition-all duration-300`

---

## 🧩 2. Bibliothèque de Composants UI Atomiques

Tous les composants listés ci-dessous sont typés strictement en TypeScript, compatibles avec React 19 et Next.js (App Router), et situés dans `src/components/ui/`.

### 2.1 Boutons (`Button`)
* **Propriétés :** `variant` (`primary`, `secondary`, `outline`, `ghost`, `danger`), `size` (`sm`, `md`, `lg`), `isLoading` (affiche un spinner animé et désactive le bouton).
```tsx
import { Button } from "@/components/ui/Button";

// Bouton Primaire standard
<Button onClick={handleSave}>Enregistrer</Button>

// Bouton avec état de chargement asynchrone
<Button isLoading={loading} variant="primary">
  Sauvegarder les modifications
</Button>
```

### 2.2 Cartes (`Card`)
* **Propriétés :** `interactive` (active l'effet d'élévation au survol). Gère sémantiquement le `CardHeader`, `CardBody` et `CardFooter`.
```tsx
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

<Card interactive>
  <CardHeader title="Titre de la section" description="Sous-titre descriptif" />
  <CardBody>
    Contenu applicatif...
  </CardBody>
</Card>
```

### 2.3 Badges de Statut (`Badge`)
* **Propriétés :** `variant` (`brand`, `success`, `warning`, `danger`, `info`, `neutral`).
```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="success">Terminé</Badge>
<Badge variant="warning">En attente</Badge>
<Badge variant="danger">En retard</Badge>
```

### 2.4 Champs de Saisie (`Input`)
* **Propriétés :** `label`, `error`, `icon` (icône Lucide à gauche), `disabled`.
```tsx
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

<Input 
  label="Rechercher un client"
  icon={<Search size={16} />}
  placeholder="Nom ou e-mail..."
  value={search}
  onChange={e => setSearch(e.target.value)}
/>
```

### 2.5 Tableaux Responsive (`Table`)
* **Structure unifiée :**
```tsx
import { 
  TableContainer, Table, TableHeader, TableRow, TableCell, TableHeadCell, TableBody 
} from "@/components/ui/Table";

<TableContainer>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHeadCell>Client</TableHeadCell>
        <TableHeadCell>Montant</TableHeadCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-bold">CLASS SHOES</TableCell>
        <TableCell>400 000 CFA</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

---

## ⚡ 3. Modèle Relationnel DRY & Flux de Données

Pour respecter la logique relationnelle de la base de données (Supabase / PostgreSQL) sans duplication d'attributs (principe DRY), les règles suivantes s'appliquent :

1. **Aucune donnée agrégée en dur :** Les chiffres du Dashboard et des Rapports (taux de recouvrement, totaux facturés, top clients) doivent toujours être calculés dynamiquement dans le code (`useMemo`) en interrogeant les tables brutes `Client` et `Facture`.
2. **Jointures côté Client :** Toute référence à un client dans une facture ou un devis se fait par son identifiant unique (`client_id`). Le code résout le nom et l'avatar du client à la volée :
   ```typescript
   const clientName = clients.find(c => c.id === facture.client_id)?.nom_entreprise;
   ```
3. **Transition Automatique :** Lorsqu'un devis est accepté, l'action `convertDevisToFacture(devisId)` doit être appelée pour cloner les attributs pertinents (`client_id`, `service`, `montant`) dans une nouvelle ligne de facture de statut `"En attente"`, assurant une fluidité totale de la trésorerie.

---

## 📝 4. Règles d'Implémentation d'une Nouvelle Feature

Lors de l'ajout d'une nouvelle page ou d'une nouvelle fonctionnalité :

1. **Vérification de l'État :** Importer `useAppState()` depuis `@/hooks/useAppState` pour lire et modifier les données.
2. **Hydration SSR :** Toujours vérifier si `isLoaded` est vrai avant d'afficher des données dépendantes du `localStorage` pour éviter des erreurs d'hydratation Next.js.
3. **Usage strict du Design System :** Interdiction d'utiliser des couleurs arbitraires (ex: `bg-red-500`, `text-blue-600` ad-hoc). Employer uniquement les classes définies et nos composants atomiques.
4. **Asynchronisme & Réseau :** Envelopper tout appel réseau ou simulation d'écriture dans un bloc `try/catch` avec un état de chargement (`isLoading`).
