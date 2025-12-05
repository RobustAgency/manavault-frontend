'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Supplier, CreateSupplierData, SupplierStatus } from '@/lib/redux/features';
import { useSupplierForm } from './useSupplierForm';

interface SupplierFormDialogProps {
  isOpen: boolean;
  isEditMode: boolean;
  selectedSupplier: Supplier | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplierData) => void;
}

export const SupplierFormDialog = ({
  isOpen,
  isEditMode,
  selectedSupplier,
  isSubmitting,
  onClose,
  onSubmit,
}: SupplierFormDialogProps) => {
  const { formData, errors, validateForm, resetForm, updateFormData } = useSupplierForm();

  // Initialize form when editing
  useEffect(() => {
    if (isEditMode && selectedSupplier) {
      updateFormData({
        name: selectedSupplier.name,
        contact_email: selectedSupplier.contact_email || '',
        contact_phone: selectedSupplier.contact_phone || '',
        status: selectedSupplier.status,
      });
    } else {
      resetForm();
    }
  }, [isEditMode, selectedSupplier, isOpen]);

  const handleSubmit = () => {
    if (validateForm()) {
      const trimmedName = formData.name.trim();
      const trimmedEmail = formData.contact_email.trim();
      const trimmedPhone = formData.contact_phone.trim();

      const payload: CreateSupplierData = {
        name: trimmedName,
        status: formData.status as SupplierStatus,
      };

      if (trimmedEmail) {
        payload.contact_email = trimmedEmail;
      }

      if (trimmedPhone) {
        payload.contact_phone = trimmedPhone;
      }

      onSubmit(payload);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Supplier' : 'Create Supplier'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update supplier information' : 'Add a new supplier to your system'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Supplier Name"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
                  

          <div className="grid gap-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => updateFormData({ contact_email: e.target.value })}
              placeholder="supplier@example.com"
            />
            {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => updateFormData({ contact_phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status || undefined}
              onValueChange={(value: SupplierStatus) => updateFormData({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

