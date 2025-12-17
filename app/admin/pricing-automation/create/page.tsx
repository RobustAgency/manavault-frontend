'use client'
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useCreatePriceRuleMutation } from "@/lib/redux/features/priceAutomationApi";
import PriceRuleForm from "../components/price-rule-form";

const createPriceRule = () => {
  const router = useRouter();
  const [createPriceRule] = useCreatePriceRuleMutation();
  const handleCreate = async (data: any) => {
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


export default createPriceRule