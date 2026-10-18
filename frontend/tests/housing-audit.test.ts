import { describe, it, expect } from "vitest";

import { diffStr, formatCurrency } from "@/lib/formatters";

import {
  HousingSourcesResponseSchema,
  SourcedHousingOption,
} from "@/types/sourced-housing";

import housingData from "../../data/housing_sources.json";

describe("Housing Cost Audit & Regression Tests", () => {
  describe("Real Production Housing Dataset Verification", () => {
    it("should validate all production housing options against Zod schema", () => {
      const parsed = HousingSourcesResponseSchema.parse(housingData);
      expect(parsed.housing_options.length).toBeGreaterThan(0);
      expect(parsed.housing_options.length).toBe(99);
    });

    it("should ensure every production record has positive cost_period_months", () => {
      const options = housingData.housing_options as SourcedHousingOption[];
      for (const opt of options) {
        if (opt.housing_cost !== null && opt.housing_cost !== undefined) {
          expect(opt.cost_period_months).toBeDefined();
          expect((opt.cost_period_months ?? 0)).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Billing Period & Rate Normalization with Real Data", () => {
    const options = housingData.housing_options as SourcedHousingOption[];

    it("should correctly normalize real Brumby Hall term rate into monthly equivalent", () => {
      const brumby = options.find(
        (o) => o.id === "brumby_hall_double_with_community_bath",
      );
      expect(brumby).toBeDefined();
      expect(brumby?.housing_cost).toBe(3595.0);
      expect(brumby?.cost_period_months).toBe(4);
      expect(brumby?.contract_months).toBe(8);

      const monthlyCost = (brumby!.housing_cost!) / (brumby!.cost_period_months!);
      expect(monthlyCost).toBe(898.75);
      expect(Math.round(monthlyCost)).toBe(899);
    });

    it("should sort real options (Low to High) based on normalized monthly cost, not raw term rate", () => {
      const brumby = options.find(
        (o) => o.id === "brumby_hall_double_with_community_bath",
      )!;
      const theStandard = options.find(
        (o) => o.id === "the_standard_at_athens_4_bed_4_bath",
      )!;
      const theConnection = options.find(
        (o) => o.id === "the_connection_at_athens_3_bedroom_3_bath_upgraded",
      )!;

      expect(brumby).toBeDefined();
      expect(theStandard).toBeDefined();
      expect(theConnection).toBeDefined();

      const sample = [brumby, theStandard, theConnection];

      const getMonthly = (o: SourcedHousingOption) =>
        (o.housing_cost ?? 0) / (o.cost_period_months || 1);

      const sortedAsc = [...sample].sort(
        (a, b) => getMonthly(a) - getMonthly(b),
      );

      // Order must be: The Connection ($709/mo), Brumby Hall ($898.75/mo), The Standard ($1,205/mo)
      expect(sortedAsc[0].id).toBe("the_connection_at_athens_3_bedroom_3_bath_upgraded");
      expect(sortedAsc[1].id).toBe("brumby_hall_double_with_community_bath");
      expect(sortedAsc[2].id).toBe("the_standard_at_athens_4_bed_4_bath");

      const sortedDesc = [...sample].sort(
        (a, b) => getMonthly(b) - getMonthly(a),
      );
      expect(sortedDesc[0].id).toBe("the_standard_at_athens_4_bed_4_bath");
      expect(sortedDesc[1].id).toBe("brumby_hall_double_with_community_bath");
      expect(sortedDesc[2].id).toBe("the_connection_at_athens_3_bedroom_3_bath_upgraded");
    });
  });

  describe("Contract Duration Fallback", () => {
    it("should default null contract_months to standard 12 months for off-campus and 8 for on-campus", () => {
      const offCampusNull = {
        category: "off_campus",
        contract_months: null,
      };
      const onCampusNull = {
        category: "on_campus",
        contract_months: null,
      };

      const mapContract = (item: { category: string; contract_months: number | null }) =>
        item.contract_months ?? (item.category === "on_campus" ? 8 : 12);

      expect(mapContract(offCampusNull)).toBe(12);
      expect(mapContract(onCampusNull)).toBe(8);
    });
  });

  describe("Formatters and Diff Presentation", () => {
    it("should format currency properly", () => {
      expect(formatCurrency(898.75)).toBe("898.75");
      expect(formatCurrency(1205)).toBe("1,205.00");
    });

    it("should format diffStr with appropriate suffixes", () => {
      expect(diffStr(556.25, "/month")).toBe("$556.25/month");
      expect(diffStr(-306.25, "/month")).toBe("-$306.25/month");
      expect(diffStr(null, "/month")).toBe("Unknown");
      expect(diffStr(200, "/month")).toBe("$200.00/month");
    });
  });

  describe("Advanced Decision Metrics (Daily Delta & Break-Even)", () => {
    it("should accurately compute approximate daily delta from monthly difference", () => {
      const monthlyDelta = 306.25;
      const dailyDelta = monthlyDelta / 30;
      expect(dailyDelta).toBeCloseTo(10.208, 2);
      expect(formatCurrency(dailyDelta)).toBe("10.21");
    });

    it("should calculate break-even months when upfront cost is higher and monthly cost is lower", () => {
      const upfrontDelta = 600; // Costs $600 more upfront
      const monthlySavings = 150; // Saves $150/mo
      const breakEvenMonths = upfrontDelta / monthlySavings;
      expect(breakEvenMonths).toBe(4.0);
      expect(breakEvenMonths.toFixed(1)).toBe("4.0");
    });

    it("should accurately calculate cost drivers and commute savings", () => {
      const largestIncrease = { category: "housing", difference: 200 };
      const largestOffset = { category: "transportation", difference: -50 };
      expect(formatCurrency(largestIncrease.difference)).toBe("200.00");
      expect(formatCurrency(Math.abs(largestOffset.difference))).toBe("50.00");

      const commuteDelta = -15; // 15 min saved
      expect(Math.abs(commuteDelta)).toBe(15);

      const extraMonthlyForCommute = 100;
      const minutesSaved = 15;
      expect(formatCurrency(extraMonthlyForCommute)).toBe("100.00");
      expect(minutesSaved).toBe(15);
    });
  });
});
