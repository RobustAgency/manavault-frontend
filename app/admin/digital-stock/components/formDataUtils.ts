import { CreateDigitalProductData } from '@/lib/redux/features';
import { type DigitalProductFormState } from './useDigitalProductForm';

export const convertFormToSubmitData = (
  form: DigitalProductFormState,
  supplierId: number
): CreateDigitalProductData => {
  const tagsArray = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const regionsArray = form.regions
    .split(',')
    .map((region) => region.trim())
    .filter(Boolean);

  let metadataObj: Record<string, unknown> | undefined;
  if (form.metadata.trim()) {
    try {
      metadataObj = JSON.parse(form.metadata);
    } catch {
      // Invalid JSON, will be caught by validation
    }
  }

  return {
    supplier_id: supplierId,
    name: form.name.trim(),
    sku: form.sku.trim(),
    brand: form.brand.trim() || undefined,
    description: form.description.trim() || undefined,
    tags: tagsArray.length > 0 ? tagsArray : undefined,
    image: form.image.trim() || undefined,
    cost_price: parseFloat(form.cost_price),
    status: form.status,
    regions: regionsArray.length > 0 ? regionsArray : undefined,
    metadata: metadataObj,
  };
};

