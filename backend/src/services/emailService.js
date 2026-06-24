import { sendEmail } from "../config/email.js";

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
      <h2 style="color: #4f2d8c; font-size: 24px; font-weight: bold;">Welcome to MediShop, ${name}!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Your clinical and medical shopping account has been successfully created.</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">You can now log in, upload doctor prescriptions, and buy vitamins, supplements, and prescription medications online.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #a0aec0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: "Welcome to MediShop!", html });
};

export const sendOrderStatusEmail = async (email, customerName, orderId, status) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
      <h2 style="color: #4f2d8c; font-size: 20px; font-weight: bold;">Order Status Updated</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Dear ${customerName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">The status of your order <strong>${orderId}</strong> has been updated to: <span style="color: #038076; font-weight: bold;">${status}</span>.</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">You can track your order details anytime inside your patient portal profile history.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #a0aec0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: `MediShop Order ${orderId} Status Update: ${status}`, html });
};

export const sendPrescriptionReviewEmail = async (email, customerName, rxFileName, status, notes) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
      <h2 style="color: #4f2d8c; font-size: 20px; font-weight: bold;">Prescription Verification Log Update</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Dear ${customerName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Your uploaded prescription document <strong>${rxFileName}</strong> has been reviewed by our pharmacists and marked as: <span style="font-weight: bold;">${status}</span>.</p>
      ${notes ? `<p style="font-size: 16px; line-height: 1.6; color: #4a5568;"><strong>Pharmacist Notes:</strong> ${notes}</p>` : ""}
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #a0aec0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: `MediShop Prescription Verification Status: ${status}`, html });
};
