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

    // Send email
    const info = await transporter.sendMail({
      from: `"${fromName}" <${zohoEmail}>`,
      to: data.to,
      bcc: fromEmail, // BCC to company email
      subject: data.subject,
      text: data.body,
      html: data.body.replace(/\n/g, '<br>'),
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
  
  const body = `Beste ${offerte.klant.naam},

Hierbij ontvangt u de offerte voor ${offerte.projectNaam}.

Offerte nummer: ${offerte.offerteNummer}
Totaalbedrag: € ${offerte.totaal.toFixed(2).replace('.', ',')}
Geldig tot: ${new Date(offerte.geldigTot).toLocaleDateString('nl-NL')}

De offerte en algemene voorwaarden zijn als PDF bijgevoegd bij deze email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DIGITAAL ONDERTEKENEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

U kunt deze offerte eenvoudig digitaal ondertekenen via:
${signUrl}

Door te ondertekenen gaat u automatisch akkoord met onze algemene voorwaarden.

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

export function generateFactuurEmail(factuur: any, baseUrl: string) {
  const subject = `Factuur ${factuur.factuurNummer} - ${factuur.projectNaam}`;
  const signUrl = `${baseUrl}/ondertekenen/factuur/${factuur.id}`;
  const paymentUrl = `${baseUrl}/betalen/factuur/${factuur.id}`;
  const remainingAmount = factuur.totaal - (factuur.betaaldBedrag || 0);
  const isPaid = factuur.status === 'Betaald' || remainingAmount <= 0;
  
  const body = `Beste ${factuur.klant.naam},

Hierbij ontvangt u de factuur voor ${factuur.projectNaam}.

Factuur nummer: ${factuur.factuurNummer}
Totaalbedrag: € ${factuur.totaal.toFixed(2).replace('.', ',')}
${factuur.betaaldBedrag > 0 ? `Reeds betaald: € ${factuur.betaaldBedrag.toFixed(2).replace('.', ',')}` : ''}
${!isPaid ? `Openstaand bedrag: € ${remainingAmount.toFixed(2).replace('.', ',')}` : ''}
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

