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
    const fromEmail = settingsMap['email'] || 'info@amsbouwers.nl';
    const fromName = settingsMap['bedrijfsnaam'] || 'AMS Bouwers B.V.';

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

Hierbij ontvangt u de offerte voor ${offerte.projectNaam}.

Offerte nummer: ${offerte.offerteNummer}
Totaalbedrag: € ${(offerte.totaal / 100).toFixed(2).replace('.', ',')}
Vooruitbetaling (30%): € ${(prepaymentCents / 100).toFixed(2).replace('.', ',')}
Geldig tot: ${new Date(offerte.geldigTot).toLocaleDateString('nl-NL')}

De offerte en algemene voorwaarden zijn als PDF bijgevoegd bij deze email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DIGITAAL ONDERTEKENEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt deze offerte eenvoudig digitaal ondertekenen via:
${signUrl}

Door te ondertekenen gaat u automatisch akkoord met onze algemene voorwaarden.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 VOORUITBETALING MET iDEAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Na ondertekening kunt u direct 30% vooruitbetalen met iDEAL:
${paymentUrl}

✓ Snel en veilig betalen met uw eigen bank
✓ Directe bevestiging na betaling
✓ Geen extra kosten
✓ Project kan direct starten na vooruitbetaling

OF betaal de vooruitbetaling via bankoverschrijving naar:
IBAN: NL91ABNA0417164300
t.n.v. AMS Bouwers B.V.
onder vermelding van: ${offerte.offerteNummer} - Vooruitbetaling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mocht u vragen hebben of meer informatie wensen, neem dan gerust contact met ons op.

Met vriendelijke groet,

AMS Bouwers B.V.
Sloterweg 1160
1066 CV Amsterdam
Tel: 0642959565
Email: info@amsbouwers.nl
Web: amsbouwers.nl

KVK: 80195466
BTW: NL123456789B01`;

  return { subject, body };
}

export function generateOfferteReminderEmail(offerte: any, baseUrl: string) {
  const subject = `Herinnering: Offerte ${offerte.offerteNummer} - ${offerte.projectNaam}`;
  const signUrl = `${baseUrl}/ondertekenen/offerte/${offerte.id}`;

  const body = `Beste ${offerte.klant.naam},

Wij willen u er graag aan herinneren dat u nog een openstaande offerte heeft voor ${offerte.projectNaam}.

Offerte nummer: ${offerte.offerteNummer}
Totaalbedrag: € ${(offerte.totaal / 100).toFixed(2).replace('.', ',')}
Geldig tot: ${new Date(offerte.geldigTot).toLocaleDateString('nl-NL')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DIGITAAL ONDERTEKENEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt deze offerte eenvoudig digitaal ondertekenen via:
${signUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mocht u vragen hebben of meer informatie wensen, neem dan gerust contact met ons op.

Met vriendelijke groet,

AMS Bouwers B.V.
Sloterweg 1160
1066 CV Amsterdam
Tel: 0642959565
Email: info@amsbouwers.nl
Web: amsbouwers.nl`;

  return { subject, body };
}

export function generateFactuurEmail(factuur: any, baseUrl: string) {
  const subject = `Factuur ${factuur.factuurNummer} - ${factuur.projectNaam}`;
  const signUrl = `${baseUrl}/ondertekenen/factuur/${factuur.id}`;
  const paymentUrl = `${baseUrl}/betalen/factuur/${factuur.id}`;
  const remainingAmount = factuur.totaal - (factuur.betaaldBedrag || 0);
  const isPaid = factuur.status === 'Betaald' || remainingAmount <= 0;
  
  const body = `Beste ${factuur.klant.naam},

Hierbij ontvangt u de factuur voor ${factuur.projectNaam}.

Factuur nummer: ${factuur.factuurNummer}
Totaalbedrag: € ${(factuur.totaal / 100).toFixed(2).replace('.', ',')}
${factuur.betaaldBedrag > 0 ? `Reeds betaald: € ${(factuur.betaaldBedrag / 100).toFixed(2).replace('.', ',')}` : ''}
${!isPaid ? `Openstaand bedrag: € ${(remainingAmount / 100).toFixed(2).replace('.', ',')}` : ''}
Vervaldatum: ${new Date(factuur.vervaldatum).toLocaleDateString('nl-NL')}
${isPaid ? '\n✅ STATUS: BETAALD' : ''}

De factuur en algemene voorwaarden zijn als PDF bijgevoegd bij deze email.

${!isPaid ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 DIRECT ONLINE BETALEN MET iDEAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt deze factuur eenvoudig en veilig online betalen met iDEAL:
${paymentUrl}

✓ Snel en veilig betalen met uw eigen bank
✓ Directe bevestiging na betaling
✓ Geen extra kosten

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OF betaal via bankoverschrijving naar:
IBAN: NL91ABNA0417164300
t.n.v. AMS Bouwers B.V.
onder vermelding van: ${factuur.factuurNummer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`}📝 DIGITAAL ONDERTEKENEN (OPTIONEEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt deze factuur desgewenst digitaal ondertekenen via:
${signUrl}

Door te ondertekenen bevestigt u akkoord te zijn met de factuur en onze algemene voorwaarden.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet,

AMS Bouwers B.V.
Sloterweg 1160
1066 CV Amsterdam
Tel: 0642959565
Email: info@amsbouwers.nl
Web: amsbouwers.nl

KVK: 80195466
BTW: NL123456789B01`;

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

Factuur nummer: ${factuur.factuurNummer}
Totaalbedrag: \u20AC ${bedrag}
Openstaand bedrag: \u20AC ${openstaand}
Vervaldatum: ${vervaldatum}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 DIRECT ONLINE BETALEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt eenvoudig en veilig online betalen via:
${paymentUrl}

OF betaal via bankoverschrijving naar:
IBAN: NL91ABNA0417164300
t.n.v. AMS Bouwers B.V.
onder vermelding van: ${factuur.factuurNummer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mocht de betaling reeds onderweg zijn, dan kunt u deze herinnering als niet verzonden beschouwen.

Met vriendelijke groet,

AMS Bouwers B.V.
Sloterweg 1160
1066 CV Amsterdam
Tel: 0642959565
Email: info@amsbouwers.nl`;

    return { subject, body };
  }

  if (tone === 'zakelijk') {
    const subject = `Tweede herinnering: Factuur ${factuur.factuurNummer} is vervallen`;
    const body = `Beste ${factuur.klant.naam},

Ondanks onze eerdere herinnering hebben wij nog geen betaling ontvangen voor onderstaande factuur. De vervaldatum is inmiddels verstreken.

Factuur nummer: ${factuur.factuurNummer}
Totaalbedrag: \u20AC ${bedrag}
Openstaand bedrag: \u20AC ${openstaand}
Vervaldatum: ${vervaldatum}

Wij verzoeken u vriendelijk doch dringend het openstaande bedrag binnen 7 dagen te voldoen.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 DIRECT ONLINE BETALEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt eenvoudig en veilig online betalen via:
${paymentUrl}

OF betaal via bankoverschrijving naar:
IBAN: NL91ABNA0417164300
t.n.v. AMS Bouwers B.V.
onder vermelding van: ${factuur.factuurNummer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mocht u vragen hebben over deze factuur, neem dan zo spoedig mogelijk contact met ons op.

Met vriendelijke groet,

AMS Bouwers B.V.
Sloterweg 1160
1066 CV Amsterdam
Tel: 0642959565
Email: info@amsbouwers.nl`;

    return { subject, body };
  }

  // tone === 'laatste'
  const subject = `LAATSTE AANMANING: Factuur ${factuur.factuurNummer} - Directe actie vereist`;
  const body = `Beste ${factuur.klant.naam},

Dit is onze laatste aanmaning betreffende de openstaande factuur hieronder. Ondanks eerdere herinneringen hebben wij tot op heden geen betaling ontvangen.

Factuur nummer: ${factuur.factuurNummer}
Totaalbedrag: \u20AC ${bedrag}
Openstaand bedrag: \u20AC ${openstaand}
Oorspronkelijke vervaldatum: ${vervaldatum}

⚠️ DRINGEND: Wij verzoeken u het openstaande bedrag binnen 5 werkdagen te voldoen.

Indien wij binnen deze termijn geen betaling ontvangen, zijn wij genoodzaakt de vordering uit handen te geven aan een incassobureau. De bijkomende kosten hiervan komen voor uw rekening.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 DIRECT ONLINE BETALEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt eenvoudig en veilig online betalen via:
${paymentUrl}

OF betaal via bankoverschrijving naar:
IBAN: NL91ABNA0417164300
t.n.v. AMS Bouwers B.V.
onder vermelding van: ${factuur.factuurNummer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Voor vragen kunt u contact opnemen via onderstaande gegevens.

Met vriendelijke groet,

AMS Bouwers B.V.
Sloterweg 1160
1066 CV Amsterdam
Tel: 0642959565
Email: info@amsbouwers.nl

KVK: 80195466
BTW: NL123456789B01`;

  return { subject, body };
}

// Generate professional HTML email template
function generateHTMLEmail(textBody: string, subject: string, companyName: string): string {
  // Use the deployed URL for the logo, fallback to a placeholder or main domain if env var not set
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://amsbouwers.nl';
  // Ensure we don't double slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const logoUrl = `${cleanBaseUrl}/images/amsbouwers.logo.png`;

  // Convert text body to HTML with proper formatting
  const htmlContent = textBody
    .split('\n\n')
    .map(paragraph => {
      // Check if it's a section header (starts with emoji or special chars)
      if (paragraph.match(/^[━─═]+/) || paragraph.match(/^[📝💳✅⚠️]/)) {
        return `<div style="margin: 24px 0;">${paragraph.replace(/\n/g, '<br>')}</div>`;
      }
      return `<p style="margin: 12px 0; line-height: 1.6;">${paragraph.replace(/\n/g, '<br>')}</p>`;
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
          
          <!-- Header with Logo and Brand Colors -->
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
                    <p style="margin: 5px 0;">📍 Sloterweg 1160, 1066 CV Amsterdam</p>
                    <p style="margin: 5px 0;">📞 <a href="tel:0642959565" style="color: #f59e0b; text-decoration: none;">0642959565</a></p>
                    <p style="margin: 5px 0;">📧 <a href="mailto:info@amsbouwers.nl" style="color: #f59e0b; text-decoration: none;">info@amsbouwers.nl</a></p>
                    <p style="margin: 5px 0;">🌐 <a href="https://amsbouwers.nl" style="color: #f59e0b; text-decoration: none;">amsbouwers.nl</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; margin-top: 20px;">
                    <p style="margin: 5px 0; color: #999999; font-size: 12px;">KVK: 80195466 | BTW: NL123456789B01</p>
                    <p style="margin: 10px 0 0 0; color: #999999; font-size: 11px;">
                      © ${new Date().getFullYear()} AMS Bouwers B.V. Alle rechten voorbehouden.
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
