/**
 * Centralized Email Templates Generator for WellMeds
 * Produces responsive, dark-mode friendly, brand-consistent HTML emails.
 */

const getBrandStyles = () => `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f7f6;
      margin: 0;
      padding: 0;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f7f6;
      padding: 30px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0A2E27 0%, #038076 100%);
      padding: 32px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #FAF6EC;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .logo-dot {
      color: #14A088;
    }
    .tagline {
      color: rgba(250, 246, 236, 0.7);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 6px;
    }
    .content {
      padding: 35px 30px;
    }
    .h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 20px;
    }
    .highlight-box {
      background-color: #f0fdfa;
      border-left: 4px solid #038076;
      padding: 16px 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background-color: #038076;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(3, 128, 118, 0.25);
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table th {
      background-color: #f8fafc;
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 14px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }
    .table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
      color: #334155;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success { background-color: #dcfce7; color: #15803d; }
    .badge-pending { background-color: #fef9c3; color: #a16207; }
    .badge-danger { background-color: #fee2e2; color: #b91c1c; }
    .footer {
      background-color: #f8fafc;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer a {
      color: #038076;
      text-decoration: none;
    }
  </style>
`;

export const wrapBaseTemplate = ({ title, bodyContent }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${getBrandStyles()}
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo">wellmeds<span class="logo-dot">.</span></div>
        <div class="tagline">Super Speciality Pharmacy & Healthcare</div>
      </div>

      <!-- Main Content -->
      <div class="content">
        ${bodyContent}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>WellMeds Healthcare Hub</strong></p>
        <p>Toll-Free Helpline: +91 74209 09445 | Email: <a href="mailto:support@wellmeds.in">support@wellmeds.in</a></p>
        <p>Website: <a href="https://wellmeds.in" target="_blank">www.wellmeds.in</a></p>
        <hr style="border:0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p>© ${new Date().getFullYear()} WellMeds. All rights reserved.<br />This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ─── 1. Waitlist Confirmation Template ───────────────────────────────────────
export const renderWaitlistConfirmation = () => {
  const bodyContent = `
    <h1 class="h1">You're on the WellMeds Waitlist! 🎉</h1>
    <p class="text">Thank you for signing up to get early access to WellMeds.</p>
    <p class="text">We are building India's premier super speciality pharmacy & clinical healthcare platform. We'll send you an exclusive invite as soon as we soft-launch!</p>
    
    <div class="highlight-box">
      <p style="margin:0; font-weight:600; color:#038076;">What to expect at launch:</p>
      <ul style="margin: 10px 0 0 20px; padding:0; color:#334155; font-size:14px; line-height:1.6;">
        <li>Cold-chain delivered super speciality medicines</li>
        <li>Instant licensed pharmacist prescription verification</li>
        <li>Patient Assistance Program (PAP) guidance</li>
        <li>Genuine oncology, cardiology, & specialty care supplies</li>
      </ul>
    </div>

    <p class="text">Stay tuned for exciting updates!</p>
  `;
  return wrapBaseTemplate({ title: "You're on the WellMeds Waitlist 🎉", bodyContent });
};

// ─── 2. Welcome Email Template ───────────────────────────────────────────────
export const renderWelcomeEmail = ({ name }) => {
  const bodyContent = `
    <h1 class="h1">Welcome to WellMeds, ${name}! 👋</h1>
    <p class="text">Your official WellMeds patient account has been activated successfully.</p>
    <p class="text">You can now easily upload doctor prescriptions, browse genuine super speciality medications, track active orders, and consult with clinical pharmacists online.</p>
    
    <div style="text-align: center;">
      <a href="https://wellmeds.in" class="btn">Explore WellMeds Store</a>
    </div>
  `;
  return wrapBaseTemplate({ title: "Welcome to WellMeds!", bodyContent });
};

// ─── 3. Prescription Received (Customer) ─────────────────────────────────────
export const renderPrescriptionReceivedCustomer = ({ customerName, rxId, rxFileName }) => {
  const bodyContent = `
    <h1 class="h1">Prescription Uploaded Successfully 📄</h1>
    <p class="text">Dear ${customerName},</p>
    <p class="text">We have received your prescription document (<strong>${rxFileName}</strong>). It has been assigned reference ID: <strong style="color:#038076;">${rxId}</strong>.</p>
    
    <div class="highlight-box">
      <p style="margin:0; font-weight:600; color:#038076;">Pharmacist Verification Process:</p>
      <p style="margin:6px 0 0 0; font-size:14px; color:#475569;">Our licensed clinical pharmacists are reviewing your prescription. Verification is typically completed within <strong>15–30 minutes</strong> during operating hours.</p>
    </div>

    <p class="text">You will receive an email and SMS notification as soon as verification is complete.</p>
    
    <div style="text-align: center;">
      <a href="https://wellmeds.in/profile" class="btn">Track Prescription Status</a>
    </div>
  `;
  return wrapBaseTemplate({ title: `Prescription Received — ${rxId}`, bodyContent });
};

// ─── 4. Prescription Uploaded (Admin Alert) ──────────────────────────────────
export const renderPrescriptionReceivedAdmin = ({ customerName, rxId, rxFileName }) => {
  const bodyContent = `
    <h1 class="h1" style="color:#0A2E27;">New Prescription Uploaded 🚨</h1>
    <p class="text">A new prescription document requires pharmacist review.</p>
    
    <table class="table">
      <tr><th>Customer</th><td>${customerName}</td></tr>
      <tr><th>Rx Ref ID</th><td><strong>${rxId}</strong></td></tr>
      <tr><th>File Name</th><td>${rxFileName}</td></tr>
      <tr><th>Status</th><td><span class="badge badge-pending">Pending Verification</span></td></tr>
    </table>

    <div style="text-align: center;">
      <a href="https://wellmeds.in/admin/prescriptions" class="btn">Open Admin Prescription Queue</a>
    </div>
  `;
  return wrapBaseTemplate({ title: `[Admin Alert] New Rx Upload: ${rxId}`, bodyContent });
};

// ─── 5. Prescription Approved (Customer) ─────────────────────────────────────
export const renderPrescriptionApproved = ({ customerName, rxId, prescribedItems, adminNotes }) => {
  let itemsHtml = "";
  if (prescribedItems && prescribedItems.length > 0) {
    itemsHtml = `
      <table class="table">
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Quantity</th>
            <th>Approved Price</th>
          </tr>
        </thead>
        <tbody>
          ${prescribedItems.map(item => `
            <tr>
              <td><strong>${item.name || item.product?.name || "Medicine"}</strong></td>
              <td>${item.quantity || 1}</td>
              <td>₹${item.price || 0}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  const bodyContent = `
    <h1 class="h1" style="color:#15803d;">Prescription Verification Approved ✅</h1>
    <p class="text">Dear ${customerName},</p>
    <p class="text">Great news! Your prescription (ID: <strong>${rxId}</strong>) has been verified and approved by our licensed pharmacist.</p>

    ${adminNotes ? `<div class="highlight-box"><p style="margin:0; font-weight:600; color:#038076;">Pharmacist Notes:</p><p style="margin:4px 0 0 0; font-size:14px;">${adminNotes}</p></div>` : ""}

    ${itemsHtml}

    <p class="text">Your approved items are ready in your cart. Proceed to checkout to place your order.</p>

    <div style="text-align: center;">
      <a href="https://wellmeds.in/cart" class="btn">Complete Checkout Now</a>
    </div>
  `;
  return wrapBaseTemplate({ title: `Prescription Approved — ${rxId}`, bodyContent });
};

// ─── 6. Prescription Rejected (Customer) ─────────────────────────────────────
export const renderPrescriptionRejected = ({ customerName, rxId, adminNotes }) => {
  const bodyContent = `
    <h1 class="h1" style="color:#b91c1c;">Prescription Verification Notice ⚠️</h1>
    <p class="text">Dear ${customerName},</p>
    <p class="text">Our pharmacists reviewed your uploaded prescription (ID: <strong>${rxId}</strong>) but require further clarification before approving the order.</p>

    <div class="highlight-box" style="background-color:#fff1f2; border-left-color:#f43f5e;">
      <p style="margin:0; font-weight:600; color:#9f1239;">Reason / Pharmacist Notes:</p>
      <p style="margin:6px 0 0 0; font-size:14px; color:#475569;">${adminNotes || "The prescription document uploaded was unclear, expired, or missing doctor credentials."}</p>
    </div>

    <p class="text">Please re-upload a clear prescription sheet with valid doctor stamp and signature.</p>

    <div style="text-align: center;">
      <a href="https://wellmeds.in/upload-prescription" class="btn" style="background-color:#e11d48;">Re-upload Prescription</a>
    </div>
  `;
  return wrapBaseTemplate({ title: `Prescription Requires Attention — ${rxId}`, bodyContent });
};

// ─── 7. Order Confirmation Template ─────────────────────────────────────────
const fmtMoney = (val) => {
  const num = Number(val);
  if (isNaN(num)) return "0.00";
  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
};

export const renderOrderConfirmation = ({ order }) => {
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">₹${fmtMoney(item.price)}</td>
      <td style="text-align:right; font-weight:600;">₹${fmtMoney(item.quantity * item.price)}</td>
    </tr>
  `).join("");

  const bodyContent = `
    <h1 class="h1" style="color:#038076;">Order Confirmed! 🎉</h1>
    <p class="text">Dear ${order.customer},</p>
    <p class="text">Thank you for your order. We are preparing your medications for dispatch under strict clinical quality controls.</p>

    <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin:20px 0;">
      <p style="margin:0 0 6px 0; font-size:14px; color:#64748b;">Order Number: <strong style="color:#0f172a;">${order.orderId}</strong></p>
      <p style="margin:0 0 6px 0; font-size:14px; color:#64748b;">Payment Method: <strong style="color:#0f172a; text-transform:uppercase;">${order.paymentMethod}</strong></p>
      <p style="margin:0; font-size:14px; color:#64748b;">Shipping Address: <strong style="color:#0f172a;">${order.shippingAddress}</strong></p>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table style="width:100%; margin-top:15px; font-size:14px; line-height:1.8;">
      <tr><td style="color:#64748b;">Subtotal</td><td style="text-align:right;">₹${fmtMoney(order.subtotal)}</td></tr>
      ${order.discountAmount ? `<tr><td style="color:#16a34a;">Discount</td><td style="text-align:right; color:#16a34a;">-₹${fmtMoney(order.discountAmount)}</td></tr>` : ""}
      <tr><td style="color:#64748b;">Shipping Fee</td><td style="text-align:right;">₹${fmtMoney(order.shipping)}</td></tr>
      <tr><td style="color:#64748b;">Estimated GST (12%)</td><td style="text-align:right;">₹${fmtMoney(order.tax)}</td></tr>
      <tr style="font-size:16px; font-weight:700; border-top:2px solid #e2e8f0;"><td style="padding-top:8px;">Final Amount Paid</td><td style="text-align:right; padding-top:8px; color:#038076;">₹${fmtMoney(order.finalAmount || order.total)}</td></tr>
    </table>

    <div style="text-align: center; margin-top:30px;">
      <a href="https://wellmeds.in/orders" class="btn">Track Order Progress</a>
    </div>
  `;
  return wrapBaseTemplate({ title: `Order Confirmation — ${order.orderId}`, bodyContent });
};

// ─── 8. Order Status Update ──────────────────────────────────────────────────
export const renderOrderStatusUpdate = ({ order, status }) => {
  const bodyContent = `
    <h1 class="h1">Order Status Update 🚚</h1>
    <p class="text">Dear ${order.customer},</p>
    <p class="text">The status of your order <strong style="color:#038076;">${order.orderId}</strong> has been updated to: <span class="badge badge-success">${status}</span>.</p>

    <div class="highlight-box">
      <p style="margin:0; font-weight:600; color:#038076;">Latest Timeline Event:</p>
      <p style="margin:4px 0 0 0; font-size:14px; color:#475569;">Your package is moving smoothly through our healthcare delivery logistics partner network.</p>
    </div>

    <div style="text-align: center;">
      <a href="https://wellmeds.in/orders" class="btn">View Live Order Tracking</a>
    </div>
  `;
  return wrapBaseTemplate({ title: `Order ${order.orderId} Status: ${status}`, bodyContent });
};

// ─── 9. Order Cancelled ──────────────────────────────────────────────────────
export const renderOrderCancelled = ({ order }) => {
  const bodyContent = `
    <h1 class="h1" style="color:#b91c1c;">Order Cancelled Notice</h1>
    <p class="text">Dear ${order.customer},</p>
    <p class="text">Your order <strong>${order.orderId}</strong> has been cancelled as requested.</p>

    ${order.paymentStatus === "Paid" || order.paymentStatus === "Refunded" ? `
      <div class="highlight-box" style="background-color:#eff6ff; border-left-color:#3b82f6;">
        <p style="margin:0; font-weight:600; color:#1d4ed8;">Refund Status:</p>
        <p style="margin:4px 0 0 0; font-size:14px;">Your payment of <strong>₹${order.finalAmount || order.total}</strong> has been queued for full refund to your original payment method within 3–5 business days.</p>
      </div>
    ` : ""}

    <p class="text">If you have any questions, please contact our support team.</p>
  `;
  return wrapBaseTemplate({ title: `Order Cancelled — ${order.orderId}`, bodyContent });
};

// ─── 10. Contact Acknowledgement (Customer) ──────────────────────────────────
export const renderContactAcknowledgementCustomer = ({ name }) => {
  const bodyContent = `
    <h1 class="h1">Thank You for Reaching Out! 📩</h1>
    <p class="text">Dear ${name},</p>
    <p class="text">We have received your enquiry. Our clinical support team will review your message and reach out to you within 15–30 minutes.</p>

    <div class="highlight-box">
      <p style="margin:0; font-weight:600; color:#038076;">Urgent Medical Queries?</p>
      <p style="margin:4px 0 0 0; font-size:14px;">If you require immediate assistance regarding an active prescription or medicine delivery, please call our 24/7 Helpline at <strong>+91 74209 09445</strong>.</p>
    </div>
  `;
  return wrapBaseTemplate({ title: "We received your enquiry — WellMeds", bodyContent });
};

// ─── 11. Contact Notification (Admin) ────────────────────────────────────────
export const renderContactNotificationAdmin = ({ name, email, subject, message }) => {
  const bodyContent = `
    <h1 class="h1" style="color:#0A2E27;">New Contact Form Submission 📬</h1>
    
    <table class="table">
      <tr><th>Customer Name</th><td>${name}</td></tr>
      <tr><th>Email Address</th><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><th>Subject</th><td>${subject || "General Support"}</td></tr>
      <tr><th>Received At</th><td>${new Date().toLocaleString()}</td></tr>
    </table>

    <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin:20px 0;">
      <p style="margin:0 0 6px 0; font-weight:600; color:#64748b; font-size:12px;">MESSAGE CONTENT:</p>
      <p style="margin:0; font-size:14px; color:#1e293b; white-space:pre-wrap;">${message}</p>
    </div>
  `;
  return wrapBaseTemplate({ title: `[Admin Alert] New Enquiry from ${name}`, bodyContent });
};

// ─── 12. Marketing / Custom Campaign Template ─────────────────────────────────
export const renderMarketingCampaign = ({ subject, title, bodyHtml, ctaText, ctaUrl }) => {
  const bodyContent = `
    <h1 class="h1">${title || subject}</h1>
    <div style="font-size:15px; line-height:1.6; color:#475569;">
      ${bodyHtml}
    </div>

    ${ctaText && ctaUrl ? `
      <div style="text-align: center; margin-top:30px;">
        <a href="${ctaUrl}" class="btn">${ctaText}</a>
      </div>
    ` : ""}
  `;
  return wrapBaseTemplate({ title: subject, bodyContent });
};
