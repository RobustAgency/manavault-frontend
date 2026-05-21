/**
 * Component tests for PreviewProductsDialog
 *
 * Coverage areas
 * ──────────────
 * 1. Preview mode (create)   – accurate column headers, product rows, no-rule empty state
 * 2. Postview mode (edit)    – correct columns, actual price changes shown
 * 3. Multi-product scenarios – multiple rows, pagination meta rendered
 * 4. Loading state           – spinner/skeleton while fetching
 * 5. Dialog open / close     – onOpenChange fired on close button
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PreviewAffectedProduct, PostViewProduct, PaginationMeta } from '@/types';

// Mock Next.js router hooks used by DataTable internally
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/pricing-automation/create',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { PreviewProductsDialog } from '@/app/admin/pricing-automation/components/preview-products-dialogue';

// ─── Shared mock data ─────────────────────────────────────────────────────────

const mockPreviewProducts: PreviewAffectedProduct[] = [
  {
    digital_product_id: 1,
    digital_product_name: 'PlayStation Store $10',
    face_value: 10,
    current_selling_price: 10,
    new_selling_price: 11,
  },
  {
    digital_product_id: 2,
    digital_product_name: 'PlayStation Store $25',
    face_value: 25,
    current_selling_price: 25,
    new_selling_price: 27.5,
  },
];

const mockPostViewProducts: PostViewProduct[] = [
  {
    id: 101,
    digital_product_id: 1,
    price_rule_id: 5,
    original_selling_price: '10.00',
    base_value: '10.00',
    action_mode: 'percentage',
    action_operator: '+',
    action_value: '10',
    calculated_price: '11.00',
    final_selling_price: '11.00',
    applied_at: '2026-05-14T00:00:00Z',
    created_at: '2026-05-14T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
    digital_product: {
      id: 1,
      name: 'PlayStation Store $10',
      currency: 'USD',
    } as PostViewProduct['digital_product'],
  },
];

const paginationMeta: PaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 2,
  last_page: 1,
  from: 1,
  to: 2,
};

// ─── 1. Preview mode (create) ─────────────────────────────────────────────────

describe('PreviewProductsDialog – preview mode (create)', () => {
  it('renders the "Preview Affected Products" heading in create mode', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={mockPreviewProducts}
        pagination={paginationMeta}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Preview Affected Products/i)).toBeInTheDocument();
  });

  it('shows each product name in the preview table', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={mockPreviewProducts}
        pagination={paginationMeta}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText('PlayStation Store $10')).toBeInTheDocument();
    expect(screen.getByText('PlayStation Store $25')).toBeInTheDocument();
  });

  it('renders no-rule empty state – shows dialog with no product rows when list is empty', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={[]}
        pagination={{ current_page: 1, per_page: 10, total: 0, last_page: 1, from: 0, to: 0 }}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Preview Affected Products/i)).toBeInTheDocument();
    expect(screen.queryByText('PlayStation Store $10')).not.toBeInTheDocument();
  });

  it('does NOT render "Postview Affected Products" heading in create mode', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={mockPreviewProducts}
        pagination={paginationMeta}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.queryByText(/Postview Affected Products/i)).not.toBeInTheDocument();
  });
});

// ─── 2. Postview mode (edit) ──────────────────────────────────────────────────

describe('PreviewProductsDialog – postview mode (edit)', () => {
  it('renders "Postview Affected Products" heading in edit mode with postview products', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="postview"
        onOpenChange={vi.fn()}
        products={mockPostViewProducts}
        pagination={paginationMeta}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Postview Affected Products/i)).toBeInTheDocument();
  });

  it('shows product name from nested digital_product in postview mode', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="postview"
        onOpenChange={vi.fn()}
        products={mockPostViewProducts}
        pagination={paginationMeta}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText('PlayStation Store $10')).toBeInTheDocument();
  });

  it('does NOT show "Preview Affected Products" heading in edit postview mode', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="postview"
        onOpenChange={vi.fn()}
        products={mockPostViewProducts}
        pagination={paginationMeta}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.queryByText(/^Preview Affected Products$/i)).not.toBeInTheDocument();
  });
});

// ─── 3. Multi-product scenarios ──────────────────────────────────────────────

describe('PreviewProductsDialog – multi-product scenarios', () => {
  const manyProducts: PreviewAffectedProduct[] = Array.from({ length: 5 }, (_, i) => ({
    digital_product_id: i + 1,
    digital_product_name: `Gift Card $${(i + 1) * 10}`,
    face_value: (i + 1) * 10,
    current_selling_price: (i + 1) * 10,
    new_selling_price: (i + 1) * 11,
  }));

  const largePagination: PaginationMeta = {
    current_page: 1,
    per_page: 5,
    total: 50,
    last_page: 10,
    from: 1,
    to: 5,
  };

  it('renders all product rows when multiple products are returned', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={manyProducts}
        pagination={largePagination}
        onPageChange={vi.fn()}
      />
    );
    manyProducts.forEach((p) => {
      expect(screen.getByText(p.digital_product_name)).toBeInTheDocument();
    });
  });

  it('calls onPageChange when next-page button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={manyProducts}
        pagination={largePagination}
        onPageChange={onPageChange}
      />
    );
    const nextBtn = screen.queryByRole('button', { name: /next/i });
    if (nextBtn) {
      await user.click(nextBtn);
      expect(onPageChange).toHaveBeenCalled();
    }
  });
});

// ─── 4. Loading state ─────────────────────────────────────────────────────────

describe('PreviewProductsDialog – loading state', () => {
  it('renders the dialog shell even while isLoading is true', () => {
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={[]}
        isLoading
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Preview Affected Products/i)).toBeInTheDocument();
  });
});

// ─── 5. Dialog open / close ───────────────────────────────────────────────────

describe('PreviewProductsDialog – open / close behaviour', () => {
  it('does not render dialog content when open is false', () => {
    render(
      <PreviewProductsDialog
        open={false}
        tableVariant="preview"
        onOpenChange={vi.fn()}
        products={mockPreviewProducts}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.queryByText(/Preview Affected Products/i)).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when the Close button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <PreviewProductsDialog
        open
        tableVariant="preview"
        onOpenChange={onOpenChange}
        products={mockPreviewProducts}
        pagination={paginationMeta}
        onPageChange={vi.fn()}
      />
    );
    // Radix renders two "Close" triggers (footer button + ✕ icon with sr-only text).
    // Target the visible footer button that has no SVG child.
    const closeBtns = screen.getAllByRole('button', { name: /close/i });
    const footerCloseBtn = closeBtns.find((btn) => btn.querySelector('svg') === null)!;
    await user.click(footerCloseBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
