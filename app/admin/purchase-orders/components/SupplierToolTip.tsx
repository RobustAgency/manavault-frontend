import * as Tooltip from '@radix-ui/react-tooltip';

interface TypeToolTip {
  suppliersCount : number;
  suppliers: string[];
  defaultSuppliers : number;

}
const SupplierToolTip : React.FC<TypeToolTip> = ({
  suppliers, suppliersCount, defaultSuppliers
}) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
           <button className="btn cursor-pointer"> +{suppliersCount}</button>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            align="center"
            className="rounded bg-muted text-black px-2 py-1 text-sm shadow"
          >
            {suppliers.slice(defaultSuppliers).join(", ")}
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
export default SupplierToolTip;
