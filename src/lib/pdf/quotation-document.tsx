import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { QuotationResult } from "@/lib/quotation/engine";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  letterhead: {
    borderBottom: "2 solid #0f172a",
    paddingBottom: 10,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
  },
  tagline: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
  },
  meta: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 6,
    color: "#0f172a",
  },
  table: {
    borderTop: "1 solid #cbd5e1",
    borderLeft: "1 solid #cbd5e1",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #cbd5e1",
  },
  headerRow: {
    flexDirection: "row",
    borderBottom: "1 solid #cbd5e1",
    backgroundColor: "#f1f5f9",
  },
  cell: {
    padding: 5,
    borderRight: "1 solid #cbd5e1",
    flexGrow: 1,
    flexBasis: 0,
  },
  cellLabel: {
    padding: 5,
    borderRight: "1 solid #cbd5e1",
    flexGrow: 2,
    flexBasis: 0,
  },
  headerCell: {
    padding: 5,
    borderRight: "1 solid #cbd5e1",
    flexGrow: 1,
    flexBasis: 0,
    fontWeight: 700,
  },
  totalsRow: {
    flexDirection: "row",
    borderBottom: "1 solid #cbd5e1",
    backgroundColor: "#f8fafc",
  },
  terms: {
    marginTop: 16,
  },
  termItem: {
    fontSize: 8,
    marginBottom: 3,
    color: "#475569",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
  },
});

function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface QuotationPdfProps {
  clientName: string;
  clientAddress: string | null;
  requirementSummary: string | null;
  zone: string;
  skillCategory: string;
  generatedAt: string;
  result: QuotationResult;
}

export function QuotationDocument({
  clientName,
  clientAddress,
  requirementSummary,
  zone,
  skillCategory,
  generatedAt,
  result,
}: QuotationPdfProps) {
  return (
    <Document
      title={`Integrix Quotation - ${clientName}`}
      author="Integrix Facility Services LLP"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.letterhead}>
          <Text style={styles.companyName}>Integrix Facility Services LLP</Text>
          <Text style={styles.tagline}>
            Manpower & Facility Management Services
          </Text>
        </View>

        <Text style={styles.title}>Quotation</Text>
        <Text style={styles.meta}>
          Client: {clientName}
          {clientAddress ? ` | ${clientAddress}` : ""}
          {"\n"}
          Zone: {zone} | Skill category: {skillCategory}
          {"\n"}
          Generated: {new Date(generatedAt).toLocaleString("en-IN")}
          {requirementSummary ? `\nRequirement: ${requirementSummary}` : ""}
        </Text>

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.cellLabel}>Role</Text>
            <Text style={styles.headerCell}>Nos</Text>
            <Text style={styles.headerCell}>Cost / employee</Text>
            <Text style={styles.headerCell}>Line total</Text>
          </View>
          {result.lines.map((line) => (
            <View style={styles.row} key={line.role}>
              <Text style={styles.cellLabel}>{line.role}</Text>
              <Text style={styles.cell}>{line.nos}</Text>
              <Text style={styles.cell}>{formatCurrency(line.costPerNo)}</Text>
              <Text style={styles.cell}>{formatCurrency(line.lineTotal)}</Text>
            </View>
          ))}
          <View style={styles.totalsRow}>
            <Text style={styles.cellLabel}>Total manpower cost</Text>
            <Text style={styles.cell} />
            <Text style={styles.cell} />
            <Text style={styles.cell}>
              {formatCurrency(result.totalManpowerCost)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.cellLabel}>GST ({result.gstPct}%)</Text>
            <Text style={styles.cell} />
            <Text style={styles.cell} />
            <Text style={styles.cell}>{formatCurrency(result.gstAmount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.cellLabel}>Total cost to company</Text>
            <Text style={styles.cell} />
            <Text style={styles.cell} />
            <Text style={styles.cell}>
              {formatCurrency(result.totalCostToCompany)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Annexure: Cost Breakup per Employee</Text>
        {result.lines.map((line) => (
          <View key={line.role} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
              {line.role}
            </Text>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Basic</Text>
                <Text style={styles.cell}>{formatCurrency(line.basic)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>DA</Text>
                <Text style={styles.cell}>{formatCurrency(line.da)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>HRA</Text>
                <Text style={styles.cell}>{formatCurrency(line.hra)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Gross salary</Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.grossSalary)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>PF (employer)</Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.pfEmployerAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  ESIC (employer){line.esicApplicable ? "" : " - not applicable"}
                </Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.esicEmployerAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Bonus (8.33% of Basic+DA)</Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.bonusAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>MLWF (employer)</Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.mlwfEmployerAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Total CTC per employee</Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.totalCtcPerEmployee)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  Service charge ({line.serviceChargePct}%)
                </Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.serviceChargeAmount)}
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.cellLabel}>
                  Total manpower cost per employee
                </Text>
                <Text style={styles.cell}>
                  {formatCurrency(line.costPerNo)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Take-Home Calculation</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.cellLabel}>Role</Text>
            <Text style={styles.headerCell}>Gross</Text>
            <Text style={styles.headerCell}>PF (employee)</Text>
            <Text style={styles.headerCell}>ESIC (employee)</Text>
            <Text style={styles.headerCell}>P. Tax</Text>
            <Text style={styles.headerCell}>Net take-home</Text>
          </View>
          {result.lines.map((line) => (
            <View style={styles.row} key={line.role}>
              <Text style={styles.cellLabel}>{line.role}</Text>
              <Text style={styles.cell}>{formatCurrency(line.grossSalary)}</Text>
              <Text style={styles.cell}>
                {formatCurrency(line.pfEmployeeAmount)}
              </Text>
              <Text style={styles.cell}>
                {formatCurrency(line.esicEmployeeAmount)}
              </Text>
              <Text style={styles.cell}>
                {formatCurrency(line.professionalTax)}
              </Text>
              <Text style={styles.cell}>
                {formatCurrency(line.netTakeHome)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.terms}>
          <Text style={styles.sectionTitle}>Terms</Text>
          <Text style={styles.termItem}>
            1. This quotation is based on the Maharashtra minimum wage
            notification figures loaded in the system at the time of
            generation and is subject to revision on any statutory wage
            change.
          </Text>
          <Text style={styles.termItem}>
            2. GST is charged extra as applicable at {result.gstPct}%.
          </Text>
          <Text style={styles.termItem}>
            3. Billing is on a calendar month basis, payable within 30 days of
            invoice.
          </Text>
          <Text style={styles.termItem}>
            4. This quotation is valid for 30 days from the date of
            generation.
          </Text>
        </View>

        <Text style={styles.footer}>
          Integrix Facility Services LLP — Generated automatically by Integrix
          CRM. Not a tax invoice.
        </Text>
      </Page>
    </Document>
  );
}
