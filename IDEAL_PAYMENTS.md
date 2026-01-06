# 💳 iDEAL Betalingen met Mollie - Implementatie Compleet!

## ✅ Wat is er toegevoegd?

Je kunt nu **online betalingen accepteren** via iDEAL op je facturen! Klanten kunnen direct vanuit de factuur betalen met hun bank.

## 🎯 Functionaliteit

### Voor Jou (Beheerder):
- ✅ Mollie configuratie in instellingen
- ✅ Automatische betalingsverwerking
- ✅ Factuurstatus wordt automatisch bijgewerkt naar "Betaald"
- ✅ Betalingsgeschiedenis in factuur notities
- ✅ Webhook voor real-time updates

### Voor Klanten:
- ✅ "Betaal met iDEAL" knop op facturen
- ✅ Veilige betaling via Mollie
- ✅ Directe bevestiging na betaling
- ✅ Automatische redirect naar status pagina

## 📋 Setup Instructies

### Stap 1: Mollie Account Aanmaken

1. Ga naar [mollie.com](https://www.mollie.com)
2. Klik op "Aanmelden" rechtsboven
3. Vul je bedrijfsgegevens in
4. Verifieer je email adres
5. Voltooi de onboarding (KYC verificatie)

### Stap 2: API Key Ophalen

1. Log in op je Mollie dashboard
2. Ga naar **Developers** → **API keys**
3. Je ziet twee soorten keys:
   - **Test API key** (begint met `test_`) - Voor testen
   - **Live API key** (begint met `live_`) - Voor echte betalingen

4. Kopieer de gewenste API key

### Stap 3: API Key Configureren in Dashboard

1. Log in op je AMS Bouwers dashboard
2. Ga naar **Instellingen**
3. Klik op het **"Mollie Betalingen"** tabblad
4. Plak je API key in het veld
5. Klik op **"Instellingen opslaan"**

### Stap 4: Webhook Configureren (Belangrijk!)

Voor automatische betalingsbevestiging moet je de webhook URL instellen in Mollie:

1. Ga naar je Mollie dashboard
2. Ga naar **Developers** → **Webhooks**
3. Klik op **"+ Webhook"**
4. Vul in:
   - **Webhook URL:** `https://amsbouwer-dashboard.vercel.app/api/webhooks/mollie`
   - **Description:** "AMS Bouwers Dashboard"
5. Klik op **"Create webhook"**

## 🚀 Hoe te Gebruiken

### Voor Beheerders:

1. **Factuur aanmaken** zoals normaal
2. **Factuur versturen** naar klant (via email of link delen)
3. **Wachten** tot klant betaalt
4. **Automatisch** wordt de factuur bijgewerkt naar "Betaald"

### Voor Klanten:

1. **Open factuur** in dashboard of via link
2. **Klik** op "Betaal met iDEAL" knop
3. **Kies** je bank bij Mollie
4. **Bevestig** betaling in je banking app
5. **Klaar!** Je wordt teruggeleid naar bevestigingspagina

## 📊 Betalingsflow

```
1. Klant opent factuur
   ↓
2. Klant klikt "Betaal met iDEAL"
   ↓
3. Redirect naar Mollie betaalpagina
   ↓
4. Klant selecteert bank
   ↓
5. Klant bevestigt in banking app
   ↓
6. Mollie stuurt webhook naar jouw systeem
   ↓
7. Factuur wordt automatisch bijgewerkt naar "Betaald"
   ↓
8. Klant ziet bevestigingspagina
```

## 🔧 Technische Details

### Nieuwe Bestanden:

1. **`/lib/mollie.ts`**
   - Mollie client initialisatie
   - Payment creation
   - Payment status checking

2. **`/app/api/facturen/[id]/betalen/route.ts`**
   - API endpoint voor betaling aanmaken
   - Berekent openstaand bedrag
   - Maakt Mollie payment aan

3. **`/app/api/webhooks/mollie/route.ts`**
   - Webhook handler voor Mollie
   - Verwerkt betalingsstatussen
   - Werkt factuur bij

4. **`/app/betaling/status/page.tsx`**
   - Betalingsstatus pagina
   - Toont succes/fout meldingen
   - Redirect opties

5. **`/components/payment-button.tsx`**
   - Client component voor betaalknop
   - Loading states
   - Error handling

### Database Updates:

Geen schema wijzigingen nodig! Betalingsinformatie wordt opgeslagen in:
- `Factuur.status` → "Betaald" na succesvolle betaling
- `Factuur.betaaldBedrag` → Verhoogd met betaald bedrag
- `Factuur.notities` → Mollie Payment ID en details

### Environment Variables:

Geen nieuwe environment variables nodig! De Mollie API key wordt opgeslagen in de database via Settings.

## 💰 Kosten

### Mollie Transactiekosten:

- **iDEAL:** €0,29 per transactie
- **Geen** maandelijkse kosten
- **Geen** setup kosten
- **Geen** verborgen kosten

### Uitbetaling:

- Automatisch naar je bankrekening
- Standaard binnen 1-2 werkdagen
- Gratis uitbetalingen

## 🧪 Testen

### Test Mode:

1. Gebruik je **Test API key** in instellingen
2. Maak een testfactuur aan
3. Klik op "Betaal met iDEAL"
4. Bij Mollie zie je test banks:
   - **TBM Bank** - Altijd succesvol
   - **TBM Bank (failed)** - Altijd mislukt
   - **TBM Bank (cancelled)** - Altijd geannuleerd
5. Voltooi testbetaling
6. Check of factuur status is bijgewerkt

### Live Mode:

1. Wissel naar **Live API key** in instellingen
2. Test met een echte factuur (klein bedrag)
3. Betaal met je eigen bank
4. Verifieer dat alles werkt

## 🔒 Beveiliging

### Wat is veilig:

- ✅ Betalingen via Mollie (PCI-DSS compliant)
- ✅ API key opgeslagen in database (niet in code)
- ✅ Webhook verificatie
- ✅ HTTPS verplicht
- ✅ Geen creditcard gegevens in jouw systeem

### Best Practices:

- 🔐 Gebruik alleen Live API key in productie
- 🔐 Deel je API key nooit
- 🔐 Roteer API key regelmatig
- 🔐 Monitor betalingen in Mollie dashboard

## 📱 Gebruikerservaring

### Betaalknop Zichtbaarheid:

De "Betaal met iDEAL" knop is **alleen zichtbaar** wanneer:
- ✅ Factuur status is **niet** "Betaald"
- ✅ Er is een openstaand bedrag
- ✅ Mollie is geconfigureerd

### Betalingsstatus:

Na betaling ziet de klant:
- ✅ **Succes:** Groene checkmark + bevestiging
- ❌ **Mislukt:** Rode X + foutmelding + optie om opnieuw te proberen
- ⏳ **Verwerken:** Laad animatie tijdens controle

## 🐛 Troubleshooting

### Probleem: "Mollie API key not configured"

**Oplossing:**
1. Ga naar Instellingen → Mollie Betalingen
2. Vul je API key in
3. Sla op

### Probleem: Betaling succesvol maar factuur niet bijgewerkt

**Oplossing:**
1. Check of webhook URL correct is ingesteld in Mollie
2. Check Vercel logs voor webhook errors
3. Verifieer dat webhook URL bereikbaar is (niet localhost!)

### Probleem: "Payment failed" bij testbetaling

**Oplossing:**
- Dit is normaal als je "TBM Bank (failed)" selecteert
- Kies "TBM Bank" voor succesvolle testbetaling

### Probleem: Webhook werkt niet lokaal

**Oplossing:**
- Webhooks werken **niet** op localhost
- Deploy naar Vercel om webhooks te testen
- Of gebruik ngrok voor lokale webhook testing

## 📈 Monitoring

### In Mollie Dashboard:

1. **Payments** → Overzicht van alle betalingen
2. **Settlements** → Uitbetalingen naar je rekening
3. **Analytics** → Statistieken en grafieken

### In AMS Bouwers Dashboard:

1. **Facturen** → Status kolom toont "Betaald"
2. **Factuur detail** → Notities tonen Mollie Payment ID
3. **Betaald bedrag** → Automatisch bijgewerkt

## 🎨 UI/UX Features

### Betaalknop:

- 💳 Credit card icoon
- 🔵 Primaire kleur (opvallend)
- ⏳ Loading state tijdens verwerking
- ✅ Disabled wanneer al betaald

### Status Pagina:

- ✅ Groene checkmark bij succes
- ❌ Rode X bij fout
- ⏳ Spinner tijdens verwerking
- 🔙 Terug naar dashboard knop
- 🔄 Probeer opnieuw knop (bij fout)

## 🚀 Volgende Stappen

### Optionele Verbeteringen:

1. **Email notificaties** na betaling
2. **Betaallink** in factuur emails
3. **Meerdere betaalmethoden** (creditcard, Bancontact, etc.)
4. **Gedeeltelijke betalingen** ondersteunen
5. **Betaalherinneringen** voor openstaande facturen
6. **Refunds** via dashboard

### Andere Betaalmethoden:

Mollie ondersteunt ook:
- 💳 Creditcard (Visa, Mastercard, Amex)
- 🏦 Bancontact (België)
- 💰 PayPal
- 🎁 Klarna
- 📱 Apple Pay
- 🤖 Google Pay

Om deze toe te voegen, pas je `lib/mollie.ts` aan:
```typescript
// In plaats van:
method: PaymentMethod.ideal,

// Gebruik:
// method: PaymentMethod.creditcard,
// of laat method weg voor alle methoden
```

## 📞 Support

### Mollie Support:

- 📧 Email: info@mollie.com
- 📞 Telefoon: +31 20 820 20 70
- 💬 Chat: Via Mollie dashboard
- 📚 Docs: [docs.mollie.com](https://docs.mollie.com)

### Technische Documentatie:

- [Mollie API Reference](https://docs.mollie.com/reference/v2/payments-api)
- [Mollie Webhooks](https://docs.mollie.com/overview/webhooks)
- [iDEAL Guide](https://docs.mollie.com/payments/ideal)

## ✅ Checklist voor Go-Live

- [ ] Mollie account aangemaakt en geverifieerd
- [ ] Live API key verkregen
- [ ] API key geconfigureerd in dashboard
- [ ] Webhook URL ingesteld in Mollie
- [ ] Testbetaling succesvol afgerond
- [ ] Factuur status automatisch bijgewerkt
- [ ] Betalingsstatus pagina werkt correct
- [ ] Email notificaties werken (indien geconfigureerd)
- [ ] Mollie dashboard monitoring ingesteld

---

## 🎉 Klaar!

Je kunt nu **online betalingen accepteren** via iDEAL!

**Voordelen:**
- ✅ Snellere betalingen
- ✅ Minder administratie
- ✅ Betere cashflow
- ✅ Professionele uitstraling
- ✅ Automatische verwerking

**Veel succes met je online betalingen!** 💰

---

**Laatste update:** 6 januari 2026  
**Versie:** 1.0  
**Status:** ✅ Productie-klaar

