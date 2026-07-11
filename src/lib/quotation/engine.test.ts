import { describe, expect, it } from "vitest";
import {
  calculateQuotation,
  calculateQuotationLine,
  type RateCard,
} from "./engine";

// Verified line-for-line against the Integrix Driver CTC Calculator
// workbook's "Client Quotation" tab, for Zone I Skilled / ₹20,000 target
// take-home / 1 Driver — the exact numbers below (22180, 26011.5, 28612.5,
// 33762.75, etc.) come from that workbook, not from this engine's own math.
const zoneISkilled: RateCard = {
  id: "rate-card-1",
  zone: "Zone I",
  skillCategory: "Skilled",
  basic: 11632,
  da: 3900,
  hraPct: 5,
  pfEmployeePct: 12,
  pfEmployerEpfPct: 12,
  pfEmployerEdliPct: 0.5,
  pfEmployerAdminPct: 0.5,
  esicEmployeePct: 0.75,
  esicEmployerPct: 3.25,
  esicCeiling: 21000,
  bonusPct: 8.33,
  mlwfEmployer: 12.5,
  professionalTax: 200,
  serviceChargePct: 10,
};

// Basic+DA above the ESIC ceiling, to exercise the not-applicable branch.
const zoneISupervisor: RateCard = {
  ...zoneISkilled,
  skillCategory: "Supervisor",
  basic: 22000,
};

describe("calculateQuotationLine — Zone I Skilled, ₹20,000 target take-home", () => {
  const result = calculateQuotationLine(
    { role: "Driver", nos: 1, targetTakeHome: 20000 },
    zoneISkilled
  );

  it("matches the workbook's Employee Salary Structure", () => {
    expect(result.basicPlusDa).toBe(15532);
    expect(result.hra).toBe(777);
    expect(result.otherAllowances).toBe(5871);
    expect(result.grossSalary).toBe(22180);
    expect(result.pfEmployeeAmount).toBe(1864);
    expect(result.esicApplicable).toBe(true);
    expect(result.esicEmployeeAmount).toBe(116);
    expect(result.netTakeHome).toBe(20000);
  });

  it("matches the workbook's Employer Cost Build-Up, including the 3-part PF split", () => {
    expect(result.pfEmployerEpfAmount).toBe(1864);
    expect(result.pfEmployerEdliAmount).toBe(78);
    expect(result.pfEmployerAdminAmount).toBe(78);
    // The combined 2020 line only comes out right because each of the 3
    // statutory sub-components is rounded separately before summing —
    // round(13% of 15532) would give 2019, not 2020.
    expect(result.pfEmployerAmount).toBe(2020);
    expect(result.esicEmployerAmount).toBe(505);
    expect(result.bonusAmount).toBe(1294);
    expect(result.mlwfEmployerAmount).toBe(12.5);
    expect(result.totalCtcPerEmployee).toBe(26011.5);
  });

  it("matches the workbook's Total Manpower Cost and quotation totals", () => {
    expect(result.serviceChargeAmount).toBe(2601);
    expect(result.costPerNo).toBe(28612.5);
    expect(result.lineTotal).toBe(28612.5);

    const quotation = calculateQuotation(
      { gstPct: 18, lines: [{ role: "Driver", nos: 1, targetTakeHome: 20000 }] },
      zoneISkilled
    );
    expect(quotation.totalManpowerCost).toBe(28612.5);
    expect(quotation.gstAmount).toBe(5150.25);
    expect(quotation.totalCostToCompany).toBe(33762.75);
  });
});

describe("calculateQuotationLine", () => {
  it("does not apply ESIC when Basic+DA exceeds the ceiling", () => {
    const result = calculateQuotationLine(
      { role: "Supervisor", nos: 1, targetTakeHome: 30000 },
      zoneISupervisor
    );

    expect(result.esicApplicable).toBe(false);
    expect(result.esicEmployeeAmount).toBe(0);
    expect(result.esicEmployerAmount).toBe(0);
    expect(result.netTakeHome).toBe(30000);
  });

  it("computes gross as a direct sum, not an iterative solve", () => {
    const result = calculateQuotationLine(
      { role: "Security Guard", nos: 1, targetTakeHome: 15000 },
      zoneISkilled
    );

    expect(result.grossSalary).toBe(
      15000 +
        result.pfEmployeeAmount +
        result.esicEmployeeAmount +
        result.professionalTax
    );
  });

  it("computes PF employee, ESIC, and bonus off Basic+DA, not gross", () => {
    const result = calculateQuotationLine(
      { role: "Security Guard", nos: 1, targetTakeHome: 15000 },
      zoneISkilled
    );
    const basicPlusDa = zoneISkilled.basic + zoneISkilled.da;

    expect(result.pfEmployeeAmount).toBe(
      Math.round(basicPlusDa * (zoneISkilled.pfEmployeePct / 100))
    );
    expect(result.bonusAmount).toBe(
      Math.round(basicPlusDa * (zoneISkilled.bonusPct / 100))
    );
  });

  it("applies the service charge on top of total CTC, then multiplies by headcount", () => {
    const nos = 5;
    const result = calculateQuotationLine(
      { role: "Security Guard", nos, targetTakeHome: 15000 },
      zoneISkilled
    );

    expect(result.serviceChargeAmount).toBe(
      Math.round(result.totalCtcPerEmployee * (zoneISkilled.serviceChargePct / 100))
    );
    expect(result.costPerNo).toBeCloseTo(
      result.totalCtcPerEmployee + result.serviceChargeAmount,
      2
    );
    expect(result.lineTotal).toBeCloseTo(result.costPerNo * nos, 2);
  });

  it("honors a per-line service charge override", () => {
    const result = calculateQuotationLine(
      {
        role: "Security Guard",
        nos: 1,
        targetTakeHome: 15000,
        serviceChargePctOverride: 15,
      },
      zoneISkilled
    );

    expect(result.serviceChargePct).toBe(15);
    expect(result.serviceChargeAmount).toBe(
      Math.round(result.totalCtcPerEmployee * 0.15)
    );
  });

  it("rejects non-positive headcount or target take-home", () => {
    expect(() =>
      calculateQuotationLine(
        { role: "x", nos: 0, targetTakeHome: 15000 },
        zoneISkilled
      )
    ).toThrow();
    expect(() =>
      calculateQuotationLine(
        { role: "x", nos: 1, targetTakeHome: 0 },
        zoneISkilled
      )
    ).toThrow();
  });
});

describe("calculateQuotation", () => {
  it("sums line totals and applies GST to produce the total cost to company", () => {
    const result = calculateQuotation(
      {
        gstPct: 18,
        lines: [
          { role: "Security Guard", nos: 4, targetTakeHome: 15000 },
          { role: "Supervisor", nos: 1, targetTakeHome: 20000 },
        ],
      },
      zoneISkilled
    );

    const expectedManpowerCost = result.lines.reduce(
      (sum, line) => sum + line.lineTotal,
      0
    );
    expect(result.totalManpowerCost).toBeCloseTo(expectedManpowerCost, 2);
    expect(result.gstAmount).toBeCloseTo(result.totalManpowerCost * 0.18, 2);
    expect(result.totalCostToCompany).toBeCloseTo(
      result.totalManpowerCost + result.gstAmount,
      2
    );
  });

  it("rejects an empty quotation", () => {
    expect(() =>
      calculateQuotation({ gstPct: 18, lines: [] }, zoneISkilled)
    ).toThrow();
  });
});
