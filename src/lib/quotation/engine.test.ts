import { describe, expect, it } from "vitest";
import {
  calculateQuotation,
  calculateQuotationLine,
  type RateCard,
} from "./engine";

const zoneISkilled: RateCard = {
  id: "rate-card-1",
  zone: "Zone I",
  skillCategory: "Skilled",
  basic: 10928,
  da: 0,
  hraPct: 5,
  pfEmployeePct: 12,
  pfEmployerPct: 13,
  esicEmployeePct: 0.75,
  esicEmployerPct: 3.25,
  esicCeiling: 21000,
  bonusPct: 8.33,
  mlwfEmployer: 3,
  professionalTax: 200,
  serviceChargePct: 10,
};

describe("calculateQuotationLine", () => {
  it("solves gross so the net take-home matches the target, when ESIC applies", () => {
    const result = calculateQuotationLine(
      { role: "Security Guard", nos: 1, targetTakeHome: 15000 },
      zoneISkilled
    );

    expect(result.esicApplicable).toBe(true);
    expect(result.grossSalary).toBeLessThanOrEqual(zoneISkilled.esicCeiling);
    expect(result.netTakeHome).toBeCloseTo(15000, 1);
    expect(result.esicEmployeeAmount).toBeCloseTo(
      result.grossSalary * (zoneISkilled.esicEmployeePct / 100),
      2
    );
  });

  it("falls back to the no-ESIC scenario when the solved gross exceeds the ceiling", () => {
    const result = calculateQuotationLine(
      { role: "Supervisor", nos: 1, targetTakeHome: 20000 },
      zoneISkilled
    );

    expect(result.esicApplicable).toBe(false);
    expect(result.grossSalary).toBeGreaterThan(zoneISkilled.esicCeiling);
    expect(result.esicEmployeeAmount).toBe(0);
    expect(result.esicEmployerAmount).toBe(0);
    expect(result.netTakeHome).toBeCloseTo(20000, 1);
  });

  it("computes PF and bonus off Basic+DA, not gross", () => {
    const result = calculateQuotationLine(
      { role: "Security Guard", nos: 1, targetTakeHome: 15000 },
      zoneISkilled
    );
    const basicPlusDa = zoneISkilled.basic + zoneISkilled.da;

    expect(result.pfEmployeeAmount).toBeCloseTo(
      basicPlusDa * (zoneISkilled.pfEmployeePct / 100),
      2
    );
    expect(result.pfEmployerAmount).toBeCloseTo(
      basicPlusDa * (zoneISkilled.pfEmployerPct / 100),
      2
    );
    expect(result.bonusAmount).toBeCloseTo(
      basicPlusDa * (zoneISkilled.bonusPct / 100),
      2
    );
  });

  it("applies the service charge on top of total CTC, then multiplies by headcount", () => {
    const nos = 5;
    const result = calculateQuotationLine(
      { role: "Security Guard", nos, targetTakeHome: 15000 },
      zoneISkilled
    );

    expect(result.serviceChargeAmount).toBeCloseTo(
      result.totalCtcPerEmployee * (zoneISkilled.serviceChargePct / 100),
      2
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
    expect(result.serviceChargeAmount).toBeCloseTo(
      result.totalCtcPerEmployee * 0.15,
      2
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
    expect(result.gstAmount).toBeCloseTo(
      result.totalManpowerCost * 0.18,
      2
    );
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
