'use client';
import { useRouter } from "next/navigation";
import { useCreatePriceRuleMutation } from "@/lib/redux/features/priceAutomationApi";
import PriceRuleForm from "../components/price-rule-form";
import { PriceRule } from "@/types";
import { toast } from "react-toastify";

const CreatePriceRule = () => {
  const router = useRouter();
  const [createPriceRule] = useCreatePriceRuleMutation();

  const handleCreate = async (data: PriceRule) => {
    try {
      await createPriceRule(data).unwrap();
      toast.success("Price rule created successfully");
      router.back();
    } catch {
      toast.error("Failed to create price rule");
    }
  };

  return <PriceRuleForm mode="create" onSubmit={handleCreate} />;
};

export default CreatePriceRule;
