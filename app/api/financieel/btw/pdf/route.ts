import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// Styles (matching invoice-pdf.tsx branding)
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 0,
    fontSize: 10,
  },
  headerBanner: {
    backgroundColor: "#1a1a1a",
    padding: 25,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerAccent: {
    color: "#f59e0b",
  },
  tagline: {
    fontSize: 10,
    color: "#ffffff",
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    padding: 40,
    paddingTop: 0,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  companyInfo: {
    fontSize: 9,
    lineHeight: 1.6,
    color: "#4b5563",
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "right",
    marginBottom: 5,
  },
  documentTitleAccent: {
    width: 60,
    height: 4,
    backgroundColor: "#f59e0b",
    marginLeft: "auto",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 18,
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  // Table
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    padding: 10,
    fontWeight: "bold",
    fontSize: 9,
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 10,
    fontSize: 9,
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableRowTotal: {
    backgroundColor: "#fef3c7",
    fontWeight: "bold",
  },
  colLabel: { width: "40%" },
  colQ1: { width: "12%", textAlign: "right" },
  colQ2: { width: "12%", textAlign: "right" },
  colQ3: { width: "12%", textAlign: "right" },
  colQ4: { width: "12%", textAlign: "right" },
  colYear: { width: "12%", textAlign: "right", fontWeight: "bold" },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    padding: 20,
    fontSize: 8,
    color: "#ffffff",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  footerText: {
    fontSize: 8,
    color: "#ffffff",
    opacity: 0.9,
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface QuarterData {
  btwHoog: number;   // output BTW 21% (cents)
  btwLaag: number;   // output BTW 9% (cents)
  btwVerlegd: number; // verlegd/vrijgesteld
  voorbelasting: number; // input BTW from expenses (cents)
}

interface BtwPDFData {
  jaar: number;
  quarters: [QuarterData, QuarterData, QuarterData, QuarterData];
  companyInfo: {
    naam: string;
    adres: string;
    kvk: string;
    btw: string;
  };
}

// ---------------------------------------------------------------------------
// PDF Component
// ---------------------------------------------------------------------------
const BtwPDF: React.FC<{ data: BtwPDFData }> = ({ data }) => {
  const fmt = (cents: number) =>
    `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;

  const qLabels = ["Q1", "Q2", "Q3", "Q4"];

  const totaalVerschuldigd = (q: QuarterData) =>
    q.btwHoog + q.btwLaag + q.btwVerlegd;

  const teBetalen = (q: QuarterData) =>
    totaalVerschuldigd(q) - q.voorbelasting;

  const sumField = (field: keyof QuarterData) =>
    data.quarters.reduce((sum, q) => sum + q[field], 0);

  const yearTotaalVerschuldigd =
    sumField("btwHoog") + sumField("btwLaag") + sumField("btwVerlegd");
  const yearVoorbelasting = sumField("voorbelasting");
  const yearTeBetalen = yearTotaalVerschuldigd - yearVoorbelasting;

  type Row = {
    label: string;
    values: number[];
    bold?: boolean;
    accent?: boolean;
  };

  const rows: Row[] = [
    {
      label: "Verschuldigde BTW (21%)",
      values: [...data.quarters.map((q) => q.btwHoog), sumField("btwHoog")],
    },
    {
      label: "Verschuldigde BTW (9%)",
      values: [...data.quarters.map((q) => q.btwLaag), sumField("btwLaag")],
    },
    {
      label: "Verlegd / Vrijgesteld",
      values: [
        ...data.quarters.map((q) => q.btwVerlegd),
        sumField("btwVerlegd"),
      ],
    },
    {
      label: "Totaal verschuldigde BTW",
      values: [
        ...data.quarters.map(totaalVerschuldigd),
        yearTotaalVerschuldigd,
      ],
      bold: true,
    },
    {
      label: "Voorbelasting (aftrekbaar)",
      values: [
        ...data.quarters.map((q) => q.voorbelasting),
        yearVoorbelasting,
      ],
    },
    {
      label: "Te betalen BTW",
      values: [...data.quarters.map(teBetalen), yearTeBetalen],
      bold: true,
      accent: true,
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerTitle}>
            AMS <Text style={styles.headerAccent}>BOUWERS</Text>
          </Text>
          <Text style={styles.tagline}>
            Uw betrouwbare partner voor bouw en renovatie
          </Text>
        </View>

        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.companyInfo}>{data.companyInfo.naam}</Text>
              <Text style={styles.companyInfo}>{data.companyInfo.adres}</Text>
              <Text style={styles.companyInfo}>
                KVK: {data.companyInfo.kvk}
              </Text>
              <Text style={styles.companyInfo}>
                BTW-nr: {data.companyInfo.btw}
              </Text>
            </View>
            <View>
              <Text style={styles.documentTitle}>
                BTW Overzicht {data.jaar}
              </Text>
              <View style={styles.documentTitleAccent} />
            </View>
          </View>

          {/* Main Table */}
          <Text style={styles.sectionTitle}>KWARTAALOVERZICHT</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colLabel}>Omschrijving</Text>
              {qLabels.map((l) => (
                <Text key={l} style={styles.colQ1}>
                  {l}
                </Text>
              ))}
              <Text style={styles.colYear}>Jaar</Text>
            </View>

            {/* Rows */}
            {rows.map((row, idx) => {
              const rowStyles: object[] = [styles.tableRow];
              if (idx % 2 === 1) rowStyles.push(styles.tableRowAlt);
              if (row.accent) rowStyles.push(styles.tableRowTotal);
              return (
                <View key={row.label} style={rowStyles}>
                  <Text
                    style={[
                      styles.colLabel,
                      row.bold ? { fontWeight: "bold" } : {},
                    ]}
                  >
                    {row.label}
                  </Text>
                  {row.values.slice(0, 4).map((v, qi) => (
                    <Text
                      key={qi}
                      style={[
                        styles.colQ1,
                        row.bold ? { fontWeight: "bold" } : {},
                      ]}
                    >
                      {fmt(v)}
                    </Text>
                  ))}
                  <Text
                    style={[styles.colYear, row.bold ? { fontWeight: "bold" } : {}]}
                  >
                    {fmt(row.values[4])}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Note */}
          <View
            style={{
              marginTop: 25,
              padding: 15,
              backgroundColor: "#fef3c7",
              borderRadius: 8,
              borderLeft: 3,
              borderLeftColor: "#f59e0b",
            }}
          >
            <Text
              style={{
                fontSize: 9,
                color: "#4b5563",
                lineHeight: 1.5,
              }}
            >
              Dit overzicht is gegenereerd op{" "}
              {new Date().toLocaleDateString("nl-NL")} en is bedoeld als
              hulpmiddel bij de BTW-aangifte. Controleer de bedragen altijd
              voordat u aangifte doet bij de Belastingdienst.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>KVK: {data.companyInfo.kvk}</Text>
            <Text style={styles.footerText}>
              BTW: {data.companyInfo.btw}
            </Text>
          </View>
          <Text
            style={[
              styles.footerText,
              { textAlign: "center", marginTop: 10, fontSize: 7 },
            ]}
          >
            © {new Date().getFullYear()} {data.companyInfo.naam} - Alle rechten
            voorbehouden
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3); // 0-3
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jaarParam = searchParams.get("jaar");
  const jaar = jaarParam ? parseInt(jaarParam, 10) : new Date().getFullYear();

  if (isNaN(jaar) || jaar < 2000 || jaar > 2100) {
    return Response.json({ error: "Ongeldig jaar" }, { status: 400 });
  }

  const startDate = new Date(jaar, 0, 1);
  const endDate = new Date(jaar + 1, 0, 1);

  // Fetch invoices (output BTW) - only paid/sent invoices
  const facturen = await prisma.factuur.findMany({
    where: {
      datum: { gte: startDate, lt: endDate },
      status: { in: ["Verzonden", "Betaald", "Deels Betaald"] },
    },
    include: { items: true },
  });

  // Fetch expenses (input BTW / voorbelasting)
  const expenses = await prisma.expense.findMany({
    where: {
      datum: { gte: startDate, lt: endDate },
      status: "approved",
    },
  });

  // Fetch company settings
  const settings = await prisma.settings.findMany();
  const getSetting = (key: string) =>
    settings.find((s) => s.key === key)?.value || "";
  const companyInfo = {
    naam: getSetting("company_name") || "AMS Bouwers",
    adres: getSetting("company_address") || "",
    kvk: getSetting("company_kvk") || "",
    btw: getSetting("company_btw") || "",
  };

  // Aggregate per quarter
  const quarters: [QuarterData, QuarterData, QuarterData, QuarterData] = [
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
    { btwHoog: 0, btwLaag: 0, btwVerlegd: 0, voorbelasting: 0 },
  ];

  // Output BTW from invoice items
  for (const factuur of facturen) {
    const q = getQuarter(new Date(factuur.datum));
    for (const item of factuur.items) {
      const tarief = item.btwTarief || "HOOG_21";
      const btwAmount = item.btwBedrag || 0;
      if (tarief === "HOOG_21") {
        quarters[q].btwHoog += btwAmount;
      } else if (tarief === "LAAG_9") {
        quarters[q].btwLaag += btwAmount;
      } else {
        // VERLEGD or VRIJGESTELD
        quarters[q].btwVerlegd += btwAmount;
      }
    }
  }

  // Input BTW from expenses (voorbelasting)
  for (const expense of expenses) {
    const q = getQuarter(new Date(expense.datum));
    quarters[q].voorbelasting += expense.btw || 0;
  }

  const pdfData: BtwPDFData = { jaar, quarters, companyInfo };

  const buffer = await renderToBuffer(
    React.createElement(BtwPDF, { data: pdfData })
  );

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="BTW-Overzicht-${jaar}.pdf"`,
    },
  });
}
