'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImagePicker } from '@/components/custom/ImagePicker';
import {
  useCreateBrandMutation,
  useUpdateBrandMutation,
  type Brand,
  type CreateBrandData,
  type UpdateBrandData,
} from '@/lib/redux/features';

const IMAGEPREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX || '';

interface BrandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
  onSuccess?: (brand: Brand) => void;
}

export const BrandDialog = ({
  isOpen,
  onClose,
  brand,
  onSuccess,
}: BrandDialogProps) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  const isLoading = isCreating || isUpdating;
  const isEditMode = !!brand;

  // Reset form when dialog opens/closes or brand changes
  useEffect(() => {
    if (isOpen) {
      if (brand) {
        setName(brand.name || '');
        // Prepend image prefix if image is a URL string
        const brandImage = brand.image || '';
        if (brandImage && typeof brandImage === 'string') {
          // Check if it's already a full URL or needs prefix
          const imageUrl = brandImage.startsWith('http://') || brandImage.startsWith('https://')
            ? brandImage
            : `${IMAGEPREFIX}${brandImage}`;
          setImage(imageUrl);
        } else {
          setImage('');
        }
      } else {
        setName('');
        setImage('');
      }
      setErrors({});
    }
  }, [isOpen, brand]);

  const handleSubmit = async () => {
    // Reset errors
    setErrors({});

    // Validation
    if (!name.trim()) {
      setErrors({ name: 'Brand name is required' });
      return;
    }

    try {
      let result: Brand;

      if (isEditMode && brand) {
        // Update existing brand
        const formData = new FormData();
        formData.append('name', name.trim());
        // Only send image if it's a new File (user uploaded a new one)
        // If it's still a string URL, it means the image wasn't changed
        if (image instanceof File) {
          formData.append('image', image);
        }
        // If image is a string, it's the existing image URL - don't send it

        result = await updateBrand({
          id: brand.id,
          data: formData,
        }).unwrap();
      } else {
        // Create new brand
        const formData = new FormData();
        formData.append('name', name.trim());
        if (image instanceof File) {
          formData.append('image', image);
        }

        result = await createBrand(formData).unwrap();
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      // Close dialog
      onClose();
    } catch (err: any) {
      // Handle validation errors from API
      if (err?.error?.data?.errors) {
        setErrors(err.error.data.errors);
      } else {
        const errorMessage =
          err?.error?.data?.message || 'Failed to save brand';
        setErrors({ general: errorMessage });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the brand information below.'
              : 'Create a new brand to use in your products.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">
              Brand Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter brand name"
              maxLength={255}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() && !isLoading) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className={errors.name ? 'border-red-500' : ''}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <ImagePicker
              label="Brand Image"
              description="Upload a brand logo or image (optional)"
              value={image}
              onChange={setImage}
              error={errors.image}
            />
          </div>

          {errors.general && (
            <p className="text-sm text-red-500">{errors.general}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
          >
            {isLoading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
                ? 'Update Brand'
                : 'Create Brand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

