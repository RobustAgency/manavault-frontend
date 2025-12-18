import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { SetStateAction, Dispatch, useEffect } from "react";
import { Condition } from "@/lib/redux/features/priceAutomationApi";

export interface Brand {
  id: number;
  name: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
}
type Operator =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "contains";

type FieldKey =
  | "selling_price"
  | "name"
  | "brand_name"
  | "regions"
  | string;

export const FIELD_OPERATOR_MAP: Record<FieldKey, Operator[]> = {
  selling_price: ["=", "!=", ">", ">=", "<", "<="],
  name: ["=", "!=", "contains"],
  brand_name: ["=", "!="],
  regions: ["contains"],
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  "=": "Equals",
  "!=": "Not equals",
  ">": "Greater than",
  ">=": "Greater than or equal to",
  "<": "Less than",
  "<=": "Less than or equal to",
  contains: "Contains",
};

interface DynamicFieldTypes {
  conditions: Condition[];
  selectorOptions: Brand[];
  setConditions: React.Dispatch<React.SetStateAction<Condition[]>>
  matchCondition: string;
  setMatchCondition: Dispatch<SetStateAction<string>>;
  conditionError: string;
}

const DynamicField: React.FC<DynamicFieldTypes> = ({
  conditions,
  selectorOptions,
  setConditions,
  matchCondition,
  setMatchCondition,
  conditionError
}) => {
  // Helper function to get default operator for a field
  const getDefaultOperator = (field: FieldKey): Operator => {
    const operators = FIELD_OPERATOR_MAP[field];
    return operators && operators.length > 0 ? operators[0] : "=";
  };

  // Normalize conditions on mount to ensure valid operators
  useEffect(() => {
    const needsNormalization = conditions.some((condition) => {
      const validOperators = FIELD_OPERATOR_MAP[condition.field];
      return !validOperators?.includes(condition.operator as any);
    });

    if (needsNormalization) {
      const normalizedConditions = conditions.map((condition) => {
        const validOperators = FIELD_OPERATOR_MAP[condition.field];
        const isOperatorValid = validOperators?.includes(condition.operator as any);
        
        return {
          ...condition,
          operator: isOperatorValid ? condition.operator : getDefaultOperator(condition.field)
        };
      });
      
      setConditions(normalizedConditions);
    }
  }, []); 

  const addCondition = () => {
    const defaultField = "name";
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: defaultField,
      value: "",
      operator: getDefaultOperator(defaultField),
    };
    setConditions([...conditions, newCondition]);
  };

  const deleteCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((c: { id?: string }) => c.id !== id));
    }
  };

  const editCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === id) {
          if (updates.field && updates.field !== c.field) {
            return {
              ...c,
              ...updates,
              operator: getDefaultOperator(updates.field),
              value: ""
            };
          }
          return { ...c, ...updates };
        }
        return c;
      })
    );
  };

  const getValueOptions = (field: string) => {
    switch (field) {
      case "brand_name":
        return selectorOptions;
      default:
        return null;
    }
  };

  const fieldOptions = [
    { value: "name", label: "Product Name" },
    { value: "regions", label: "Region" },
    { value: "brand_name", label: "Brand" },
    { value: "selling_price", label: "Selling Price" },
  ];

  const getOperatorOptions = (field: FieldKey) => {
    return FIELD_OPERATOR_MAP[field]?.map((op) => ({
      value: op,
      label: OPERATOR_LABELS[op],
    }));
  };

  const ConditionOptions = [
    { value: "all", label: "Match All" },
    { value: "any", label: "Match Any" },
  ];

  
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Conditions *</Label>
        <div className="space-y-0">
          <Select
            value={matchCondition}
            onValueChange={(value) => setMatchCondition(value) }
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {ConditionOptions?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {conditions?.map((condition) => (
        <div key={condition.id} className="space-y-2">

          <div className="flex md:flex-row flex-col items-start gap-3 p-4 rounded-lg border border-border/50">

            {/* Label Field */}
            <div className="flex-1 w-full space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Field</Label>
              </div>
              <Select
                value={condition.field}
                onValueChange={(value) => editCondition(condition.id, { field: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Condition Field */}
            <div className="flex-1 w-full space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Operator</Label>
              </div>
              <Select
                value={condition.operator}
                onValueChange={(value) => editCondition(condition.id, { operator: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorOptions(condition.field)?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Value Field */}
            <div className="flex-1 w-full space-y-2 ">
              <div>
                <Label className="text-xs text-muted-foreground">Value</Label>
              </div>
              {getValueOptions(condition.field) ? (
                <Select
                  value={condition.value}
                  onValueChange={(value) => editCondition(condition.id, { value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {getValueOptions(condition.field)?.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <Input
                    placeholder="Enter value..."
                     min="1"
                    max="10"
                    value={condition.value}
                    onChange={(e) => editCondition(condition.id, { value: e.target.value })}
                    className="h-11 mb-2"
                  />
                  {conditionError && <p className="text-sm text-red-500"> {conditionError}</p>}
                </>
              )}
            </div>

            {conditions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={() => deleteCondition(condition.id)}
                className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Add Condition Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addCondition}
          className="text-xs text-white"
        >
          Add Condition
        </Button>

      </div>
    </div>
  );
};

export default DynamicField;