import { jsPDF } from 'jspdf';
import { formatCurrency } from './formatCurrency';

const fmt = (amount) => formatCurrency(amount).replace('₦', 'NGN ');

const estimateHeight = (order) => {
  let h = 10 + 8 + 7 + 5; // header + divider
  h += 7 + 6 + 6 + 6;     // order #, date, table, customer
  if (order.customerPhone) h += 6;
  h += 6 + 6 + 6 + 6;     // items header + dividers
  order.items.forEach(item => {
    const nameLen = item.name.length;
    const lines = Math.ceil(nameLen / 26) || 1;
    h += lines * 6;
    if (item.specialInstructions) h += 5;
  });
  h += 5 + 8 + 5;  // divider + total + divider
  const cash = order.splitPayment?.cash || 0;
  const transfer = order.splitPayment?.transfer || 0;
  if (cash > 0 || transfer > 0) {
    h += 6 + 6;
    if (cash > 0) h += 6;
    if (transfer > 0) h += 6;
  }
  h += 13 + 8 + 10; // status badge + footer + bottom padding
  return h;
};

export const downloadReceipt = (order, restaurantName = 'Restaurant') => {
  const pageW = 100;
  const margin = 8;
  const contentW = pageW - margin * 2;
  const pageH = estimateHeight(order);

  const doc = new jsPDF({ unit: 'mm', format: [pageW, pageH], orientation: 'portrait' });

  let y = 10;

  const line = () => {
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  };

  const text = (str, x, align = 'left', size = 9, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(str, x, y, { align });
  };

  // Header
  text(restaurantName, pageW / 2, 'center', 14, true);
  y += 8;
  text('RECEIPT', pageW / 2, 'center', 11, true);
  y += 7;
  line();

  // Order info
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-NG')
    : new Date().toLocaleString('en-NG');

  text(`Order #: ${order.orderNumber}`, margin, 'left', 10, true);
  y += 7;
  text(`Date: ${date}`, margin, 'left', 9);
  y += 6;
  text(`Table: ${order.tableNumber}`, margin, 'left', 9);
  y += 6;
  text(`Customer: ${order.customerName}`, margin, 'left', 9);
  y += 6;
  if (order.customerPhone) {
    text(`Phone: ${order.customerPhone}`, margin, 'left', 9);
    y += 6;
  }
  line();

  // Items header
  text('Item', margin, 'left', 9, true);
  text('Qty', margin + contentW * 0.6, 'left', 9, true);
  text('Amount', pageW - margin, 'right', 9, true);
  y += 6;
  line();

  // Items
  order.items.forEach(item => {
    const nameLines = doc.splitTextToSize(item.name, contentW * 0.55);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(nameLines, margin, y);
    text(`x${item.quantity}`, margin + contentW * 0.6, 'left', 9);
    text(fmt(item.totalPrice), pageW - margin, 'right', 9);
    y += nameLines.length * 6;
    if (item.specialInstructions) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120);
      doc.text(`  Note: ${item.specialInstructions}`, margin, y);
      doc.setTextColor(0);
      y += 5;
    }
  });

  line();

  // Total
  text('TOTAL', margin, 'left', 11, true);
  text(fmt(order.totalAmount), pageW - margin, 'right', 11, true);
  y += 8;

  // Payment breakdown
  const cash = order.splitPayment?.cash || 0;
  const transfer = order.splitPayment?.transfer || 0;
  if (cash > 0 || transfer > 0) {
    line();
    text('Payment Breakdown', margin, 'left', 9, true);
    y += 6;
    if (cash > 0) {
      text('Cash:', margin, 'left', 9);
      text(fmt(cash), pageW - margin, 'right', 9);
      y += 6;
    }
    if (transfer > 0) {
      text('Card/Transfer:', margin, 'left', 9);
      text(fmt(transfer), pageW - margin, 'right', 9);
      y += 6;
    }
  }

  line();

  // Payment status badge
  const statusColors = { paid: [34, 197, 94], partial: [234, 179, 8], unpaid: [239, 68, 68] };
  const status = order.paymentStatus || 'unpaid';
  const [r, g, b] = statusColors[status] || statusColors.unpaid;
  doc.setFillColor(r, g, b);
  doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(status.toUpperCase(), pageW / 2, y + 6, { align: 'center' });
  doc.setTextColor(0);
  y += 13;

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for dining with us!', pageW / 2, y, { align: 'center' });

  doc.save(`receipt-${order.orderNumber}.pdf`);
};
