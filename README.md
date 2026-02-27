# FacturePro

Application de gestion de factures pour micro-entrepreneurs en France (Next.js 14, Supabase, TypeScript, TailwindCSS).

## Fonctionnalités

- **Authentification** : Supabase Auth (un utilisateur admin)
- **Dashboard** : Total facturé, en attente, payées, en retard, graphique des revenus mensuels
- **CRUD** : Clients, Services, Factures
- **Factures** : Numéro séquentiel annuel (YYYY-0001), statuts (brouillon, envoyée, payée, en retard), soft delete
- **PDF** : Génération via Puppeteer (HTML → PDF), stockage Supabase Storage
- **Email** : Envoi de la facture en pièce jointe (SMTP)
- **Conformité France** : Mentions légales, IBAN/BIC, pénalités de retard, indemnité forfaitaire 40€

## Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Supabase (PostgreSQL, Auth, Storage)
- Puppeteer-core + @sparticuz/chromium (PDF)
- Zod (validation)
- Nodemailer (email)

## Prérequis

- Node.js 18+
- Compte Supabase
- Compte Vercel (pour le déploiement)
- Serveur SMTP (pour l’envoi d’emails)

## Installation locale

```bash
# Cloner et entrer dans le projet
cd "faturas SSAS"

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Renseigner .env.local (voir ci-dessous)
```

### Variables d'environnement (.env.local)

```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Email (pour envoyer les factures)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=motdepasse
SMTP_FROM=FacturePro <noreply@votredomaine.fr>
```

## Configuration Supabase

### 1. Créer le projet

Créer un projet sur [supabase.com](https://supabase.com), noter l’URL et la clé anon.

### 2. Exécuter le schéma SQL

Dans le **SQL Editor** du dashboard Supabase, exécuter le fichier :

```
supabase/schema.sql
```

Cela crée les tables, la fonction `get_next_invoice_number`, les politiques RLS et le trigger.

### 3. Créer le bucket Storage

- Aller dans **Storage** > **New bucket**
- Nom : `invoices`
- **Public bucket** : activé (pour que les liens de téléchargement PDF fonctionnent)
- Créer le bucket puis, dans **Policies** du bucket `invoices`, ajouter une politique d’upload pour les utilisateurs authentifiés si nécessaire (par défaut les buckets publics permettent l’upload selon la config du projet).

### 4. Premier utilisateur (admin)

Créer un utilisateur via **Authentication** > **Users** > **Add user** (email + mot de passe), ou s’inscrire via l’app si vous avez activé l’inscription. Pour un seul admin, créer manuellement l’utilisateur dans le dashboard et désactiver l’inscription publique si besoin.

## Lancer en local

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Se connecter avec l’utilisateur Supabase créé.

## Déploiement sur Vercel

### 1. Préparer le dépôt

- Pousser le code sur GitHub (ou autre dépôt connecté à Vercel).

### 2. Créer le projet Vercel

- [vercel.com](https://vercel.com) > **Add New** > **Project**
- Importer le dépôt du projet
- Framework : **Next.js** (détecté automatiquement)
- Root directory : laisser par défaut (ou le dossier du projet si monorepo)

### 3. Variables d’environnement

Dans **Settings** > **Environment Variables**, ajouter :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase | Production, Preview |
| `SMTP_HOST` | Hébergeur SMTP | Production, Preview |
| `SMTP_PORT` | 587 (ou 465) | Production, Preview |
| `SMTP_USER` | Utilisateur SMTP | Production, Preview |
| `SMTP_PASS` | Mot de passe SMTP | Production, Preview |
| `SMTP_FROM` | Ex: FacturePro &lt;noreply@domaine.fr&gt; | Production, Preview |

### 4. Build et déploiement

- **Deploy** : Vercel build avec `next build`. Les dépendances `puppeteer-core` et `@sparticuz/chromium` sont gérées par `serverComponentsExternalPackages` dans `next.config.js`.
- Si le build échoue à cause de Chromium : vérifier que la région Vercel et la version de `@sparticuz/chromium` sont compatibles (voir la doc du package pour la version recommandée).

### 5. Redirection Auth Supabase

Dans le dashboard Supabase : **Authentication** > **URL Configuration** :

- **Site URL** : `https://votre-projet.vercel.app`
- **Redirect URLs** : ajouter `https://votre-projet.vercel.app/auth/callback`

## Structure du projet

```
src/
  app/
    api/           # Routes API (clients, services, invoices, settings, PDF, email)
    auth/callback  # Callback OAuth Supabase
    dashboard/     # Tableau de bord
    clients/       # CRUD clients
    services/      # CRUD services
    invoices/      # Liste, détail, création, édition, PDF, email
    settings/      # Paramètres entreprise
    login/         # Page de connexion
  components/
    layout/        # Sidebar, AppLayout
    ui/            # Card, etc.
    dashboard/     # MonthlyChart
    clients/       # ClientForm
    services/      # ServiceForm
    invoices/      # InvoiceForm, InvoiceActions
    settings/      # SettingsForm
  lib/
    supabase/      # Client navigateur, serveur, middleware
    types/         # Types base de données
    validations/   # Schémas Zod
    pdf/           # Template HTML facture, génération PDF (Puppeteer)
    email/         # Envoi email (Nodemailer)
supabase/
  schema.sql       # Schéma complet (tables, RLS, fonction numéro facture)
```

## Numéro de facture

Le numéro est généré de façon **séquentielle et annuelle** (ex. `2025-0001`, `2025-0002`) via la fonction PostgreSQL `get_next_invoice_number()`, appelée dans une requête d’insertion pour éviter les doublons.

## Licence

Privé / usage personnel ou commercial selon votre choix.
