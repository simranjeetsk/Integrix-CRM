import { readFileSync } from "node:fs";
import path from "node:path";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { QuotationResult } from "@/lib/quotation/engine";

const logoBuffer = readFileSync(
  path.join(process.cwd(), "public", "integrix-logo.png")
);

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  letterhead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottom: "2 solid #0f172a",
    paddingBottom: 10,
    marginBottom: 16,
  },
  logo: {
    width: 160,
    height: 44,
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
  cellNarrow: {
    padding: 5,
    borderRight: "1 solid #cbd5e1",
    flexGrow: 0.5,
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

function formatAmount(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const GENERAL_TERMS = [
  "These rates are as per the current minimum wages, PF/ESIC and taxation structure. Any change in the statutory structures by the government will imply changes in the cost structure. Confirmation will be sought as and when required.",
  "Goods and Service Tax (GST) is applicable on the total cost of services, as shown above.",
  "These charges are for manpower services for 8 working hours a day and 6 days a week.",
  "Extra working hours shall be billed as overtime as per statutes.",
  "Machine, Tools, Equipment, Consumables, etc. as required for the service rendering shall be provided by the service recipient.",
  "National Holidays (26th January, 1st May, 15th August & 2nd October) will be billed extra as per statutes.",
  "The Invoice shall be paid on or before the 7th day of receipt of invoice.",
];

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
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image has no alt prop; this isn't an HTML <img> */}
          <Image src={logoBuffer} style={styles.logo} />
          <View>
            <Text style={styles.tagline}>
              Office No. C-610, 6th Floor, Kushal Wallstreet, Bhamburda,
              Shivaji Nagar, Pune - 411004
            </Text>
            <Text style={styles.tagline}>
              Contact: 97676 73605 | Email: info@integrixfs.com
            </Text>
          </View>
        </View>

        <Text style={styles.title}>QUOTATION — TOTAL COST TO COMPANY</Text>
        <Text style={styles.meta}>
          Date: {new Date(generatedAt).toLocaleDateString("en-IN")}
          {"\n"}
          To,{"\n"}
          {clientName}
          {clientAddress ? `\n${clientAddress}` : ""}
        </Text>

        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.cellNarrow}>Sr.No</Text>
            <Text style={styles.cellLabel}>Particulars</Text>
            <Text style={styles.cellNarrow}>Nos.</Text>
            <Text style={styles.headerCell}>Cost per No. (Rs.)</Text>
            <Text style={styles.headerCell}>Total (Rs.)</Text>
            <Text style={styles.cellLabel}>Remarks</Text>
          </View>
          {result.lines.map((line, index) => (
            <View style={styles.row} key={line.role}>
              <Text style={styles.cellNarrow}>{index + 1}</Text>
              <Text style={styles.cellLabel}>{line.role}</Text>
              <Text style={styles.cellNarrow}>{line.nos}</Text>
              <Text style={styles.cell}>{formatAmount(line.costPerNo)}</Text>
              <Text style={styles.cell}>{formatAmount(line.lineTotal)}</Text>
              <Text style={styles.cellLabel}>Refer breakup below</Text>
            </View>
          ))}
          <View style={styles.totalsRow}>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cellLabel}>A   TOTAL MANPOWER COST</Text>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cell} />
            <Text style={styles.cell}>
              {formatAmount(result.totalManpowerCost)}
            </Text>
            <Text style={styles.cellLabel} />
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cellLabel}>B   SERVICE CHARGES</Text>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cell} />
            <Text style={styles.cell}>Included in CTC</Text>
            <Text style={styles.cellLabel} />
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cellLabel}>C   G.S.T. ({result.gstPct}%)</Text>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cell} />
            <Text style={styles.cell}>{formatAmount(result.gstAmount)}</Text>
            <Text style={styles.cellLabel} />
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cellLabel}>
              TOTAL COST TO THE COMPANY (A+B+C)
            </Text>
            <Text style={styles.cellNarrow} />
            <Text style={styles.cell} />
            <Text style={styles.cell}>
              {formatAmount(result.totalCostToCompany)}
            </Text>
            <Text style={styles.cellLabel} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          ANNEXURE — 1 : DETAILED QUOTATION BREAKUP
        </Text>
        {result.lines.map((line) => (
          <View key={line.role} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
              {line.role}
            </Text>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Basic</Text>
                <Text style={styles.cell}>{formatAmount(line.basic)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>D.A</Text>
                <Text style={styles.cell}>{formatAmount(line.da)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Wages (Basic + D.A)</Text>
                <Text style={styles.cell}>
                  {formatAmount(line.basicPlusDa)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  H.R.A ({line.hraPct}%) on Basic+D.A
                </Text>
                <Text style={styles.cell}>{formatAmount(line.hra)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Other Allowances</Text>
                <Text style={styles.cell}>
                  {formatAmount(line.otherAllowances)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Gross Salary</Text>
                <Text style={styles.cell}>
                  {formatAmount(line.grossSalary)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  Provident Fund Contribution @ {line.pfEmployerPct}% of
                  (Basic+DA)
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.pfEmployerAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  ESIC Contribution @ {line.esicEmployerPct}% of (Basic+DA)
                  {line.esicApplicable ? "" : " - not applicable"}
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.esicEmployerAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  Bonus @ {line.bonusPct}% of (Wages)
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.bonusAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  MLWF (Employer share, monthly equiv.)
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.mlwfEmployerAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Cost to Company</Text>
                <Text style={styles.cell}>
                  {formatAmount(line.totalCtcPerEmployee)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>
                  Service Charges @ {line.serviceChargePct}%
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.serviceChargeAmount)}
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.cellLabel}>Total Manpower Cost</Text>
                <Text style={styles.cell}>{formatAmount(line.costPerNo)}</Text>
              </View>
            </View>
          </View>
        ))}

        <View break>
          <Text style={styles.sectionTitle}>TAKE HOME CALCULATION</Text>
        </View>
        {result.lines.map((line) => (
          <View key={line.role} style={{ marginBottom: 10 }} wrap={false}>
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.cellLabel}>Head</Text>
                <Text style={styles.cellLabel}>Particulars</Text>
                <Text style={styles.headerCell}>Amount in Rs.</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Earnings</Text>
                <Text style={styles.cellLabel}>Gross Salary (Wages)</Text>
                <Text style={styles.cell}>
                  {formatAmount(line.basicPlusDa)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel} />
                <Text style={styles.cellLabel}>
                  Allowances (HRA + Other)
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.hra + line.otherAllowances)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel} />
                <Text style={styles.cellLabel}>Total Gross Salary</Text>
                <Text style={styles.cell}>
                  {formatAmount(line.grossSalary)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel}>Deductions</Text>
                <Text style={styles.cellLabel}>
                  Provident Fund @ {line.pfEmployeePct}% of (Basic+DA)
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.pfEmployeeAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel} />
                <Text style={styles.cellLabel}>
                  ESIC @ {line.esicEmployeePct}% of Basic+DA
                </Text>
                <Text style={styles.cell}>
                  {formatAmount(line.esicEmployeeAmount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cellLabel} />
                <Text style={styles.cellLabel}>Professional Tax</Text>
                <Text style={styles.cell}>
                  {formatAmount(line.professionalTax)}
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.cellLabel}>Take Home Salary</Text>
                <Text style={styles.cellLabel} />
                <Text style={styles.cell}>
                  {formatAmount(line.netTakeHome)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.terms}>
          <Text style={styles.sectionTitle}>General Terms and Conditions</Text>
          {GENERAL_TERMS.map((term, index) => (
            <Text key={term} style={styles.termItem}>
              {index + 1}. {term}
            </Text>
          ))}
        </View>

        <Text style={styles.footer}>
          Integrix Facility Services LLP — Generated automatically by Integrix
          CRM. Not a tax invoice.
        </Text>
      </Page>
    </Document>
  );
}
