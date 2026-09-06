import { Product } from '../types';

// Escapes a value for a CSV cell: wraps in quotes and doubles any embedded
// quotes if it contains a comma, quote, or newline.
const csvCell = (value: string | number): string => {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const INVENTORY_EXPORT_HEADERS = [
  'Product Name',
  'Category',
  'Unit',
  'Selling Price (PHP)',
  'COGS / Unit (PHP)',
  'Inventory Count',
  'Units Sold',
  'Status',
];

const productToRow = (p: Product): (string | number)[] => [
  p.name,
  p.category,
  p.unit,
  p.price,
  p.costPrice,
  p.inventoryCount,
  p.soldCount,
  !p.isAvailable ? 'Unavailable' : p.inventoryCount === 0 ? 'Out of Stock' : p.inventoryCount <= 6 ? 'Low Stock' : 'In Stock',
];

/** Builds a CSV string from a shop's products — exported for testing without touching the DOM. */
export const buildInventoryCsv = (products: Product[]): string => {
  const rows = [INVENTORY_EXPORT_HEADERS, ...products.map(productToRow)];
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
};

/**
 * Triggers a browser download of a shop's inventory as a CSV file, formatted
 * to drop straight into Google Sheets (File > Import > Upload) or any other
 * spreadsheet app — a one-way export snapshot, not a live two-way sync
 * (that would require the seller to connect a real Google account via OAuth).
 */
export const exportInventoryToCsv = (products: Product[], businessName: string): void => {
  const csv = buildInventoryCsv(products);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const safeName = businessName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'shop';

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}-inventory-${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
