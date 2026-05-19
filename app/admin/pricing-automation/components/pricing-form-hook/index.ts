import { PriceRule } from "@/types";
import { useCallback, useState } from "react";
import {
  validatePriceRuleForm,
} from "@/app/admin/pricing-automation/utils/ruleUtils";

export type { PriceRuleFormErrors } from "@/app/admin/pricing-automation/utils/ruleUtils";

const defaultForm: PriceRule = {
  name: "",
  description: "",
  status: "active",
  match_type: "all",
  conditions: [{ id: "", field: "", value: "", operator: "" }],
  action_operator: "+",
  action_mode: "percentage",
  action_value: null,
};

export const usePricingAutomationForm = (
  isEditMode: boolean,
  initialData?: Partial<PriceRule>
) => {
  const [formData, setFormData] = useState<PriceRule>(() => {
    if (isEditMode && initialData) {
      return {
        ...defaultForm,
        ...initialData,
        conditions: initialData.conditions?.length
          ? initialData.conditions
          : defaultForm.conditions,
      };
    }
    return defaultForm;
  });

  const validateForm = useCallback(
    () => validatePriceRuleForm(formData),
    [formData]
  );

  const resetForm = () => {
    setFormData({ ...defaultForm });
  };

  const updateFormData = useCallback((updates: Partial<PriceRule>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    setFormData,
    resetForm,
    validateForm,
    updateFormData,
  };
};
