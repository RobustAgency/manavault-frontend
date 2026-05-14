/**
 * Unit tests for app/admin/pricing-automation/utils/ruleUtils.ts
 *
 * Coverage areas
 * ──────────────
 * 1. Rule implementation  – rule creation helpers, activation state, payload shape
 * 2. Validation           – valid rule, missing fields, conflicting rules, boundaries
 * 3. Payload transforms   – toRulePayload / fromRulePayload (supplier id ↔ name)
 * 4. Comparison helper    – normalizeRuleForComparison
 * 5. Preview mode         – resolveShouldUsePreviewMode
 */

import { describe, it, expect } from "vitest";
import {
  validatePriceRuleForm,
  validateActionValue,
  toRulePayload,
  fromRulePayload,
  normalizeRuleForComparison,
  resolveShouldUsePreviewMode,
} from "@/app/admin/pricing-automation/utils/ruleUtils";
import type { PriceRule, Condition } from "@/types";

// ─── Shared test data ───────────────────────────────────────────────────────

const validCondition: Condition = {
  id: "1",
  field: "name",
  operator: "=",
  value: "PlayStation",
};

const validRule: PriceRule = {
  name: "Increase PlayStation by 10%",
  description: "Add 10% to all PlayStation products",
  status: "active",
  match_type: "all",
  conditions: [validCondition],
  action_value: 10,
  action_operator: "+",
  action_mode: "percentage",
};

// ─── 1. Rule creation helpers ────────────────────────────────────────────────

describe("validatePriceRuleForm – rule implementation", () => {
  it("accepts a fully populated, valid rule", () => {
    const { isValid, errors } = validatePriceRuleForm(validRule);
    expect(isValid).toBe(true);
    expect(errors.name).toBe("");
    expect(errors.conditions).toBe("");
    expect(errors.action_value).toBe("");
  });

  it("accepts a rule with status set to 'in_active' (rule activation off)", () => {
    const rule: PriceRule = { ...validRule, status: "in_active" };
    const { isValid } = validatePriceRuleForm(rule);
    expect(isValid).toBe(true);
  });

  it("accepts a rule with multiple conditions (multi-condition rule)", () => {
    const rule: PriceRule = {
      ...validRule,
      conditions: [
        { id: "1", field: "name", operator: "contains", value: "Gift" },
        { id: "2", field: "brand", operator: "=", value: "Apple" },
      ],
      match_type: "any",
    };
    const { isValid } = validatePriceRuleForm(rule);
    expect(isValid).toBe(true);
  });

  it("accepts an absolute-mode subtract rule", () => {
    const rule: PriceRule = {
      ...validRule,
      action_mode: "absolute",
      action_operator: "-",
      action_value: 5,
    };
    const { isValid } = validatePriceRuleForm(rule);
    expect(isValid).toBe(true);
  });
});

// ─── 2. Validation – missing required fields ─────────────────────────────────

describe("validatePriceRuleForm – missing fields", () => {
  it("fails when rule name is empty", () => {
    const { isValid, errors } = validatePriceRuleForm({ ...validRule, name: "" });
    expect(isValid).toBe(false);
    expect(errors.name).toBeTruthy();
  });

  it("fails when rule name is whitespace-only", () => {
    const { isValid, errors } = validatePriceRuleForm({ ...validRule, name: "   " });
    expect(isValid).toBe(false);
    expect(errors.name).toBeTruthy();
  });

  it("fails when conditions array is empty", () => {
    const { isValid, errors } = validatePriceRuleForm({ ...validRule, conditions: [] });
    expect(isValid).toBe(false);
    expect(errors.conditions).toBeTruthy();
  });

  it("fails when a condition has an empty value", () => {
    const rule: PriceRule = {
      ...validRule,
      conditions: [{ id: "1", field: "name", operator: "=", value: "" }],
    };
    const { isValid, errors } = validatePriceRuleForm(rule);
    expect(isValid).toBe(false);
    expect(errors.conditions).toBeTruthy();
  });

  it("fails when action_value is null", () => {
    const { isValid, errors } = validatePriceRuleForm({ ...validRule, action_value: null });
    expect(isValid).toBe(false);
    expect(errors.action_value).toBeTruthy();
  });

  it("fails when action_operator is empty string", () => {
    const { isValid, errors } = validatePriceRuleForm({ ...validRule, action_operator: "" });
    expect(isValid).toBe(false);
    expect(errors.action_operator).toBeTruthy();
  });

  it("fails when action_mode is empty string", () => {
    const { isValid, errors } = validatePriceRuleForm({ ...validRule, action_mode: "" });
    expect(isValid).toBe(false);
    expect(errors.action_mode).toBeTruthy();
  });

  it("accumulates multiple errors for multiple missing fields", () => {
    const rule: PriceRule = { ...validRule, name: "", action_value: null, action_operator: "" };
    const { isValid, errors } = validatePriceRuleForm(rule);
    expect(isValid).toBe(false);
    expect(errors.name).toBeTruthy();
    expect(errors.action_value).toBeTruthy();
    expect(errors.action_operator).toBeTruthy();
  });
});

// ─── 3. Validation – boundary conditions ─────────────────────────────────────

describe("validatePriceRuleForm – boundary conditions", () => {
  it("accepts rule name exactly at the 100-character limit", () => {
    const name = "A".repeat(100);
    const { isValid } = validatePriceRuleForm({ ...validRule, name });
    expect(isValid).toBe(true);
  });

  it("fails rule name that exceeds 100 characters", () => {
    const name = "A".repeat(101);
    const { isValid, errors } = validatePriceRuleForm({ ...validRule, name });
    expect(isValid).toBe(false);
    expect(errors.name).toBeTruthy();
  });

  it("accepts action_value of 0 (zero discount)", () => {
    const { isValid } = validatePriceRuleForm({ ...validRule, action_value: 0 });
    expect(isValid).toBe(true);
  });

  it("accepts very large action_value (no upper cap in form validation)", () => {
    const { isValid } = validatePriceRuleForm({ ...validRule, action_value: 999999 });
    expect(isValid).toBe(true);
  });
});

// ─── 4. validateActionValue ──────────────────────────────────────────────────

describe("validateActionValue", () => {
  it("returns null for a valid positive number", () => {
    expect(validateActionValue(10)).toBeNull();
  });

  it("returns null for zero", () => {
    expect(validateActionValue(0)).toBeNull();
  });

  it("returns an error string for null", () => {
    expect(validateActionValue(null)).toBeTruthy();
  });

  it("returns an error string for negative value", () => {
    expect(validateActionValue(-1)).toBeTruthy();
  });

  it("returns an error string for -0.01 (floating point negative)", () => {
    expect(validateActionValue(-0.01)).toBeTruthy();
  });

  it("returns null for a decimal positive value like 0.5", () => {
    expect(validateActionValue(0.5)).toBeNull();
  });
});

// ─── 5. toRulePayload – supplier id → name ───────────────────────────────────

describe("toRulePayload", () => {
  const suppliersById = new Map<number, string>([
    [1, "Acme Corp"],
    [2, "Globex"],
  ]);

  it("converts supplier_name condition from numeric id to name", () => {
    const rule: PriceRule = {
      ...validRule,
      conditions: [{ id: "1", field: "supplier_name", operator: "=", value: "1" }],
    };
    const payload = toRulePayload(rule, suppliersById);
    expect(payload.conditions[0].value).toBe("Acme Corp");
  });

  it("leaves non-supplier conditions unchanged", () => {
    const rule: PriceRule = {
      ...validRule,
      conditions: [{ id: "1", field: "name", operator: "=", value: "PlayStation" }],
    };
    const payload = toRulePayload(rule, suppliersById);
    expect(payload.conditions[0].value).toBe("PlayStation");
  });

  it("leaves supplier condition unchanged when id is not in the map", () => {
    const rule: PriceRule = {
      ...validRule,
      conditions: [{ id: "1", field: "supplier_name", operator: "=", value: "999" }],
    };
    const payload = toRulePayload(rule, suppliersById);
    expect(payload.conditions[0].value).toBe("999");
  });

  it("handles mixed supplier and non-supplier conditions", () => {
    const rule: PriceRule = {
      ...validRule,
      conditions: [
        { id: "1", field: "supplier_name", operator: "=", value: "2" },
        { id: "2", field: "name", operator: "contains", value: "Card" },
      ],
    };
    const payload = toRulePayload(rule, suppliersById);
    expect(payload.conditions[0].value).toBe("Globex");
    expect(payload.conditions[1].value).toBe("Card");
  });
});

// ─── 6. fromRulePayload – supplier name → id ─────────────────────────────────

describe("fromRulePayload", () => {
  const suppliersById = new Map<number, string>([
    [1, "Acme Corp"],
    [2, "Globex"],
  ]);
  const suppliersByNameToFirstId = new Map<string, number>([
    ["Acme Corp", 1],
    ["Globex", 2],
  ]);

  it("converts supplier_name condition from name to id", () => {
    const rule: Partial<PriceRule> = {
      conditions: [{ id: "1", field: "supplier_name", operator: "=", value: "Acme Corp" }],
    };
    const result = fromRulePayload(rule, suppliersByNameToFirstId, suppliersById);
    expect(result.conditions![0].value).toBe("1");
  });

  it("keeps supplier_name as id when value is already a valid numeric id", () => {
    const rule: Partial<PriceRule> = {
      conditions: [{ id: "1", field: "supplier_name", operator: "=", value: "2" }],
    };
    const result = fromRulePayload(rule, suppliersByNameToFirstId, suppliersById);
    expect(result.conditions![0].value).toBe("2");
  });

  it("leaves supplier_name unchanged when name is not in the map", () => {
    const rule: Partial<PriceRule> = {
      conditions: [{ id: "1", field: "supplier_name", operator: "=", value: "Unknown Co" }],
    };
    const result = fromRulePayload(rule, suppliersByNameToFirstId, suppliersById);
    expect(result.conditions![0].value).toBe("Unknown Co");
  });

  it("leaves non-supplier conditions untouched", () => {
    const rule: Partial<PriceRule> = {
      conditions: [{ id: "1", field: "brand", operator: "=", value: "Sony" }],
    };
    const result = fromRulePayload(rule, suppliersByNameToFirstId, suppliersById);
    expect(result.conditions![0].value).toBe("Sony");
  });
});

// ─── 7. normalizeRuleForComparison ───────────────────────────────────────────

describe("normalizeRuleForComparison", () => {
  it("returns undefined when given undefined", () => {
    expect(normalizeRuleForComparison(undefined)).toBeUndefined();
  });

  it("strips condition ids so two rules with different ids compare equal", () => {
    const ruleA: Partial<PriceRule> = {
      ...validRule,
      conditions: [{ id: "abc-123", field: "name", operator: "=", value: "Gift" }],
    };
    const ruleB: Partial<PriceRule> = {
      ...validRule,
      conditions: [{ id: "xyz-999", field: "name", operator: "=", value: "Gift" }],
    };
    expect(JSON.stringify(normalizeRuleForComparison(ruleA))).toBe(
      JSON.stringify(normalizeRuleForComparison(ruleB))
    );
  });

  it("sorts conditions so order-independent rules compare equal", () => {
    const ruleA: Partial<PriceRule> = {
      conditions: [
        { id: "1", field: "brand", operator: "=", value: "Sony" },
        { id: "2", field: "name", operator: "=", value: "Card" },
      ],
    };
    const ruleB: Partial<PriceRule> = {
      conditions: [
        { id: "3", field: "name", operator: "=", value: "Card" },
        { id: "4", field: "brand", operator: "=", value: "Sony" },
      ],
    };
    expect(JSON.stringify(normalizeRuleForComparison(ruleA))).toBe(
      JSON.stringify(normalizeRuleForComparison(ruleB))
    );
  });

  it("detects a genuine change in condition value", () => {
    const original: Partial<PriceRule> = {
      conditions: [{ id: "1", field: "name", operator: "=", value: "OldValue" }],
    };
    const modified: Partial<PriceRule> = {
      conditions: [{ id: "1", field: "name", operator: "=", value: "NewValue" }],
    };
    expect(JSON.stringify(normalizeRuleForComparison(original))).not.toBe(
      JSON.stringify(normalizeRuleForComparison(modified))
    );
  });

  it("detects a change in action_value", () => {
    const original: Partial<PriceRule> = { ...validRule, action_value: 10 };
    const modified: Partial<PriceRule> = { ...validRule, action_value: 20 };
    expect(JSON.stringify(normalizeRuleForComparison(original))).not.toBe(
      JSON.stringify(normalizeRuleForComparison(modified))
    );
  });
});

// ─── 8. resolveShouldUsePreviewMode ──────────────────────────────────────────

describe("resolveShouldUsePreviewMode", () => {
  it("returns true in create mode regardless of form-change flag", () => {
    expect(resolveShouldUsePreviewMode("create", false)).toBe(true);
    expect(resolveShouldUsePreviewMode("create", true)).toBe(true);
  });

  it("returns true in edit mode when the form has unsaved changes", () => {
    expect(resolveShouldUsePreviewMode("edit", true)).toBe(true);
  });

  it("returns false in edit mode when there are no unsaved changes (use postview)", () => {
    expect(resolveShouldUsePreviewMode("edit", false)).toBe(false);
  });
});
