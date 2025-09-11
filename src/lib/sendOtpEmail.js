import nodemailer from "nodemailer";

export const sendOtpEmail = async (userEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PWD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_SITE_NAME || "Dream Science"}" <${
        process.env.EMAIL_USER
      }>`,
      to: userEmail || process.env.EMAIL_USER,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px; text-align: center;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <h1 style="color: #2c3e50; margin-bottom: 20px;">Verification Code</h1>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
              Use the following one-time password (OTP) to complete your action. 
              This code is valid for the next <strong>10 minutes</strong>.
            </p>
            
            <div style="background: #f0f4ff; padding: 15px 20px; border-radius: 6px; display: inline-block; margin-bottom: 20px;">
              <span style="font-size: 28px; letter-spacing: 5px; color: #1a73e8; font-weight: bold;">
                ${otp}
              </span>
            </div>
            
            <p style="font-size: 14px; color: #888; margin-top: 10px;">
              If you didn’t request this code, you can safely ignore this email.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
            © ${new Date().getFullYear()} ${
        process.env.EMAIL_SITE_NAME
      }. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✉️ Email sent:", info.messageId || info.response);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw error;
  }
};
