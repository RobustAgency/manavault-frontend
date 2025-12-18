import { PriceRule } from "@/lib/redux/features/priceAutomationApi";
import { useState } from "react";

export interface PriceRuleErrors {
  name : string;
  description?: string;
  status : string;
  match_type : string;
  conditions: string;
  action_value: string;
    action_operator: string;
    action_mode: string,
}

const defaultForm: PriceRule = {
  name: "",
  description: "",
  status: "active",
  match_type: "all",
  conditions: [
    { id: "", field: "", value: "", operator: "" },
  ],
  action_operator: "+",
  action_mode: "percentage",
  action_value: 0,
};

export const usePricingAutomationForm = ( isEditMode: boolean,
  initialData?: Partial<PriceRule>) => {

  const [formData, setFormData] = useState<PriceRule>(()=>{
        if (isEditMode && initialData) {
      return {
        ...defaultForm,
        ...initialData,
        conditions:
          initialData.conditions?.length
            ? initialData.conditions
            : defaultForm.conditions,
      };
    }
    return defaultForm;
  });

  const [errors, setErrors] = useState<PriceRuleErrors>({
     name: "",
      status: "",
      match_type: "",
      conditions: "",
      action_value: "",
      action_operator: "",
      action_mode: ""
  });

  const validateForm = ()  => {
    const newErrors: PriceRuleErrors = {
      name: "",
      status: "",
      match_type: "",
      conditions: "",
      action_value: "",
      action_operator: "",
      action_mode: ""
    };



  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  }

  if (!formData.action_value) {
    newErrors.action_value = "Value is required";
  }
   if (formData.action_value <= 0) {
    newErrors.action_value = "Value must be greater than 0";
  }

  if (!formData.action_mode) {
    newErrors.action_mode = "Mode is required";
  }

  formData.conditions.forEach((condition) => {
  if (!condition.value || !condition.value.trim()) {
    newErrors.conditions = "Value is required";
  }
});

    setErrors(newErrors);

     const isValid = Object.values(newErrors).every((value) =>
    Array.isArray(value) ? value.length === 0 : value === ""
  );

  return isValid;
  };

  const resetForm = () => {
    setFormData({
       name : "",
    description: "",
    status : "active",
  match_type : "all",
  conditions: [
    {
   id: "",
  field: "",
  value: "",
  operator : ""
    }
  ],
  action_operator: "+",
  action_mode: "percentage",
  action_value: 0
  });

    setErrors({
        name: "",
      status: "",
      match_type: "",
      conditions: "",
      action_value: "",
      action_operator: "",
      action_mode: ""
    });
  };

  const updateFormData = (updates: Partial<PriceRule>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

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
