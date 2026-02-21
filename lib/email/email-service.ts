import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail(data: EmailData) {
  try {
    // Get Zoho settings from database
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: ['zoho_email', 'zoho_password', 'email', 'bedrijfsnaam'],
        },
      },
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const zohoEmail = settingsMap['zoho_email'];
    const zohoPassword = settingsMap['zoho_password'];
    const fromEmail = settingsMap['email'] || 'info@re-bouw.nl';
    const fromName = settingsMap['bedrijfsnaam'] || 'Re-Bouw B.V.';

    if (!zohoEmail || !zohoPassword) {
      throw new Error('Zoho Mail credentials not configured');
    }

    // Create Zoho transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu', // or smtp.zoho.com for international
      port: 465,
      secure: true,
      auth: {
        user: zohoEmail,
        pass: zohoPassword,
      },
    });

    // Send email with professional HTML template
    const htmlBody = generateHTMLEmail(data.body, data.subject, fromName);

    const info = await transporter.sendMail({
      from: `"${fromName}" <${zohoEmail}>`,
      to: data.to,
      bcc: fromEmail, // BCC to company email
      subject: data.subject,
      text: data.body,
      html: htmlBody,
      attachments: data.attachments,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function generateOfferteEmail(offerte: any, baseUrl: string) {
  const subject = `Offerte ${offerte.offerteNummer} - ${offerte.projectNaam}`;
  const signUrl = `${baseUrl}/ondertekenen/offerte/${offerte.id}`;
  const paymentUrl = `${baseUrl}/betalen/offerte/${offerte.id}`;

  // Calculate prepayment amount (30% of total) — values are in cents
  const prepaymentCents = Math.round(offerte.totaal * 0.3);

  const body = `Beste ${offerte.klant.naam},

Naar aanleiding van ons bezoek en de opname ter plaatse hebben wij het genoegen u bijgaand onze offerte aan te bieden voor de werkzaamheden aan uw woning.

{{INFO_BLOCK}}
Offerte: ${offerte.offerteNummer}
Project: ${offerte.projectNaam}
Totaalbedrag: \u20AC ${(offerte.totaal / 100).toFixed(2).replace('.', ',')}
Vooruitbetaling (30%): \u20AC ${(prepaymentCents / 100).toFixed(2).replace('.', ',')}
Geldig tot: ${new Date(offerte.geldigTot).toLocaleDateString('nl-NL')}
{{/INFO_BLOCK}}

De offerte en algemene voorwaarden zijn als PDF bijgevoegd bij deze email.

{{SECTION}}Digitaal ondertekenen{{/SECTION}}

U kunt deze offerte eenvoudig digitaal ondertekenen. Door te ondertekenen gaat u automatisch akkoord met onze algemene voorwaarden.

{{CTA}}${signUrl}|Offerte ondertekenen{{/CTA}}

{{SECTION}}Vooruitbetaling met iDEAL{{/SECTION}}

Na ondertekening kunt u direct 30% vooruitbetalen met iDEAL. Snel, veilig en zonder extra kosten. Na betaling kan het project direct starten.

{{CTA}}${paymentUrl}|Direct betalen{{/CTA}}

U kunt ook betalen via bankoverschrijving:
IBAN: 
t.n.v. Re-Bouw B.V.
Onder vermelding van: ${offerte.offerteNummer} - Vooruitbetaling

Mocht u vragen hebben of meer informatie wensen, neem dan gerust contact met ons op.

Met vriendelijke groet,
Re-Bouw B.V.`;

  return { subject, body };
}

export function generateOfferteReminderEmail(offerte: any, baseUrl: string) {
  const subject = `Herinnering: Offerte ${offerte.offerteNummer} - ${offerte.projectNaam}`;
  const signUrl = `${baseUrl}/ondertekenen/offerte/${offerte.id}`;

  const body = `Beste ${offerte.klant.naam},

Graag herinneren wij u aan de offerte die wij u hebben toegestuurd voor ${offerte.projectNaam}. Wij horen graag of u nog vragen heeft of dat wij de werkzaamheden voor u mogen inplannen.

{{INFO_BLOCK}}
Offerte: ${offerte.offerteNummer}
Totaalbedrag: \u20AC ${(offerte.totaal / 100).toFixed(2).replace('.', ',')}
Geldig tot: ${new Date(offerte.geldigTot).toLocaleDateString('nl-NL')}
{{/INFO_BLOCK}}

{{CTA}}${signUrl}|Offerte bekijken & ondertekenen{{/CTA}}

Mocht u vragen hebben of meer informatie wensen, neem dan gerust contact met ons op.

Met vriendelijke groet,
Re-Bouw B.V.`;

  return { subject, body };
}

export function generateFactuurEmail(factuur: any, baseUrl: string) {
  const subject = `Factuur ${factuur.factuurNummer} - ${factuur.projectNaam}`;
  const signUrl = `${baseUrl}/ondertekenen/factuur/${factuur.id}`;
  const paymentUrl = `${baseUrl}/betalen/factuur/${factuur.id}`;
  const remainingAmount = factuur.totaal - (factuur.betaaldBedrag || 0);
  const isPaid = factuur.status === 'Betaald' || remainingAmount <= 0;

  const body = `Beste ${factuur.klant.naam},

Hierbij ontvangt u de factuur voor de uitgevoerde werkzaamheden aan ${factuur.projectNaam}. De factuur en algemene voorwaarden zijn als PDF bijgevoegd.

{{INFO_BLOCK}}
Factuur: ${factuur.factuurNummer}
Totaalbedrag: \u20AC ${(factuur.totaal / 100).toFixed(2).replace('.', ',')}${factuur.betaaldBedrag > 0 ? `
Reeds betaald: \u20AC ${(factuur.betaaldBedrag / 100).toFixed(2).replace('.', ',')}` : ''}${!isPaid ? `
Openstaand: \u20AC ${(remainingAmount / 100).toFixed(2).replace('.', ',')}` : ''}
Vervaldatum: ${new Date(factuur.vervaldatum).toLocaleDateString('nl-NL')}${isPaid ? `
Status: BETAALD` : ''}
{{/INFO_BLOCK}}

${!isPaid ? `{{SECTION}}Online betalen met iDEAL{{/SECTION}}

U kunt deze factuur eenvoudig en veilig online betalen. Directe bevestiging, geen extra kosten.

{{CTA}}${paymentUrl}|Factuur betalen{{/CTA}}

U kunt ook betalen via bankoverschrijving:
IBAN: 
t.n.v. Re-Bouw B.V.
Onder vermelding van: ${factuur.factuurNummer}

` : ''}{{SECTION}}Digitaal ondertekenen (optioneel){{/SECTION}}

U kunt deze factuur desgewenst digitaal ondertekenen ter bevestiging.

{{CTA}}${signUrl}|Factuur ondertekenen{{/CTA}}

Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet,
Re-Bouw B.V.`;

  return { subject, body };
}

export function generateFactuurReminderEmail(
  factuur: any,
  tone: 'vriendelijk' | 'zakelijk' | 'laatste',
  baseUrl: string
) {
  const paymentUrl = `${baseUrl}/betalen/factuur/${factuur.id}`;
  const bedrag = (factuur.totaal / 100).toFixed(2).replace('.', ',');
  const openstaand = ((factuur.totaal - (factuur.betaaldBedrag || 0)) / 100).toFixed(2).replace('.', ',');
  const vervaldatum = new Date(factuur.vervaldatum).toLocaleDateString('nl-NL');

  if (tone === 'vriendelijk') {
    const subject = `Herinnering: Factuur ${factuur.factuurNummer} - ${factuur.projectNaam}`;
    const body = `Beste ${factuur.klant.naam},

Wij willen u er vriendelijk aan herinneren dat de betaling van onderstaande factuur nog openstaat.

{{INFO_BLOCK}}
Factuur: ${factuur.factuurNummer}
Totaalbedrag: \u20AC ${bedrag}
Openstaand: \u20AC ${openstaand}
Vervaldatum: ${vervaldatum}
{{/INFO_BLOCK}}

{{CTA}}${paymentUrl}|Direct betalen{{/CTA}}

U kunt ook betalen via bankoverschrijving:
IBAN: 
t.n.v. Re-Bouw B.V.
Onder vermelding van: ${factuur.factuurNummer}

Mocht de betaling reeds onderweg zijn, dan kunt u deze herinnering als niet verzonden beschouwen.

Met vriendelijke groet,
Re-Bouw B.V.`;

    return { subject, body };
  }

  if (tone === 'zakelijk') {
    const subject = `Tweede herinnering: Factuur ${factuur.factuurNummer} is vervallen`;
    const body = `Beste ${factuur.klant.naam},

Ondanks onze eerdere herinnering hebben wij nog geen betaling ontvangen voor onderstaande factuur. De vervaldatum is inmiddels verstreken.

{{INFO_BLOCK}}
Factuur: ${factuur.factuurNummer}
Totaalbedrag: \u20AC ${bedrag}
Openstaand: \u20AC ${openstaand}
Vervaldatum: ${vervaldatum}
{{/INFO_BLOCK}}

Wij verzoeken u het openstaande bedrag binnen 7 dagen te voldoen.

{{CTA}}${paymentUrl}|Direct betalen{{/CTA}}

U kunt ook betalen via bankoverschrijving:
IBAN: 
t.n.v. Re-Bouw B.V.
Onder vermelding van: ${factuur.factuurNummer}

Mocht u vragen hebben over deze factuur, neem dan zo spoedig mogelijk contact met ons op.

Met vriendelijke groet,
Re-Bouw B.V.`;

    return { subject, body };
  }

  // tone === 'laatste'
  const subject = `LAATSTE AANMANING: Factuur ${factuur.factuurNummer} - Directe actie vereist`;
  const body = `Beste ${factuur.klant.naam},

Dit is onze laatste aanmaning betreffende de openstaande factuur hieronder. Ondanks eerdere herinneringen hebben wij tot op heden geen betaling ontvangen.

{{INFO_BLOCK}}
Factuur: ${factuur.factuurNummer}
Totaalbedrag: \u20AC ${bedrag}
Openstaand: \u20AC ${openstaand}
Oorspronkelijke vervaldatum: ${vervaldatum}
{{/INFO_BLOCK}}

Wij verzoeken u dringend het openstaande bedrag binnen 5 werkdagen te voldoen. Indien wij binnen deze termijn geen betaling ontvangen, zijn wij genoodzaakt de vordering uit handen te geven aan een incassobureau. De bijkomende kosten hiervan komen voor uw rekening.

{{CTA}}${paymentUrl}|Direct betalen{{/CTA}}

U kunt ook betalen via bankoverschrijving:
IBAN: 
t.n.v. Re-Bouw B.V.
Onder vermelding van: ${factuur.factuurNummer}

Voor vragen kunt u contact opnemen via onderstaande gegevens.

Met vriendelijke groet,
Re-Bouw B.V.`;

  return { subject, body };
}

export function generateOfferteSignedConfirmationEmail(offerte: any, baseUrl: string) {
  const signedDate = new Date(offerte.klantGetekendOp);
  const datum = signedDate.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const tijd = signedDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  const paymentUrl = `${baseUrl}/betalen/offerte/${offerte.id}`;
  const prepaymentCents = Math.round(offerte.totaal * 0.3);

  const subject = `Bevestiging ondertekening: Offerte ${offerte.offerteNummer} - ${offerte.projectNaam}`;
  const body = `Beste ${offerte.klantNaam},

Bedankt voor het ondertekenen van de offerte. Hierbij bevestigen wij dat uw handtekening succesvol is ontvangen.

{{INFO_BLOCK}}
Offerte: ${offerte.offerteNummer}
Project: ${offerte.projectNaam}
Totaalbedrag: \u20AC ${(offerte.totaal / 100).toFixed(2).replace('.', ',')}
Ondertekend door: ${offerte.klantNaam}
Datum: ${datum}
Tijdstip: ${tijd}
{{/INFO_BLOCK}}

{{SECTION}}Algemene voorwaarden{{/SECTION}}

Door het ondertekenen van deze offerte gaat u akkoord met onze algemene voorwaarden. De algemene voorwaarden zijn als bijlage meegestuurd bij de originele offerte.

{{SECTION}}Vooruitbetaling (30%){{/SECTION}}

Om het project in te plannen vragen wij een vooruitbetaling van 30% (\u20AC ${(prepaymentCents / 100).toFixed(2).replace('.', ',')}). U kunt eenvoudig en veilig betalen via iDEAL:

{{CTA}}${paymentUrl}|Vooruitbetaling voldoen{{/CTA}}

U kunt ook betalen via bankoverschrijving:
IBAN: 
t.n.v. Re-Bouw B.V.
Onder vermelding van: ${offerte.offerteNummer} - Vooruitbetaling

Wij nemen zo spoedig mogelijk contact met u op om de werkzaamheden in te plannen.

Met vriendelijke groet,
Re-Bouw B.V.`;

  return { subject, body };
}

// Generate professional HTML email template
function generateHTMLEmail(textBody: string, subject: string, companyName: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://re-bouw.nl';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const logoUrl = `${cleanBaseUrl}/images/rebouw-logo.png`;

  // Process special template tags into HTML
  let htmlContent = textBody;

  // Process {{INFO_BLOCK}}...{{/INFO_BLOCK}} into styled info blocks
  htmlContent = htmlContent.replace(/\{\{INFO_BLOCK\}\}\n([\s\S]*?)\{\{\/INFO_BLOCK\}\}/g, (_match, content) => {
    const lines = content.trim().split('\n').map((line: string) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        return `<tr><td style="padding: 6px 12px; color: #6b7280; font-size: 14px; white-space: nowrap;">${label}</td><td style="padding: 6px 12px; color: #1a1a1a; font-weight: 600; font-size: 14px;">${value}</td></tr>`;
      }
      return `<tr><td colspan="2" style="padding: 6px 12px; color: #1a1a1a; font-size: 14px;">${line.trim()}</td></tr>`;
    }).join('');
    return `<table style="background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; width: 100%;">${lines}</table>`;
  });

  // Process {{CTA}}url|label{{/CTA}} into styled buttons
  htmlContent = htmlContent.replace(/\{\{CTA\}\}(.+?)\|(.+?)\{\{\/CTA\}\}/g, (_match, url, label) => {
    return `<div style="text-align: center; margin: 24px 0;"><a href="${url}" style="display: inline-block; background-color: #f59e0b; color: #1a1a1a; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none; letter-spacing: 0.3px;">${label}</a></div>`;
  });

  // Process {{SECTION}}title{{/SECTION}} into styled section headers
  htmlContent = htmlContent.replace(/\{\{SECTION\}\}(.+?)\{\{\/SECTION\}\}/g, (_match, title) => {
    return `<div style="margin: 28px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #f59e0b;"><h3 style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 700;">${title}</h3></div>`;
  });

  // Convert remaining text to HTML paragraphs
  htmlContent = htmlContent
    .split('\n\n')
    .map(paragraph => {
      // Skip if already contains HTML tags (processed above)
      if (paragraph.includes('<table') || paragraph.includes('<div') || paragraph.includes('<a href')) {
        return paragraph;
      }
      return `<p style="margin: 12px 0; line-height: 1.7; color: #374151;">${paragraph.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 30px; text-align: center;">
              <div style="background-color: white; padding: 15px 25px; border-radius: 8px; margin-bottom: 15px; display: inline-block;">
                <img src="${logoUrl}" alt="${companyName}" style="max-width: 200px; max-height: 80px; display: block;" />
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                Uw betrouwbare partner voor bouw en renovatie
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #333333; font-size: 15px; line-height: 1.8;">
              ${htmlContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; border-top: 3px solid #f59e0b;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px;">
                      ${companyName}
                    </h3>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; color: #666666; font-size: 13px; line-height: 1.6;">
                    <p style="margin: 5px 0;"></p>
                    <p style="margin: 5px 0;"><a href="tel:0614601517" style="color: #f59e0b; text-decoration: none;">0614601517</a></p>
                    <p style="margin: 5px 0;"><a href="mailto:info@re-bouw.nl" style="color: #f59e0b; text-decoration: none;">info@re-bouw.nl</a></p>
                    <p style="margin: 5px 0;"><a href="https://re-bouw.nl" style="color: #f59e0b; text-decoration: none;">re-bouw.nl</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; margin-top: 20px;">
                    <p style="margin: 5px 0; color: #999999; font-size: 12px;">KVK: 60443162 | BTW: NL123456789B01</p>
                    <p style="margin: 10px 0 0 0; color: #999999; font-size: 11px;">
                      &copy; ${new Date().getFullYear()} Re-Bouw B.V. Alle rechten voorbehouden.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
