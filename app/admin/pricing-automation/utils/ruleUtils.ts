import { Condition, PriceRule } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PriceRuleFormErrors {
  name: string;
  status: string;
  match_type: string;
  conditions: string;
  action_value: string;
  action_operator: string;
  action_mode: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates the price-rule form and returns an error map plus an isValid flag.
 */
export function validatePriceRuleForm(formData: PriceRule): {
  errors: PriceRuleFormErrors;
  isValid: boolean;
} {
  const errors: PriceRuleFormErrors = {
    name: "",
    status: "",
    match_type: "",
    conditions: "",
    action_value: "",
    action_operator: "",
    action_mode: "",
  };

  let isValid = true;

  if (!formData.name?.trim()) {
    errors.name = "Rule name is required";
    isValid = false;
  } else if (formData.name.trim().length > 100) {
    errors.name = "Rule name must be 100 characters or fewer";
    isValid = false;
  }

  if (!formData.conditions?.length) {
    errors.conditions = "At least one condition is required";
    isValid = false;
  } else if (formData.conditions.some((c) => !c.value?.trim())) {
    errors.conditions = "All conditions must have a value";
    isValid = false;
  }

  if (formData.action_value === null || formData.action_value === undefined) {
    errors.action_value = "Action value is required";
    isValid = false;
  }

  if (!formData.action_operator) {
    errors.action_operator = "Action operator is required";
    isValid = false;
  }

  if (!formData.action_mode) {
    errors.action_mode = "Action mode is required";
    isValid = false;
  }

  return { errors, isValid };
}

/**
 * Returns an error message when the action value is invalid, or null when OK.
 * Separated from validatePriceRuleForm so it can be shown as a toast.
 */
export function validateActionValue(value: number | null): string | null {
  if (value === null || value === undefined) {
    return "Action value is required";
  }
  if (value < 0) {
    return "Action value cannot be negative";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Payload transformations (UI ↔ API)
// ---------------------------------------------------------------------------

/**
 * Converts the in-memory rule (supplier stored as id) to the API payload
 * (supplier stored as name).
 */
export function toRulePayload(
  rule: PriceRule,
  suppliersById: Map<number, string>
): PriceRule {
  return {
    ...rule,
    conditions: rule.conditions.map((c) => {
      if (c.field !== "supplier_name") return c;
      const id = Number(c.value);
      const name = suppliersById.get(id);
      return name ? { ...c, value: name } : c;
    }),
  };
}

/**
 * Converts an API rule payload (supplier stored as name or already as id) to
 * the UI form shape (supplier stored as id string).
 */
export function fromRulePayload(
  rule: Partial<PriceRule>,
  suppliersByNameToFirstId: Map<string, number>,
  suppliersById: Map<number, string>
): Partial<PriceRule> {
  if (!rule) return rule;
  return {
    ...rule,
    conditions: rule.conditions?.map((c) => {
      if (c.field !== "supplier_name") return c;
      // Already stored as a numeric id
      const asId = Number(c.value);
      if (!Number.isNaN(asId) && suppliersById.has(asId)) {
        return { ...c, value: String(asId) };
      }
      // Stored as a human-readable name – convert to id
      const mappedId = suppliersByNameToFirstId.get(c.value);
      return mappedId != null ? { ...c, value: String(mappedId) } : c;
    }),
  };
}

// ---------------------------------------------------------------------------
// Comparison helper
// ---------------------------------------------------------------------------

/**
 * Returns a stable snapshot of a rule that can be JSON-stringified for
 * deep comparison.  Condition ids are stripped because they differ between
 * the initial server response and the local React state.
 */
export function normalizeRuleForComparison(
  rule?: Partial<PriceRule>
): Partial<PriceRule> | undefined {
  if (!rule) return rule;
  const { conditions, ...rest } = rule;
  return {
    ...rest,
    conditions: conditions
      ?.map(({ id: _id, ...c }) => c as Condition)
      .sort((a, b) => {
        const fieldCmp = a.field.localeCompare(b.field);
        if (fieldCmp !== 0) return fieldCmp;
        return a.value.localeCompare(b.value);
      }),
  };
}

// ---------------------------------------------------------------------------
// Preview / postview mode resolution
// ---------------------------------------------------------------------------

/**
 * Returns true when the "preview" API (pre-execution) should be used,
 * false when the "post-view" API (already-applied view) should be used.
 *
 * - create mode  → always preview (rule doesn't exist yet)
 * - edit mode with unsaved changes → preview (show what *would* change)
 * - edit mode without changes      → postview (show what *has* changed)
 */
export function resolveShouldUsePreviewMode(
  mode: "create" | "edit",
  hasFormChanges: boolean
): boolean {
  if (mode === "create") return true;
  return hasFormChanges;
}

// ---------------------------------------------------------------------------
// Price calculation (pure utility – useful for tests and local previews)
// ---------------------------------------------------------------------------

/**
 * Applies a price rule's action to a face value and returns the new price.
 *
 * Examples
 *  - face=100, mode="percentage", op="+", value=10 → 110
 *  - face=100, mode="percentage", op="-", value=10 → 90
 *  - face=100, mode="absolute",   op="+", value=5  → 105
 *  - face=100, mode="absolute",   op="-", value=5  → 95
 */
export function applyPriceRule(
  faceValue: number,
  rule: Pick<PriceRule, "action_mode" | "action_operator" | "action_value">
): number {
  const { action_mode, action_operator, action_value } = rule;
  if (action_value === null || action_value === undefined) return faceValue;

  const delta =
    action_mode === "percentage"
      ? (faceValue * action_value) / 100
      : action_value;

  return action_operator === "+" ? faceValue + delta : faceValue - delta;
}
