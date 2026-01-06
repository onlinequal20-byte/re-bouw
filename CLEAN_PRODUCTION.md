# 🧹 Clean Production Database

## ✅ Lokaal is al schoon!
Alle demo data is verwijderd van je lokale database:
- ✅ 32 klanten verwijderd
- ✅ 11 offertes verwijderd
- ✅ 6 facturen verwijderd
- ✅ 1 bonnetje verwijderd
- ✅ 85 prijslijst items verwijderd

## 🌐 Clean Vercel (Productie) Database

Wacht 2 minuten tot deployment klaar is, en voer dan dit uit:

### Optie 1: Via Browser Console (Makkelijkst)

1. Ga naar je domain: **https://jouw-domain.vercel.app**
2. Log in
3. Open Browser Console (F12 → Console tab)
4. Plak en run dit:

```javascript
fetch('/api/admin/clean-demo-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log('✅ Cleanup done:', data))
.catch(err => console.error('❌ Error:', err));
```

### Optie 2: Via cURL

```bash
curl -X POST https://jouw-domain.vercel.app/api/admin/clean-demo-data \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

## ✅ Klaar!
Je dashboard is nu helemaal leeg en klaar voor gebruik! 🎉

Je kunt nu beginnen met:
- Nieuwe klanten toevoegen
- Offertes maken
- Facturen versturen
- Bonnetjes uploaden
- Prijslijst invullen

