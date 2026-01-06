import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Create modern styles with AMS Bouwers branding
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    fontSize: 10,
  },
  headerBanner: {
    backgroundColor: '#1a1a1a',
    padding: 25,
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 200,
    height: 'auto',
  },
  tagline: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.8,
  },
  contentContainer: {
    padding: 40,
    paddingTop: 0,
  },
  header: {
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyInfo: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#4b5563',
  },
  documentTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'right',
    marginBottom: 5,
  },
  documentTitleAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#f59e0b',
    marginLeft: 'auto',
    marginBottom: 10,
  },
  documentNumber: {
    fontSize: 14,
    color: '#f59e0b',
    textAlign: 'right',
    fontWeight: 'bold',
    marginTop: 5,
  },
  clientSection: {
    marginTop: 25,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  clientBox: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    borderLeft: 3,
    borderLeftColor: '#f59e0b',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 9,
    marginBottom: 4,
    color: '#4b5563',
    lineHeight: 1.5,
  },
  table: {
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 9,
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
    fontSize: 9,
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  col1: { width: '5%' },
  col2: { width: '40%' },
  col3: { width: '10%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'center' },
  col5: { width: '15%', textAlign: 'right' },
  col6: { width: '15%', textAlign: 'right' },
  totalsSection: {
    marginTop: 25,
    marginLeft: 'auto',
    width: '45%',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 10,
    color: '#4b5563',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#f59e0b',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  notesSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeft: 3,
    borderLeftColor: '#f59e0b',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    padding: 20,
    fontSize: 8,
    color: '#ffffff',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  footerText: {
    fontSize: 8,
    color: '#ffffff',
    opacity: 0.9,
  },
});

interface InvoiceItem {
  omschrijving: string;
  aantal: number;
  eenheid: string;
  prijsPerEenheid: number;
  totaal: number;
}

interface InvoiceData {
  type: 'offerte' | 'factuur';
  nummer: string;
  datum: Date;
  geldigTot?: Date;
  vervaldatum?: Date;
  klant: {
    naam: string;
    email?: string;
    telefoon?: string;
    adres?: string;
    postcode?: string;
    plaats?: string;
  };
  projectNaam: string;
  projectLocatie?: string;
  items: InvoiceItem[];
  subtotaal: number;
  btwPercentage: number;
  btwBedrag: number;
  totaal: number;
  notities?: string;
  companyInfo: {
    naam: string;
    adres: string;
    telefoon: string;
    email: string;
    website: string;
    kvk: string;
    btw: string;
    iban: string;
  };
  betalingsvoorwaarden?: string;
  logoBase64?: string;
}

export const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return `€ ${amount.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.logoContainer}>
            {data.logoBase64 ? (
              <Image src={data.logoBase64} style={styles.logoImage} />
            ) : (
              // Fallback if no logo provided (should not happen with new logic)
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff' }}>
                AMS <Text style={{ color: '#f59e0b' }}>BOUWERS</Text>
              </Text>
            )}
          </View>
          <Text style={styles.tagline}>Uw betrouwbare partner voor bouw en renovatie</Text>
        </View>

        <View style={styles.contentContainer}>
          {/* Document Info Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyInfo}>{data.companyInfo.adres}</Text>
            <Text style={styles.companyInfo}>Tel: {data.companyInfo.telefoon}</Text>
            <Text style={styles.companyInfo}>Email: {data.companyInfo.email}</Text>
            <Text style={styles.companyInfo}>Web: {data.companyInfo.website}</Text>
          </View>
          <View>
            <Text style={styles.documentTitle}>
              {data.type === 'offerte' ? 'OFFERTE' : 'FACTUUR'}
            </Text>
              <View style={styles.documentTitleAccent} />
            <Text style={styles.documentNumber}>{data.nummer}</Text>
            <Text style={{ ...styles.text, textAlign: 'right', marginTop: 10, color: '#1a1a1a' }}>
              Datum: {formatDate(data.datum)}
            </Text>
            {data.geldigTot && (
                <Text style={{ ...styles.text, textAlign: 'right', color: '#1a1a1a' }}>
                Geldig tot: {formatDate(data.geldigTot)}
              </Text>
            )}
            {data.vervaldatum && (
                <Text style={{ ...styles.text, textAlign: 'right', color: '#1a1a1a' }}>
                Vervaldatum: {formatDate(data.vervaldatum)}
              </Text>
            )}
          </View>
        </View>

        {/* Client and Project Info */}
        <View style={styles.clientSection}>
          <View style={styles.clientBox}>
            <Text style={styles.sectionTitle}>KLANTGEGEVENS</Text>
            <Text style={styles.text}>{data.klant.naam}</Text>
            {data.klant.adres && <Text style={styles.text}>{data.klant.adres}</Text>}
            {data.klant.postcode && data.klant.plaats && (
              <Text style={styles.text}>{data.klant.postcode} {data.klant.plaats}</Text>
            )}
            {data.klant.telefoon && <Text style={styles.text}>Tel: {data.klant.telefoon}</Text>}
            {data.klant.email && <Text style={styles.text}>Email: {data.klant.email}</Text>}
          </View>
          <View style={styles.clientBox}>
            <Text style={styles.sectionTitle}>PROJECTGEGEVENS</Text>
            <Text style={styles.text}>{data.projectNaam}</Text>
            {data.projectLocatie && <Text style={styles.text}>{data.projectLocatie}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Omschrijving</Text>
            <Text style={styles.col3}>Aantal</Text>
            <Text style={styles.col4}>Eenheid</Text>
            <Text style={styles.col5}>Prijs/Eenheid</Text>
            <Text style={styles.col6}>Totaal</Text>
          </View>
          {data.items.map((item, index) => (
              <View key={index} style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{item.omschrijving}</Text>
              <Text style={styles.col3}>{item.aantal}</Text>
              <Text style={styles.col4}>{item.eenheid}</Text>
              <Text style={styles.col5}>{formatCurrency(item.prijsPerEenheid)}</Text>
              <Text style={styles.col6}>{formatCurrency(item.totaal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotaal:</Text>
            <Text>{formatCurrency(data.subtotaal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>BTW ({data.btwPercentage}%):</Text>
            <Text>{formatCurrency(data.btwBedrag)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAAL:</Text>
            <Text>{formatCurrency(data.totaal)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notities && (
            <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>OPMERKINGEN</Text>
            <Text style={styles.text}>{data.notities}</Text>
          </View>
        )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {data.betalingsvoorwaarden && (
            <Text style={[styles.footerText, { marginBottom: 10 }]}>{data.betalingsvoorwaarden}</Text>
          )}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>IBAN: {data.companyInfo.iban}</Text>
            <Text style={styles.footerText}>KVK: {data.companyInfo.kvk}</Text>
            <Text style={styles.footerText}>BTW: {data.companyInfo.btw}</Text>
          </View>
          <Text style={[styles.footerText, { textAlign: 'center', marginTop: 10, fontSize: 7 }]}>
            © {new Date().getFullYear()} {data.companyInfo.naam} - Alle rechten voorbehouden
          </Text>
        </View>
      </Page>
    </Document>
  );
};
