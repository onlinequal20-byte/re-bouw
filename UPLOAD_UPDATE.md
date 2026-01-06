# Bonnetje Upload Update & Klant Koppeling

## Nieuwe Features
1. **Supabase Storage**: Overschakeling van lokale opslag naar Supabase Storage voor betrouwbare uploads op Vercel.
2. **Klant Koppeling**: Je kunt nu een klant selecteren bij het uploaden van een bonnetje.
3. **Klant Details**: Nieuwe pagina (`/klanten/[id]`) waar je alle details van een klant ziet, inclusief:
   - Totale omzet (facturen)
   - Totale kosten (bonnetjes)
   - Winst berekening per klant
   - Lijst van alle bonnetjes gekoppeld aan deze klant

## Vereisten
Zorg dat de volgende Environment Variables zijn ingesteld in Vercel (Project Settings -> Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`: Jouw Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Jouw Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Jouw Supabase Service Role Key (nodig voor uploads zonder login restricties op storage level, of gebruik Anon key met juiste policies)

## Gebruik
1. Ga naar "Kosten".
2. Selecteer een bestand of maak een foto.
3. Kies optioneel een klant uit de lijst.
4. Klik op Uploaden.
5. Ga naar "Klanten" en klik op het oogje bij een klant om hun overzicht en winst te zien.

