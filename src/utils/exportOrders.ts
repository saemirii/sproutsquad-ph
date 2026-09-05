import { Order } from '../types';

// Escapes a value for a CSV cell: wraps in quotes and doubles any embedded
// quotes if it contains a comma, quote, or newline.
const csvCell = (value: string | number): string => {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const ORDER_EXPORT_HEADERS = [
  'Order Number',
  'Date',
  'Status',
  'Customer Name',
  'Customer Contact',
  'Customer University',
  'Items',
  'Subtotal (PHP)',
  'Coupon Code',
  'Discount (PHP)',
  'Total Amount (PHP)',
  'Payment Method',
  'Payment Status',
  'Fulfillment Type',
  'Delivery Method',
  'Delivery Date',
  'Meetup Location',
  'Notes',
];

const orderToRow = (order: Order): (string | number)[] => {
  const discount = order.discountAmount || 0;
  const subtotal = order.totalAmount + discount;
  const itemsSummary = order.items.map((item) => `${item.quantity}x ${item.productName}`).join('; ');

  return [
    order.orderNumber,
    new Date(order.createdAt).toLocaleString(),
    order.orderStatus,
    order.customerName,
    order.customerContact,
    order.customerUniversity,
    itemsSummary,
    subtotal,
    order.couponCode || '',
    discount,
    order.totalAmount,
    order.paymentMethod,
    order.paymentStatus,
    order.fulfillmentType,
    order.deliveryMethod || '',
    order.deliveryDate || '',
    order.meetupLocation,
    order.notes || '',
  ];
};

/** Builds a CSV string from orders — exported for testing without touching the DOM. */
export const buildOrdersCsv = (orders: Order[]): string => {
  const rows = [ORDER_EXPORT_HEADERS, ...orders.map(orderToRow)];
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
};

/** Triggers a browser download of the given orders as a CSV file. */
export const exportOrdersToCsv = (orders: Order[], businessName: string): void => {
  const csv = buildOrdersCsv(orders);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const safeName = businessName.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'shop';

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}-orders-${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
