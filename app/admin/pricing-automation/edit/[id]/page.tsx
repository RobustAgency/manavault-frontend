'use client'
import { useParams, useRouter } from "next/navigation";
import {
  PriceRule,
  useGetPriceRuleQuery,
  useUpdatePriceRuleMutation
} from "@/lib/redux/features/priceAutomationApi";
import PriceRuleForm from "../../components/price-rule-form";

const EditPriceRulePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: priceRuleListData, isLoading } = useGetPriceRuleQuery(id);

  const [updatePriceRule] = useUpdatePriceRuleMutation();

  const handleEdit = async (updateData: PriceRule) => {
    if (!id || !updateData) return;

    await updatePriceRule({
      id,
      data: updateData
    }).unwrap();
    router.back();
  };

  return (
    <>
      {isLoading ? <>
        <div className="flex items-center justify-center h-screen w-full">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary mr-2" />
          Loading...
        </div>
      </> :
        <PriceRuleForm
          initialData={priceRuleListData}
          mode="edit"
          onSubmit={handleEdit}
        />
      }

    </>
  );
}

export default EditPriceRulePage;
