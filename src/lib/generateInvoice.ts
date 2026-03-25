/**
 * Premium Invoice Generator - Professional colored header design
 * Supports Bengali text via HTML rendering
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
  const itemRows = data.items.map((item, idx) => `
    <tr style="${idx % 2 === 0 ? 'background:#f9fafb;' : 'background:#fff;'}">
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#1f2937;">${idx + 1}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#1f2937;font-weight:500;">
        ${item.name}${item.variant ? ` <span style="color:#6b7280;font-weight:400;">(${item.variant})</span>` : ''}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;color:#374151;">৳${item.unitPrice.toLocaleString()}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;color:#374151;">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;color:#1f2937;">৳${item.total.toLocaleString()}</td>
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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans Bengali',sans-serif; background:#e8ecf1; color:#333; }
  @page { size:A4; margin:0; }
  @media print {
    body { background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .no-print { display:none !important; }
    .invoice-wrapper { box-shadow:none; margin:0; }
  }
  .invoice-wrapper { max-width:800px; margin:30px auto; background:#fff; box-shadow:0 8px 40px rgba(0,0,0,0.12); overflow:hidden; }
  
  /* Header */
  .inv-header { background:linear-gradient(135deg, #0f4c3a 0%, #1a7a5c 50%, #0f4c3a 100%); padding:28px 40px; display:flex; justify-content:space-between; align-items:center; }
  .inv-header .brand { display:flex; align-items:center; gap:14px; }
  .inv-header .brand-icon { width:48px; height:48px; background:rgba(255,255,255,0.15); border-radius:12px; display:flex; align-items:center; justify-content:center; }
  .inv-header .brand-icon svg { width:28px; height:28px; fill:#fff; }
  .inv-header .brand-text h1 { font-size:20px; font-weight:700; color:#fff; letter-spacing:-0.3px; }
  .inv-header .brand-text p { font-size:11px; color:rgba(255,255,255,0.75); margin-top:2px; }
  .inv-header .inv-title { text-align:right; }
  .inv-header .inv-title h2 { font-size:32px; font-weight:800; color:#fff; letter-spacing:3px; text-transform:uppercase; }
  
  /* Info Section */
  .inv-info { padding:28px 40px; display:flex; justify-content:space-between; gap:30px; border-bottom:1px solid #e5e7eb; }
  .inv-info-left { flex:1; }
  .inv-info-right { text-align:right; }
  .inv-info-label { font-size:11px; text-transform:uppercase; letter-spacing:1.2px; color:#9ca3af; font-weight:600; margin-bottom:6px; }
  .inv-info h3 { font-size:15px; font-weight:700; color:#1f2937; margin-bottom:3px; }
  .inv-info p { font-size:13px; color:#4b5563; line-height:1.7; }
  .inv-info .inv-number { font-size:14px; font-weight:700; color:#0f4c3a; }
  .inv-info .inv-date { font-size:13px; color:#6b7280; margin-top:2px; }
  
  /* Payment & Status */
  .inv-meta { padding:16px 40px; display:flex; gap:20px; align-items:center; background:#f0fdf4; border-bottom:1px solid #e5e7eb; }
  .meta-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600; }
  .meta-chip.payment { background:#0f4c3a; color:#fff; }
  .meta-chip.status { background:#fef3c7; color:#92400e; }
  
  /* Table */
  .inv-table-wrap { padding:0 40px 20px; }
  table.inv-items { width:100%; border-collapse:collapse; margin-top:20px; }
  table.inv-items thead th { background:#0f4c3a; color:#fff; padding:11px 16px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; }
  table.inv-items thead th:first-child { border-radius:8px 0 0 0; }
  table.inv-items thead th:last-child { border-radius:0 8px 0 0; }
  
  /* Totals */
  .inv-totals { padding:0 40px 28px; display:flex; justify-content:flex-end; }
  .inv-totals-box { width:300px; }
  .inv-totals-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; color:#4b5563; }
  .inv-totals-row.grand { border-top:2px solid #0f4c3a; margin-top:10px; padding-top:12px; font-size:18px; font-weight:800; color:#0f4c3a; }
  .inv-totals-row.due { color:#dc2626; font-weight:700; }
  .inv-totals-row.paid { color:#059669; font-weight:600; }
  
  /* Footer */
  .inv-footer { background:linear-gradient(135deg, #0f4c3a 0%, #1a7a5c 100%); padding:20px 40px; text-align:center; }
  .inv-footer p { color:rgba(255,255,255,0.85); font-size:12px; }
  .inv-footer .thanks { font-size:15px; font-weight:700; color:#fff; margin-bottom:4px; }
  
  /* Bottom shape */
  .inv-shape { height:8px; background:linear-gradient(90deg, #0f4c3a, #2dd4a8, #0f4c3a); }
  
  .print-btn { position:fixed; bottom:30px; right:30px; background:linear-gradient(135deg, #0f4c3a, #1a7a5c); color:#fff; border:none; padding:16px 32px; border-radius:12px; font-size:15px; cursor:pointer; font-family:'Noto Sans Bengali',sans-serif; font-weight:700; box-shadow:0 6px 24px rgba(15,76,58,0.35); transition:all 0.2s; }
  .print-btn:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(15,76,58,0.45); }
</style>
</head>
<body>
<div class="invoice-wrapper">
  <div class="inv-header">
    <div class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>
      </div>
      <div class="brand-text">
        <h1>${data.storeName}</h1>
        ${data.storeAddress ? `<p>${data.storeAddress}</p>` : ''}
      </div>
    </div>
    <div class="inv-title">
      <h2>INVOICE</h2>
    </div>
  </div>

  <div class="inv-info">
    <div class="inv-info-left">
      <div class="inv-info-label">ইনভয়েস প্রাপক</div>
      <h3>${data.customerName}</h3>
      <p>${data.customerPhone}</p>
      ${data.customerEmail ? `<p>${data.customerEmail}</p>` : ''}
      <p style="margin-top:6px;">${data.address}<br/>${data.district}</p>
    </div>
    <div class="inv-info-right">
      <div class="inv-info-label">ইনভয়েস নম্বর</div>
      <p class="inv-number">${data.orderNumber}</p>
      <div class="inv-info-label" style="margin-top:14px;">তারিখ</div>
      <p class="inv-date">${data.date}</p>
    </div>
  </div>

  <div class="inv-meta">
    <span class="meta-chip payment">💳 ${paymentLabel}</span>
    ${statusLabel ? `<span class="meta-chip status">📋 ${statusLabel}</span>` : ''}
  </div>

  <div class="inv-table-wrap">
    <table class="inv-items">
      <thead>
        <tr>
          <th style="text-align:left;width:40px;">ক্র.</th>
          <th style="text-align:left;">পণ্যের বিবরণ</th>
          <th style="text-align:center;">মূল্য</th>
          <th style="text-align:center;width:60px;">পরিমাণ</th>
          <th style="text-align:right;">মোট</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <div class="inv-totals">
    <div class="inv-totals-box">
      <div class="inv-totals-row"><span>সাবটোটাল</span><span>৳${data.subtotal.toLocaleString()}</span></div>
      <div class="inv-totals-row"><span>ডেলিভারি চার্জ</span><span>৳${data.deliveryCharge.toLocaleString()}</span></div>
      ${data.discount && data.discount > 0 ? `<div class="inv-totals-row"><span>ডিসকাউন্ট</span><span style="color:#dc2626;">-৳${data.discount.toLocaleString()}</span></div>` : ''}
      <div class="inv-totals-row grand"><span>সর্বমোট</span><span>৳${data.total.toLocaleString()}</span></div>
      ${data.advancePaid !== undefined && data.advancePaid > 0 ? `<div class="inv-totals-row paid"><span>অগ্রিম পরিশোধ</span><span>৳${data.advancePaid.toLocaleString()}</span></div>` : ''}
      ${data.due !== undefined && data.due > 0 ? `<div class="inv-totals-row due"><span>বাকি</span><span>৳${data.due.toLocaleString()}</span></div>` : ''}
    </div>
  </div>

  <div class="inv-footer">
    <p class="thanks">অর্ডার করার জন্য ধন্যবাদ! 🎉</p>
    <p>${data.storeName} — সেরা পণ্য, সেরা দামে</p>
  </div>
  <div class="inv-shape"></div>
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
