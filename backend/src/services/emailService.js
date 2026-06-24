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

export const sendVerificationEmail = async (email, name, token) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #038076; font-size: 22px; font-weight: bold;">Verify Your WellMeds Email Address</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Dear ${name},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Thank you for registering with WellMeds. Please click the button below to verify your email address and activate your patient account:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${verificationLink}" style="display: inline-block; background-color: #038076; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 5px;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #718096;">
        Or copy and paste this link into your browser:<br />
        <a href="${verificationLink}" style="color: #038076; word-break: break-all;">${verificationLink}</a>
      </p>
      <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">This link is valid for 24 hours. If you did not register for this account, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #a0aec0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: "Verify Your WellMeds Email Address", html });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #038076; font-size: 22px; font-weight: bold;">Reset Your WellMeds Password</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">Dear ${name},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">You are receiving this email because a request was made to reset the password for your WellMeds account. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: #038076; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 5px;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #718096;">
        Or copy and paste this link into your browser:<br />
        <a href="${resetLink}" style="color: #038076; word-break: break-all;">${resetLink}</a>
      </p>
      <p style="font-size: 12px; color: #a0aec0; margin-top: 20px;">This link is valid for 1 hour. If you did not initiate this request, your password will remain unchanged.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #a0aec0; text-align: center;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject: "Reset Your WellMeds Password", html });
};
