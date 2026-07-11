/**
 * Quotation engine — ported from the Integrix Driver CTC Calculator workbook
 * (Technical Spec, Section 4), verified line-for-line against the workbook's
 * "Client Quotation" tab for Zone I Skilled / ₹20,000 target take-home.
 *
 * ESIC applicability is a direct test on Basic+DA against `esicCeiling` (not
 * on gross), so ESIC employee/employer amounts are known before gross is
 * computed — gross is a straight sum, not an iterative solve.
 *
 * Rounding matches the workbook exactly: every statutory line item (HRA, PF,
 * ESIC, Bonus, Service Charge) is rounded to the nearest whole rupee
 * *before* being summed into the next total — not rounded once at the end.
 * MLWF is the one exception: it's a flat rate-card value (e.g. ₹12.50) and
 * is never rounded. PF-employer is three separately-rounded statutory
 * sub-components (EPF 12% + EDLI 0.5% + Admin 0.5%), matching the workbook's
 * "Provident Fund Contribution" line — rounding the combined 13% directly
 * gives a different (wrong) answer than the workbook's.
 */

export interface RateCard {
  id: string;
  zone: string;
  skillCategory: string;
  basic: number;
  da: number;
  hraPct: number;
  pfEmployeePct: number;
  pfEmployerEpfPct: number;
  pfEmployerEdliPct: number;
  pfEmployerAdminPct: number;
  esicEmployeePct: number;
  esicEmployerPct: number;
  esicCeiling: number;
  bonusPct: number;
  mlwfEmployer: number;
  professionalTax: number;
  serviceChargePct: number;
}

export interface QuotationLineInput {
  role: string;
  nos: number;
  targetTakeHome: number;
  serviceChargePctOverride?: number;
}

export interface QuotationInput {
  gstPct: number;
  lines: QuotationLineInput[];
}

export interface QuotationLineResult {
  role: string;
  nos: number;
  basic: number;
  da: number;
  hraPct: number;
  hra: number;
  otherAllowances: number;
  basicPlusDa: number;
  esicApplicable: boolean;
  grossSalary: number;
  pfEmployeePct: number;
  pfEmployeeAmount: number;
  esicEmployeePct: number;
  esicEmployeeAmount: number;
  professionalTax: number;
  netTakeHome: number;
  pfEmployerEpfAmount: number;
  pfEmployerEdliAmount: number;
  pfEmployerAdminAmount: number;
  pfEmployerAmount: number;
  pfEmployerPct: number;
  esicEmployerPct: number;
  esicEmployerAmount: number;
  bonusPct: number;
  bonusAmount: number;
  mlwfEmployerAmount: number;
  totalCtcPerEmployee: number;
  serviceChargePct: number;
  serviceChargeAmount: number;
  costPerNo: number;
  lineTotal: number;
}

export interface QuotationResult {
  gstPct: number;
  lines: QuotationLineResult[];
  totalManpowerCost: number;
  gstAmount: number;
  totalCostToCompany: number;
}

// Rounds a statutory line item to the nearest whole rupee, matching the
// workbook's convention of rounding each line before summing into a total.
function roundRupee(value: number): number {
  return Math.round(value);
}

// Cleans up floating-point noise on totals that are sums of already-rounded
// (mostly whole-rupee) parts; does not itself round to whole rupees.
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Steps 1-6 of Section 4: compute gross salary and per-employee cost for a
 * single role, given the target monthly take-home.
 */
export function calculateQuotationLine(
  input: QuotationLineInput,
  rateCard: RateCard
): QuotationLineResult {
  if (input.nos <= 0) {
    throw new Error("nos (headcount) must be greater than 0");
  }
  if (input.targetTakeHome <= 0) {
    throw new Error("targetTakeHome must be greater than 0");
  }

  // Step 1: Basic + DA from the active rate card.
  const basic = rateCard.basic;
  const da = rateCard.da;
  const basicPlusDa = basic + da;

  // Step 2: HRA and employee-side PF, each rounded to the nearest rupee.
  const hra = roundRupee(basicPlusDa * (rateCard.hraPct / 100));
  const pfEmployeeAmount = roundRupee(basicPlusDa * (rateCard.pfEmployeePct / 100));
  const professionalTax = rateCard.professionalTax;

  // Step 3: ESIC applicability is a direct test on Basic+DA against the
  // wage ceiling — it does not depend on gross, so there is no circularity.
  const esicApplicable = basicPlusDa <= rateCard.esicCeiling;
  const esicEmployeeAmount = esicApplicable
    ? roundRupee(basicPlusDa * (rateCard.esicEmployeePct / 100))
    : 0;

  // Step 4: Gross is a direct sum of already-rounded whole-rupee parts.
  const grossSalary =
    input.targetTakeHome + pfEmployeeAmount + esicEmployeeAmount + professionalTax;

  const netTakeHome = grossSalary - pfEmployeeAmount - esicEmployeeAmount - professionalTax;

  // Other Allowances is the balancing figure between Gross and the named
  // components (Basic + DA + HRA), shown as its own annexure line.
  const otherAllowances = grossSalary - basic - da - hra;

  // Step 5: employer-side costs. PF-employer is three separately-rounded
  // statutory sub-components (EPF, EDLI, Admin) summed for display as one
  // combined line — rounding the combined percentage directly would give a
  // different total than the workbook's.
  const pfEmployerEpfAmount = roundRupee(basicPlusDa * (rateCard.pfEmployerEpfPct / 100));
  const pfEmployerEdliAmount = roundRupee(basicPlusDa * (rateCard.pfEmployerEdliPct / 100));
  const pfEmployerAdminAmount = roundRupee(basicPlusDa * (rateCard.pfEmployerAdminPct / 100));
  const pfEmployerAmount = pfEmployerEpfAmount + pfEmployerEdliAmount + pfEmployerAdminAmount;
  const pfEmployerPct =
    rateCard.pfEmployerEpfPct + rateCard.pfEmployerEdliPct + rateCard.pfEmployerAdminPct;

  const esicEmployerAmount = esicApplicable
    ? roundRupee(basicPlusDa * (rateCard.esicEmployerPct / 100))
    : 0;
  const bonusAmount = roundRupee(basicPlusDa * (rateCard.bonusPct / 100));
  const mlwfEmployerAmount = rateCard.mlwfEmployer;

  // Step 6: Total CTC -> service charge -> Total Manpower Cost per employee.
  const totalCtcPerEmployee = round2(
    grossSalary +
      pfEmployerAmount +
      esicEmployerAmount +
      bonusAmount +
      mlwfEmployerAmount
  );
  const serviceChargePct =
    input.serviceChargePctOverride ?? rateCard.serviceChargePct;
  const serviceChargeAmount = roundRupee(
    totalCtcPerEmployee * (serviceChargePct / 100)
  );
  const costPerNo = round2(totalCtcPerEmployee + serviceChargeAmount);

  // Step 7: multiply by headcount.
  const lineTotal = round2(costPerNo * input.nos);

  return {
    role: input.role,
    nos: input.nos,
    basic,
    da,
    hraPct: rateCard.hraPct,
    hra,
    otherAllowances,
    basicPlusDa,
    esicApplicable,
    grossSalary,
    pfEmployeePct: rateCard.pfEmployeePct,
    pfEmployeeAmount,
    esicEmployeePct: rateCard.esicEmployeePct,
    esicEmployeeAmount,
    professionalTax,
    netTakeHome,
    pfEmployerEpfAmount,
    pfEmployerEdliAmount,
    pfEmployerAdminAmount,
    pfEmployerAmount,
    pfEmployerPct,
    esicEmployerPct: rateCard.esicEmployerPct,
    esicEmployerAmount,
    bonusPct: rateCard.bonusPct,
    bonusAmount,
    mlwfEmployerAmount,
    totalCtcPerEmployee,
    serviceChargePct,
    serviceChargeAmount,
    costPerNo,
    lineTotal,
  };
}

/**
 * Step 7 (headcount rollup across lines) and step 8's numeric inputs: apply
 * GST% across the summed line totals to get the Total Cost to Company.
 * A quotation with a single rate card will typically have a single line;
 * the schema supports multiple lines (multiple roles) for a future
 * multi-role quotation, but the current UI slice only generates one.
 */
export function calculateQuotation(
  input: QuotationInput,
  rateCard: RateCard
): QuotationResult {
  if (input.lines.length === 0) {
    throw new Error("A quotation requires at least one line");
  }

  const lines = input.lines.map((line) =>
    calculateQuotationLine(line, rateCard)
  );
  const totalManpowerCost = round2(
    lines.reduce((sum, line) => sum + line.lineTotal, 0)
  );
  const gstAmount = round2(totalManpowerCost * (input.gstPct / 100));
  const totalCostToCompany = round2(totalManpowerCost + gstAmount);

  return {
    gstPct: input.gstPct,
    lines,
    totalManpowerCost,
    gstAmount,
    totalCostToCompany,
  };
}
