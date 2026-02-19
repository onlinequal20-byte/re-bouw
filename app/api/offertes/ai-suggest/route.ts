import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { handleApiError } from '@/lib/api-error';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface PrijslijstItem {
  id: string;
  categorie: string;
  omschrijving: string;
  prijsPerEenheid: number;
  eenheid: string;
  materiaalKosten: number;
  actief: boolean;
}

interface SuggestedItem {
  prijslijstId: string;
  omschrijving: string;
  aantal: number;
  eenheid: string;
  prijsPerEenheid: number;
  notitie?: string;
}

const SYSTEM_PROMPT = `Je bent een assistent voor een Nederlandse aannemer. Je helpt bij het samenstellen van offertes.

Je ontvangt een prijslijst met beschikbare items en een bericht van de gebruiker (in het Nederlands) waarin wordt beschreven welk werk er gedaan moet worden.

Jouw taak:
1. Analyseer het bericht van de gebruiker
2. Selecteer de relevante items uit de prijslijst
3. Schat een passend aantal in op basis van de beschrijving
4. Retourneer ALLEEN een JSON-array (geen extra tekst, geen markdown codeblocks)

Elk item in de array moet dit formaat hebben:
{
  "prijslijstId": "het id van het prijslijst-item",
  "omschrijving": "de omschrijving van het item",
  "aantal": 1,
  "eenheid": "de eenheid (bijv. m², uur, stuk)",
  "prijsPerEenheid": 1500,
  "notitie": "optionele toelichting waarom dit item is geselecteerd"
}

Belangrijke regels:
- prijsPerEenheid is in centen (zoals opgeslagen in de database), neem deze EXACT over uit de prijslijst
- Selecteer alleen items die relevant zijn voor het beschreven werk
- Schat realistische aantallen in
- Als niets past, retourneer een lege array []
- Retourneer ALLEEN valid JSON, geen andere tekst`;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[ai-suggest] GROQ_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI-service niet geconfigureerd' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, prijslijst } = body as {
      message: string;
      prijslijst: PrijslijstItem[];
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bericht is verplicht' },
        { status: 400 }
      );
    }

    if (!Array.isArray(prijslijst) || prijslijst.length === 0) {
      return NextResponse.json(
        { error: 'Prijslijst is verplicht' },
        { status: 400 }
      );
    }

    // Build a compact representation of the prijslijst for the prompt
    const prijslijstText = prijslijst
      .filter((item) => item.actief)
      .map(
        (item) =>
          `ID: ${item.id} | Categorie: ${item.categorie} | Omschrijving: ${item.omschrijving} | Prijs: ${item.prijsPerEenheid} cent per ${item.eenheid} | Materiaalkosten: ${item.materiaalKosten} cent`
      )
      .join('\n');

    const userMessage = `Prijslijst:\n${prijslijstText}\n\nBericht van de gebruiker:\n${message}`;

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[ai-suggest] Groq API error:', groqResponse.status, errorText);
      return NextResponse.json(
        { error: 'AI-service tijdelijk niet beschikbaar' },
        { status: 502 }
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Geen antwoord van AI-service' },
        { status: 502 }
      );
    }

    // Parse the AI response
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('[ai-suggest] Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Ongeldig antwoord van AI-service' },
        { status: 502 }
      );
    }

    // The response might be an array directly or an object with an items/regels key
    let items: SuggestedItem[];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      const arrayValue = obj.items ?? obj.regels ?? obj.suggestions ?? obj.data;
      items = Array.isArray(arrayValue) ? arrayValue : [];
    } else {
      items = [];
    }

    // Validate each item has the required fields
    const validItems = items.filter(
      (item): item is SuggestedItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.prijslijstId === 'string' &&
        typeof item.omschrijving === 'string' &&
        typeof item.aantal === 'number' &&
        typeof item.eenheid === 'string' &&
        typeof item.prijsPerEenheid === 'number' &&
        item.aantal > 0
    );

    return NextResponse.json({ items: validItems });
  } catch (error) {
    return handleApiError(error, 'ai-suggest');
  }
}
