# Family Expenses PWA

PWA minimale per registrare e rivedere le spese familiari. Stack: Next.js (App Router) + TypeScript + Tailwind v4 + Supabase (Postgres + Auth + RLS). Deploy previsto su Vercel con Supabase come backend unico.

## Prerequisiti

- Node 18+
- Account Supabase con il progetto `xxxx`
- Variabili ambiente configurate

## Setup locale

```bash
git clone https://github.com/claudiobottari/expenses.git
cd expenses
cp .env.example .env.local  # inserisci la anon key
npm install
npm run dev
```

Variabili richieste in `.env.local` (e in Vercel):

- `NEXT_PUBLIC_SUPABASE_URL=https://___.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_`

## Flussi principali

- **Autenticazione**: email + password con Supabase Auth. Registrazione crea household, profilo e categorie/portafogli di default.
- **Dashboard**: totale mese corrente, ultime spese, breakdown per categoria.
- **Spese**: inserimento rapido, modifica inline, filtri per categoria/portafoglio e ricerca testo.
- **Riepilogo**: totali per categoria in un intervallo data.
- **Categorie/Portafogli**: creazione, attivazione/disattivazione.
- **Impostazioni**: profilo utente, nome household, logout.

## Struttura cartelle

- `src/app/(auth)`: pagine login/registrazione.
- `src/app/(app)`: pagine protette (dashboard, spese, riepilogo, categorie, portafogli, impostazioni).
- `src/components`: provider Supabase, guardia auth, shell di navigazione, logo, PWA register.
- `supabase/schema.sql`: schema Postgres + RLS da applicare al progetto Supabase.
- `public/manifest.json` e `public/sw.js`: PWA manifest e service worker.

## Schema dati (Postgres)

- `households`: nucleo familiare.
- `profiles`: profilo utente (1:1 con `auth.users`), collegato a `households`.
- `wallets`: conti/carte, `is_active`.
- `categories`: categorie condivise, `type` (`expense|income`), colori opzionali, `is_active`.
- `expenses`: spese con riferimenti a `wallets`, `categories`, autore (`created_by`), data, importo.
- `recurring_expenses`: struttura per ricorrenze future.
- `attachments`: percorsi file ricevute (Supabase Storage).

Indici: household_id per tutte le tabelle, date su `expenses`, `category_id` su `expenses`.

## Sicurezza / RLS

RLS attivo su tutte le tabelle dati. Politica: un utente autenticato vede/scrive solo righe del proprio household (`household_id = profiles.household_id`).

Per applicare schema e policy:

```bash
# dalla root del repo, con supabase CLI loggata
supabase db execute --file supabase/schema.sql
```

Oppure incolla il contenuto di `supabase/schema.sql` nella SQL editor di Supabase.

## Deploy su Vercel

1. Connetti il repository GitHub a Vercel.
2. Imposta le env vars del progetto Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
3. Deploy automatico da `main`. Nessuna build step custom oltre a `npm run build`.

## Note PWA

- `manifest.json` con icone SVG (192/512), start_url `/dashboard`, tema `#0f766e`.
- `public/sw.js` per caching leggero dell'UI shell.
- Layout mobile-first e bottom-nav per uso da telefono / installazione A2HS.
