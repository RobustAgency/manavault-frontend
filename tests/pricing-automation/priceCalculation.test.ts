/**
 * Price-calculation tests for applyPriceRule
 *
 * Coverage areas
 * ──────────────
 * 1. Correct price application – percentage and absolute modes, + and -
 * 2. Multi-product scenarios   – applying the same rule across several products
 * 3. Boundary conditions       – zero value, null value, floating-point precision
 * 4. Conflicting-rule simulation – two rules applied in sequence to the same product
 */

import { describe, it, expect } from "vitest";
import { applyPriceRule } from "@/app/admin/pricing-automation/utils/ruleUtils";
import type { PriceRule } from "@/types";

// ─── Helper ──────────────────────────────────────────────────────────────────

type RuleAction = Pick<PriceRule, "action_mode" | "action_operator" | "action_value">;

// ─── 1. Correct price application ────────────────────────────────────────────

describe("applyPriceRule – percentage mode", () => {
  it("adds 10% to face value of 100 → 110", () => {
    const action: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 10,
    };
    expect(applyPriceRule(100, action)).toBe(110);
  });

  it("subtracts 10% from face value of 100 → 90", () => {
    const action: RuleAction = {
      action_mode: "percentage",
      action_operator: "-",
      action_value: 10,
    };
    expect(applyPriceRule(100, action)).toBe(90);
  });

  it("adds 100% to face value of 50 → 100 (doubles the price)", () => {
    const action: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 100,
    };
    expect(applyPriceRule(50, action)).toBe(100);
  });

  it("adds 5% to face value of 200 → 210", () => {
    const action: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 5,
    };
    expect(applyPriceRule(200, action)).toBe(210);
  });

  it("subtracts 50% from face value of 80 → 40", () => {
    const action: RuleAction = {
      action_mode: "percentage",
      action_operator: "-",
      action_value: 50,
    };
    expect(applyPriceRule(80, action)).toBe(40);
  });
});

describe("applyPriceRule – absolute mode", () => {
  it("adds 5 to face value of 100 → 105", () => {
    const action: RuleAction = {
      action_mode: "absolute",
      action_operator: "+",
      action_value: 5,
    };
    expect(applyPriceRule(100, action)).toBe(105);
  });

  it("subtracts 5 from face value of 100 → 95", () => {
    const action: RuleAction = {
      action_mode: "absolute",
      action_operator: "-",
      action_value: 5,
    };
    expect(applyPriceRule(100, action)).toBe(95);
  });

  it("adds 0.99 to face value of 9.99 → 10.98", () => {
    const action: RuleAction = {
      action_mode: "absolute",
      action_operator: "+",
      action_value: 0.99,
    };
    expect(applyPriceRule(9.99, action)).toBeCloseTo(10.98, 5);
  });

  it("subtracts 20 from face value of 20 → 0 (price reaches zero)", () => {
    const action: RuleAction = {
      action_mode: "absolute",
      action_operator: "-",
      action_value: 20,
    };
    expect(applyPriceRule(20, action)).toBe(0);
  });
});

// ─── 2. Multi-product scenarios ──────────────────────────────────────────────

describe("applyPriceRule – multi-product scenarios", () => {
  const percentageAddRule: RuleAction = {
    action_mode: "percentage",
    action_operator: "+",
    action_value: 10,
  };

  const productCatalog = [
    { name: "Gift Card $10", faceValue: 10 },
    { name: "Gift Card $25", faceValue: 25 },
    { name: "Gift Card $50", faceValue: 50 },
    { name: "Gift Card $100", faceValue: 100 },
  ];

  it("applies the same percentage rule to every product in a catalogue", () => {
    const expectedPrices = [11, 27.5, 55, 110];
    productCatalog.forEach((product, i) => {
      expect(applyPriceRule(product.faceValue, percentageAddRule)).toBeCloseTo(
        expectedPrices[i],
        5
      );
    });
  });

  it("absolute add rule increases all product prices by the same fixed amount", () => {
    const absoluteAddRule: RuleAction = {
      action_mode: "absolute",
      action_operator: "+",
      action_value: 3,
    };
    productCatalog.forEach((product) => {
      const newPrice = applyPriceRule(product.faceValue, absoluteAddRule);
      expect(newPrice).toBe(product.faceValue + 3);
    });
  });

  it("processes an empty product list without errors", () => {
    const emptyList: number[] = [];
    expect(() =>
      emptyList.map((fv) => applyPriceRule(fv, percentageAddRule))
    ).not.toThrow();
  });

  it("calculates total revenue impact across multiple products", () => {
    const rule: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 10,
    };
    const originalTotal = productCatalog.reduce((s, p) => s + p.faceValue, 0); // 185
    const newTotal = productCatalog.reduce(
      (s, p) => s + applyPriceRule(p.faceValue, rule),
      0
    );
    expect(newTotal).toBeCloseTo(originalTotal * 1.1, 5); // 203.5
  });
});

// ─── 3. Boundary conditions ───────────────────────────────────────────────────

describe("applyPriceRule – boundary conditions", () => {
  it("returns face value unchanged when action_value is 0 (no-op rule)", () => {
    const rule: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 0,
    };
    expect(applyPriceRule(100, rule)).toBe(100);
  });

  it("returns face value unchanged when action_value is null", () => {
    const rule: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: null,
    };
    expect(applyPriceRule(100, rule)).toBe(100);
  });

  it("handles a very large face value without overflow", () => {
    const rule: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 10,
    };
    expect(applyPriceRule(1_000_000, rule)).toBe(1_100_000);
  });

  it("handles fractional face values (e.g. 0.01)", () => {
    const rule: RuleAction = {
      action_mode: "absolute",
      action_operator: "+",
      action_value: 0.01,
    };
    expect(applyPriceRule(0.01, rule)).toBeCloseTo(0.02, 10);
  });

  it("subtracting more than the face value results in a negative price", () => {
    const rule: RuleAction = {
      action_mode: "absolute",
      action_operator: "-",
      action_value: 150,
    };
    expect(applyPriceRule(100, rule)).toBe(-50);
  });
});

// ─── 4. Conflicting-rule simulation (sequential application) ─────────────────

describe("applyPriceRule – conflicting rule simulation", () => {
  /**
   * Simulates what happens when two rules target the same product.
   * The system applies them in sequence (first rule output feeds second rule).
   */
  it("two rules applied in sequence compound correctly (add 10% then subtract 5%)", () => {
    const ruleA: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 10,
    };
    const ruleB: RuleAction = {
      action_mode: "percentage",
      action_operator: "-",
      action_value: 5,
    };
    const afterA = applyPriceRule(100, ruleA); // 110
    const afterB = applyPriceRule(afterA, ruleB); // 110 - 5.5 = 104.5
    expect(afterB).toBeCloseTo(104.5, 5);
  });

  it("two opposing percentage rules of equal magnitude do not fully cancel out", () => {
    const addRule: RuleAction = {
      action_mode: "percentage",
      action_operator: "+",
      action_value: 10,
    };
    const subtractRule: RuleAction = {
      action_mode: "percentage",
      action_operator: "-",
      action_value: 10,
    };
    const afterAdd = applyPriceRule(100, addRule); // 110
    const afterSubtract = applyPriceRule(afterAdd, subtractRule); // 110 - 11 = 99
    // Does NOT equal 100 – this is expected compound behaviour
    expect(afterSubtract).toBeCloseTo(99, 5);
  });

  it("two absolute rules applied in sequence add up linearly", () => {
    const ruleA: RuleAction = { action_mode: "absolute", action_operator: "+", action_value: 5 };
    const ruleB: RuleAction = { action_mode: "absolute", action_operator: "+", action_value: 3 };
    const afterA = applyPriceRule(100, ruleA); // 105
    const afterB = applyPriceRule(afterA, ruleB); // 108
    expect(afterB).toBe(108);
  });
});
