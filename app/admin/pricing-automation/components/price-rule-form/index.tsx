'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Eye } from "lucide-react";
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
import { ToggleSwitch } from "@/components/custom/ToggleSwitch";
import { useLazyGetPreviewRuleAffectedProductsQuery } from "@/lib/redux/features/priceAutomationApi";
import { PreviewProductsDialog } from "../preview-products-dialogue";
import { toast } from "react-toastify";

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
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>(
    initialData?.conditions?.length
      ? initialData.conditions
      : [{ id: "1", field: "name", value: "", operator: "" }]
  );

  const [matchCondition, setMatchCondition] = useState(
    initialData?.match_type ?? "all"
  );

  const { formData, errors, updateFormData, validateForm } = usePricingAutomationForm(mode === "edit", initialData);
  const { data: brandsData } = useGetBrandsQuery({ per_page: 100 });
  const [triggerPreview, { data: previewData, isLoading: isPreviewing }] = useLazyGetPreviewRuleAffectedProductsQuery()

  useEffect(() => {
    updateFormData({
      conditions,
      match_type: matchCondition,
    });
  }, [conditions, matchCondition]);

  const handlePreview = async () => {
    if (!formData.conditions[0].value || !formData.action_value) {
      toast.error("Please fill the form to preview products.");
    }
    await triggerPreview(formData).unwrap().then(() => {
      setIsPreviewDialogOpen(true);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (formData.action_value == null || !formData.action_value) {
      toast.error("Selling price value is required");
      return;
    }
    if (formData.action_value == null || formData.action_value <= 0) {
      toast.error("Selling price value must be greater than 0");
      return;
    }
    onSubmit(formData);
  };

  return (
    <>
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
          {/* Status */}
          <div className="flex justify-end">
            <ToggleSwitch
              id="status"
              label={`Status`}
              checked={formData.status === "active"}
              onCheckedChange={(checked) => updateFormData({ status: checked ? "active" : "in_active" })}
            />
          </div>
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
          <DynamicField conditionError={errors?.conditions} matchCondition={matchCondition} setMatchCondition={setMatchCondition} conditions={conditions} setConditions={setConditions} selectorOptions={brandsData?.data ?? []} />

          {/* Price Fields */}
          <div className="flex flex-col gap-0  border-t py-1">
            <div>
              <Label className="text-sm font-medium pt-4">Price Action *</Label>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>Set the selling price</span>

              {/* Value input */}
              <div className="flex flex-col">
                <Input
                  type="number"
                  value={formData.action_value ?? ""}
                  placeholder="0"
                  onChange={(e) =>
                    updateFormData({
                      action_value:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="h-9 w-20 text-left"
                />
                {errors.action_value && (
                  <p className="text-xs text-red-500">
                    {errors.action_value}
                  </p>
                )}
              </div>

              {/* Action Mode */}
              <div className="flex flex-col">
                <Select
                  value={formData.action_mode}
                  onValueChange={(value) =>
                    updateFormData({ action_mode: value })
                  }
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="absolute">Number</SelectItem>
                  </SelectContent>
                </Select>
                
              </div>
                {/* Operator */}
              <div className="flex flex-col">
                <Select
                  value={formData.action_operator}
                  onValueChange={(value) =>
                    updateFormData({ action_operator: value })
                  }
                >
                  <SelectTrigger className="h-9 w-30">
                    <SelectValue placeholder="+ / -" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+">Add (+)</SelectItem>
                    <SelectItem value="-">Subtract (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span>of the face value</span>
            </div>
          </div>

          <div className="mt-6 flex sm:flex-row flex-col justify-end gap-4">
            <Button type="button" variant={"outline"} className="h-11 px-6 sm:px-6" onClick={() => handlePreview()}>
              Preview <Eye className="h-4 w-4" />
            </Button>
            <Button type="submit" className="h-11 px-6 sm:px-6">
              {mode === "create" ? "Add & Execute Rule " : "Save & Execute Rule"}
            </Button>
          </div>
        </form>
      </div>

      <PreviewProductsDialog
        open={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        products={previewData || []}
        isLoading={isPreviewing}
      />
    </>
  );
};

export default PriceRuleForm;
