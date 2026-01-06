# 🔧 Fix Upload op Vercel - BELANGRIJK!

## Probleem
De upload werkt lokaal maar niet op je domain (Vercel) omdat de `SUPABASE_SERVICE_ROLE_KEY` ontbreekt.

## ✅ Oplossing (2 minuten)

### Stap 1: Ga naar Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Klik op je project: **amsbouwers-dashboard**
3. Klik op **Settings** (bovenaan)
4. Klik op **Environment Variables** (links)

### Stap 2: Voeg de Service Role Key toe
Klik op **Add New** en voeg toe:

**Name:**
```
SUPABASE_SERVICE_ROLE_KEY
```

**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtYWNrcXplZXVxemx5bXFnYnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0NzQxNSwiZXhwIjoyMDgzMjIzNDE1fQ.iGRKRrtoJbTXSrPS2Nt87Kw3zqHWXe_vwS4o3J89AYM
```

**Environment:** Selecteer **Production, Preview, Development** (alle 3)

Klik op **Save**

### Stap 3: Redeploy
1. Ga naar **Deployments** tab
2. Klik op de **3 dots** (...) bij de laatste deployment
3. Klik op **Redeploy**
4. Wacht 1-2 minuten

## ✅ Klaar!
Upload werkt nu op je domain!

---

## Test het:
1. Ga naar: https://jouw-domain.vercel.app/kosten
2. Upload een bonnetje
3. Vul bedrag en omschrijving in
4. Het werkt! ✅

