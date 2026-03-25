/**
 * Premium Invoice Generator using browser print
 * Supports Bengali text natively via HTML rendering
 */

interface InvoiceItem {
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  storeName: string;
  storeAddress?: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  district: string;
  address: string;
  paymentMethod: string;
  paymentStatus?: string;
  orderStatus?: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharge: number;
  discount?: number;
  total: number;
  advancePaid?: number;
  due?: number;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:13px;color:#333;">
        ${item.name}${item.variant ? ` <span style="color:#888;">(${item.variant})</span>` : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;font-size:13px;color:#555;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;color:#555;">৳${item.unitPrice}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600;color:#333;">৳${item.total}</td>
    </tr>
  `).join('');

  const paymentLabel = data.paymentMethod === 'COD' ? 'ক্যাশ অন ডেলিভারি' :
    data.paymentMethod === 'MOBILE_BANKING_BKASH' ? 'বিকাশ' :
    data.paymentMethod === 'MOBILE_BANKING_NAGAD' ? 'নগদ' :
    data.paymentMethod === 'MOBILE_BANKING' ? 'মোবাইল ব্যাংকিং' : data.paymentMethod;

  const statusLabel = data.orderStatus === 'Pending' ? 'পেন্ডিং' :
    data.orderStatus === 'Processing' ? 'প্রসেসিং' :
    data.orderStatus === 'Shipped' ? 'শিপড' :
    data.orderStatus === 'Delivered' ? 'ডেলিভারড' :
    data.orderStatus === 'Cancelled' ? 'বাতিল' : data.orderStatus || '';

  return `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<title>ইনভয়েস - ${data.orderNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans Bengali',sans-serif; background:#fff; color:#333; }
  @page { size:A4; margin:15mm; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .no-print { display:none !important; }
  }
  .invoice { max-width:800px; margin:0 auto; padding:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:24px; border-bottom:3px solid #1a1a2e; margin-bottom:24px; }
  .brand h1 { font-size:26px; font-weight:700; color:#1a1a2e; letter-spacing:-0.5px; }
  .brand p { font-size:12px; color:#666; margin-top:4px; }
  .invoice-label { text-align:right; }
  .invoice-label h2 { font-size:28px; font-weight:700; color:#1a1a2e; letter-spacing:2px; text-transform:uppercase; }
  .invoice-label p { font-size:12px; color:#888; margin-top:4px; }
  .meta { display:flex; gap:30px; margin-bottom:28px; }
  .meta-box { flex:1; background:#f8f9fb; border-radius:10px; padding:16px 20px; border-left:4px solid #1a1a2e; }
  .meta-box h3 { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:8px; font-weight:600; }
  .meta-box p { font-size:13px; color:#333; line-height:1.6; }
  .meta-box p strong { font-weight:600; }
  table.items { width:100%; border-collapse:collapse; margin-bottom:24px; }
  table.items thead th { background:#1a1a2e; color:#fff; padding:10px 12px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
  table.items thead th:first-child { border-radius:8px 0 0 0; text-align:left; }
  table.items thead th:last-child { border-radius:0 8px 0 0; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:30px; }
  .totals-box { width:280px; }
  .totals-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#555; }
  .totals-row.grand { border-top:2px solid #1a1a2e; margin-top:8px; padding-top:10px; font-size:16px; font-weight:700; color:#1a1a2e; }
  .footer { text-align:center; padding-top:20px; border-top:1px solid #eee; }
  .footer p { font-size:12px; color:#999; }
  .footer .thanks { font-size:14px; color:#1a1a2e; font-weight:600; margin-bottom:6px; }
  .status-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; background:#e8f5e9; color:#2e7d32; }
  .print-btn { position:fixed; bottom:30px; right:30px; background:#1a1a2e; color:#fff; border:none; padding:14px 28px; border-radius:10px; font-size:15px; cursor:pointer; font-family:'Noto Sans Bengali',sans-serif; font-weight:600; box-shadow:0 4px 20px rgba(0,0,0,0.2); }
  .print-btn:hover { background:#2a2a4e; }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="brand">
      <h1>${data.storeName}</h1>
      ${data.storeAddress ? `<p>${data.storeAddress}</p>` : ''}
    </div>
    <div class="invoice-label">
      <h2>ইনভয়েস</h2>
      <p>${data.orderNumber}</p>
      <p>${data.date}</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-box">
      <h3>কাস্টমার তথ্য</h3>
      <p><strong>${data.customerName}</strong></p>
      <p>${data.customerPhone}</p>
      ${data.customerEmail ? `<p>${data.customerEmail}</p>` : ''}
    </div>
    <div class="meta-box">
      <h3>ডেলিভারি ঠিকানা</h3>
      <p>${data.address}</p>
      <p>${data.district}</p>
    </div>
    <div class="meta-box">
      <h3>পেমেন্ট</h3>
      <p><strong>${paymentLabel}</strong></p>
      ${statusLabel ? `<p><span class="status-badge">${statusLabel}</span></p>` : ''}
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="text-align:left;">পণ্য</th>
        <th style="text-align:center;">পরিমাণ</th>
        <th style="text-align:right;">মূল্য</th>
        <th style="text-align:right;">মোট</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>সাবটোটাল</span><span>৳${data.subtotal}</span></div>
      <div class="totals-row"><span>ডেলিভারি চার্জ</span><span>৳${data.deliveryCharge}</span></div>
      ${data.discount && data.discount > 0 ? `<div class="totals-row"><span>ডিসকাউন্ট</span><span style="color:#e53935;">-৳${data.discount}</span></div>` : ''}
      <div class="totals-row grand"><span>সর্বমোট</span><span>৳${data.total}</span></div>
      ${data.advancePaid !== undefined && data.advancePaid > 0 ? `<div class="totals-row"><span>অগ্রিম পরিশোধ</span><span>৳${data.advancePaid}</span></div>` : ''}
      ${data.due !== undefined ? `<div class="totals-row" style="font-weight:600;color:#e53935;"><span>বাকি</span><span>৳${data.due}</span></div>` : ''}
    </div>
  </div>

  <div class="footer">
    <p class="thanks">অর্ডার করার জন্য ধন্যবাদ! 🎉</p>
    <p>${data.storeName} — সেরা পণ্য সেরা দামে</p>
  </div>
</div>
<button class="no-print print-btn" onclick="window.print()">🖨️ প্রিন্ট / ডাউনলোড</button>
</body>
</html>`;
}

export function openInvoice(data: InvoiceData) {
  const html = generateInvoiceHTML(data);
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
