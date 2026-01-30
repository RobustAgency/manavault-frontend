'use client'
import { useRouter } from "next/navigation";
import { useCreatePriceRuleMutation } from "@/lib/redux/features/priceAutomationApi";
import PriceRuleForm from "../components/price-rule-form";
import { PriceRule } from "@/types";
import { toast } from "react-toastify";

const CreatePriceRule = () => {
  const router = useRouter();
  const [createPriceRule] = useCreatePriceRuleMutation();
  const handleCreate = async (data: PriceRule) => {
    await createPriceRule(data).unwrap()
    .then(() => {
      toast.success("Price rule created successfully");
    })
    .catch(() => {
      toast.error("Failed to create price rule");
    });
    router.back();
  };

  return (
      <PriceRuleForm
        mode="create"
        onSubmit={handleCreate}
      />
  );
}


export default CreatePriceRule