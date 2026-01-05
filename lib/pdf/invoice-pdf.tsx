import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyInfo: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'right',
  },
  documentNumber: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 5,
  },
  clientSection: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientBox: {
    width: '45%',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e40af',
  },
  text: {
    fontSize: 9,
    marginBottom: 3,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '5%' },
  col2: { width: '40%' },
  col3: { width: '10%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'center' },
  col5: { width: '15%', textAlign: 'right' },
  col6: { width: '15%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 9,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#1e40af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#64748b',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e40af', marginBottom: 5 }}>
              {data.companyInfo.naam}
            </Text>
            <Text style={styles.companyInfo}>{data.companyInfo.adres}</Text>
            <Text style={styles.companyInfo}>Tel: {data.companyInfo.telefoon}</Text>
            <Text style={styles.companyInfo}>Email: {data.companyInfo.email}</Text>
            <Text style={styles.companyInfo}>Web: {data.companyInfo.website}</Text>
          </View>
          <View>
            <Text style={styles.documentTitle}>
              {data.type === 'offerte' ? 'OFFERTE' : 'FACTUUR'}
            </Text>
            <Text style={styles.documentNumber}>{data.nummer}</Text>
            <Text style={{ ...styles.text, textAlign: 'right', marginTop: 10 }}>
              Datum: {formatDate(data.datum)}
            </Text>
            {data.geldigTot && (
              <Text style={{ ...styles.text, textAlign: 'right' }}>
                Geldig tot: {formatDate(data.geldigTot)}
              </Text>
            )}
            {data.vervaldatum && (
              <Text style={{ ...styles.text, textAlign: 'right' }}>
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
            <View key={index} style={styles.tableRow}>
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
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>OPMERKINGEN</Text>
            <Text style={styles.text}>{data.notities}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {data.betalingsvoorwaarden && (
            <Text style={{ marginBottom: 8 }}>{data.betalingsvoorwaarden}</Text>
          )}
          <View style={styles.footerRow}>
            <Text>IBAN: {data.companyInfo.iban}</Text>
            <Text>KVK: {data.companyInfo.kvk}</Text>
            <Text>BTW: {data.companyInfo.btw}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

