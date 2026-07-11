/**
 * Quotation engine — ported from the Integrix Driver CTC Calculator workbook
 * (Technical Spec, Section 4). Given a rate card and a target monthly
 * take-home per employee, computes gross salary and the full employer-side
 * cost stack, then rolls it up to a headcount-priced quotation line.
 *
 * ESIC applicability is a direct test on Basic+DA against `esicCeiling`
 * (not on gross), so ESIC employee/employer amounts are known before gross
 * is computed — gross is a straight sum, not an iterative solve.
 */

export interface RateCard {
  id: string;
  zone: string;
  skillCategory: string;
  basic: number;
  da: number;
  hraPct: number;
  pfEmployeePct: number;
  pfEmployerPct: number;
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
  hra: number;
  basicPlusDa: number;
  esicApplicable: boolean;
  grossSalary: number;
  pfEmployeeAmount: number;
  esicEmployeeAmount: number;
  professionalTax: number;
  netTakeHome: number;
  pfEmployerAmount: number;
  esicEmployerAmount: number;
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

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Steps 1-6 of Section 4: solve gross salary and per-employee cost for a
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

  // Step 2: HRA and employee-side PF. PF is computed on Basic+DA, not gross.
  const hra = round2(basicPlusDa * (rateCard.hraPct / 100));
  const pfEmployeeAmount = round2(basicPlusDa * (rateCard.pfEmployeePct / 100));
  const professionalTax = rateCard.professionalTax;

  // Step 3: ESIC applicability is a direct test on Basic+DA against the
  // wage ceiling — it does not depend on gross, so there is no circularity.
  const esicApplicable = basicPlusDa <= rateCard.esicCeiling;
  const esicEmployeeAmount = esicApplicable
    ? round2(basicPlusDa * (rateCard.esicEmployeePct / 100))
    : 0;

  // Step 4: Gross is now a direct sum, since every deduction is already known.
  const grossSalary = round2(
    input.targetTakeHome + pfEmployeeAmount + esicEmployeeAmount + professionalTax
  );

  const netTakeHome = round2(
    grossSalary - pfEmployeeAmount - esicEmployeeAmount - professionalTax
  );

  // Step 5: employer-side costs.
  const pfEmployerAmount = round2(basicPlusDa * (rateCard.pfEmployerPct / 100));
  const esicEmployerAmount = esicApplicable
    ? round2(basicPlusDa * (rateCard.esicEmployerPct / 100))
    : 0;
  const bonusAmount = round2(basicPlusDa * (rateCard.bonusPct / 100));
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
  const serviceChargeAmount = round2(
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
    hra,
    basicPlusDa,
    esicApplicable,
    grossSalary,
    pfEmployeeAmount,
    esicEmployeeAmount,
    professionalTax,
    netTakeHome,
    pfEmployerAmount,
    esicEmployerAmount,
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
