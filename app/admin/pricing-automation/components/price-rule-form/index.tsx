'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Condition, PriceRule } from "@/lib/redux/features/priceAutomationApi";
import { usePricingAutomationForm } from "../pricing-form-hook";
import DynamicField from "../dynamic-field";
import { useRouter } from "next/navigation";
import { useGetBrandsQuery } from "@/lib/redux/features";

interface PriceRuleFormProps {
  mode: "create" | "edit";
  initialData?: PriceRule;
  onSubmit: (data: PriceRule) => void;
}

const PriceRuleForm = ({
  mode = "create",
  initialData,
  onSubmit,
}: PriceRuleFormProps) => {
  const router = useRouter();
  
  
  const [conditions, setConditions] = useState<Condition[]>(
    initialData?.conditions?.length
      ? initialData.conditions
      : [{ id: "1", field: "name", value: "", operator: "" }]
  );

  const [matchCondition, setMatchCondition] = useState(
    initialData?.match_type ?? "all"
  );
console.log(initialData)
  const { formData, errors, updateFormData, validateForm } =  usePricingAutomationForm(mode === "edit", initialData);

  const { data: brandsData } = useGetBrandsQuery({ per_page: 100 });

  useEffect(() => {
    updateFormData({
      conditions,
      match_type: matchCondition,
    });
  }, [conditions, matchCondition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
     onSubmit(formData);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">

       <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-2"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{mode === "create" ? "Add New Rule" : "Edit Rule"}</h1>
          <p className="text-muted-foreground"> {mode === "create" ? "Create a new price automation rule with condition" : "Update existing Rule "} </p>
        </div>
      </div>
    <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border p-6">
        {/* Rule Details */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-5 py-4  border-border">
          <div className="space-y-2">
            <Label htmlFor="faceValue" className="text-sm font-medium">
              Rule Name *
            </Label>
            <Input
              id="name"
              type="text"
              maxLength={100}
              placeholder="Enter Rule Name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              className="h-11"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="faceValue" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="desc"
              maxLength={200}
              placeholder="Enter Description"
              value={formData.description ?? ""}
              onChange={(e) => updateFormData({ description: e.target.value })}
              className="h-11"
            />
          </div>
        </div>
        {/* Dynamic Conditions */}
        <DynamicField conditionError={errors?.conditions}  matchCondition={matchCondition} setMatchCondition={setMatchCondition} conditions={conditions} setConditions={setConditions} selectorOptions={brandsData?.data ?? []} />

        {/* Price Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border">
          <div className="space-y-2 pb-0">
            <Label htmlFor="actionValue" className="text-sm font-medium flex items-center gap-2">
              Action Value *
            </Label>
            <div className="relative">
              <Input
                id="value"
                type="number"
                min="1"
                max="10"
                value={formData.action_value === 0 ? "" : formData.action_value }
                placeholder="Enter value"
                onChange={(e) => updateFormData({ action_value: Number(e.target.value) })}
                className="h-11"
              />
                 {errors.action_value && <p className="text-sm text-red-500">{errors.action_value}</p>}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-2 pb-3">
            <Label className="text-sm font-medium">Action Operator</Label>
            <div className="space-y-2">
              <Select
                value={formData?.action_operator}
                onValueChange={(value) => updateFormData({ action_operator: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Subtract (-)</SelectItem>
                  <SelectItem value="+"> Add (+)</SelectItem>
                </SelectContent>
              </Select>
                 {errors.action_operator && <p className="text-sm text-red-500">{errors.action_operator}</p>}

            </div>
          </div>

          <div className="flex flex-col justify-between gap-2">
            <Label className="text-sm font-medium"> Action Mode </Label>
            <div className="space-y-2">
              <Select
                value={formData?.action_mode}
                onValueChange={(value) => updateFormData({ action_mode: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="absolute"> Number </SelectItem>
                </SelectContent>
              </Select>
              {errors.action_mode && <p className="text-sm text-red-500">{errors.action_mode}</p>}

            </div>
          </div>

          <div className="flex flex-col justify-between gap-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              <Select
                value={formData?.status}
                onValueChange={(value) => updateFormData({ status: value  as "active" | "in_active" })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_active">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" className="h-11 px-6">
             {mode === "create" ? "Add Rule" : "Save Rule" }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PriceRuleForm;
