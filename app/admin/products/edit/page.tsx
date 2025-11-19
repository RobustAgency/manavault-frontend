'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProductRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products list since edit is handled via /admin/products/[id]
    router.replace('/admin/products');
  }, [router]);

  return null;
}
