import dotenv from "dotenv";

dotenv.config();

export const sendVerificationEmail = async (toEmail, verificationCode) => {
  const emailData = {
    sender: {
      name: "SecureVote System",
      email: process.env.EMAIL_USER,
    },
    to: [
      {
        email: toEmail,
      },
    ],
    subject: "Verify Your SecureVote Account",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">SecureVote Registration</h2>
        <p>Hello,</p>
        <p>Thank you for registering on SecureVote. To complete your identity verification, please use the following OTP:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; letter-spacing: 2px;">
            ${verificationCode}
          </span>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 SecureVote Enterprise.</p>
      </div>
    `,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(JSON.stringify(errData));
    }

    console.log(`✅ Verification email sent to ${toEmail} via Brevo`);
  } catch (error) {
    console.error("❌ Error sending email via Brevo:", error);
    throw new Error("Failed to send verification email.");
  }
};
