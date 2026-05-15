import { PriceRule } from "@/types";
import { useCallback, useState } from "react";
import {
  PriceRuleFormErrors,
  validatePriceRuleForm,
} from "@/app/admin/pricing-automation/utils/ruleUtils";

export type PriceRuleErrors = PriceRuleFormErrors;

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

const emptyErrors = (): PriceRuleFormErrors => ({
  name: "",
  status: "",
  match_type: "",
  conditions: "",
  action_value: "",
  action_operator: "",
  action_mode: "",
});

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

  const [errors, setErrors] = useState<PriceRuleFormErrors>(emptyErrors());

  const validateForm = useCallback(() => {
    const { errors: nextErrors, isValid } = validatePriceRuleForm(formData);
    setErrors(nextErrors);
    return isValid;
  }, [formData]);

  const resetForm = () => {
    setFormData({ ...defaultForm });
    setErrors(emptyErrors());
  };

  const updateFormData = useCallback((updates: Partial<PriceRule>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    resetForm,
    validateForm,
    updateFormData,
  };
};
