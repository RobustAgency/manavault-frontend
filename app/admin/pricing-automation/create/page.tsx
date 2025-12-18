'use client'
import { useRouter } from "next/navigation";
import { PriceRule, useCreatePriceRuleMutation } from "@/lib/redux/features/priceAutomationApi";
import PriceRuleForm from "../components/price-rule-form";

const CreatePriceRule = () => {
  const router = useRouter();
  const [createPriceRule] = useCreatePriceRuleMutation();
  const handleCreate = async (data: PriceRule) => {
    await createPriceRule(data).unwrap();
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