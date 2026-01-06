# Supabase Storage Setup voor Bonnetjes

## Vereiste Stappen

### 1. Maak een Storage Bucket aan

1. Ga naar je Supabase dashboard: https://supabase.com/dashboard
2. Selecteer je project
3. Ga naar **Storage** in het linker menu
4. Klik op **"New bucket"**
5. Vul in:
   - **Name**: `receipts`
   - **Public bucket**: ✅ **AAN** (zodat de afbeeldingen zichtbaar zijn)
6. Klik op **"Create bucket"**

### 2. Stel de juiste policies in

Ga naar de **Policies** tab van de `receipts` bucket en voeg toe:

**Policy voor Upload (INSERT)**:
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');
```

**Policy voor Lezen (SELECT)**:
```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');
```

### 3. Controleer Environment Variables

Zorg dat deze variabelen zijn ingesteld in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` - Je Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Je Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Je Supabase service role key (voor server-side uploads)

### 4. Test de Upload

1. Ga naar `/kosten` in je dashboard
2. Upload een test bonnetje
3. Als het werkt, zie je het bonnetje in de tabel verschijnen
4. Klik op het oog-icoon om het bonnetje te bekijken

## Troubleshooting

### "Bucket not found" error
- Controleer of de bucket naam exact `receipts` is (zonder hoofdletters)
- Controleer of de bucket **Public** is ingesteld

### "Upload failed" error
- Controleer je Supabase environment variables in Vercel
- Controleer of de policies correct zijn ingesteld

### Afbeeldingen niet zichtbaar
- Zorg dat de bucket **Public** is
- Controleer de policies voor SELECT (public read access)

## Handmatige Test via Supabase Dashboard

Je kunt ook handmatig een bestand uploaden via het Supabase dashboard om te testen:
1. Ga naar Storage > receipts
2. Klik op "Upload file"
3. Upload een test afbeelding
4. Klik op de afbeelding en kopieer de "Public URL"
5. Open de URL in je browser - als je de afbeelding ziet, werkt het!

