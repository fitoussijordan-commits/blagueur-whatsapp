# Blagueur WhatsApp

Génère une blague style Bigard et l'envoie sur WhatsApp en 1 clic.

## Déploiement depuis iPhone (sans terminal)

### 1. Clé Gemini (gratuite)
- https://aistudio.google.com/apikey
- "Create API key" → copie la clé

### 2. GitHub
- https://github.com/new → nom: `blagueur-whatsapp` → Private → Create
- Sur la page du repo → "uploading an existing file"
- Glisse tous les fichiers de ce ZIP (décompressé via l'app Fichiers)
- "Commit changes"

### 3. Vercel
- https://vercel.com/new → "Import" ton repo
- Dans Environment Variables :
  - Name: `GEMINI_API_KEY`
  - Value: (ta clé)
- Deploy

C'est tout. URL en ligne en ~1 minute.

## Stack
- Next.js 14 App Router
- Tailwind CSS
- Gemini 2.0 Flash (free tier: 15 req/min, 1500/jour)
- Edge runtime
