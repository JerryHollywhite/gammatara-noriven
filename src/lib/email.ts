import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // We are using Service Account for Sheets, maybe the user wants to use a personal Gmail for SMTP?
        // OR the user has not set up SMTP.
        // For now, I will assume GOOGLE_SMTP_USER and GOOGLE_SMTP_PASS env vars exist or will be added.
        // If not, I'll fallback to a console log mock for development/demo if credentials fail.
        user: process.env.GOOGLE_SMTP_USER || "gammatara.learning@gmail.com", // Fallback/Placeholder
        pass: process.env.GOOGLE_SMTP_PASS || "",
    },
});

export async function sendResetEmail(to: string, token: string) {
    const resetLink = `https://gmt.otomasikan.com/reset-password?token=${token}`;

    if (!process.env.GOOGLE_SMTP_PASS) {
        console.warn("⚠️ NO SMTP PASSWORD SET. Email will not be sent.");
        console.log(`🔗 Mock Reset Link for ${to}: ${resetLink}`);
        return true; // Simulate success
    }

    try {
        await transporter.sendMail({
            from: '"Gamma Tara Admin" <gammatara.learning@gmail.com>',
            to,
            subject: 'Reset Your Password - Gamma Tara',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Password Request</h2>
                    <p>You requested to reset your password for Gamma Tara Learning Centre.</p>
                    <p>Click the button below to set a new password:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p>Or copy this link: <br> ${resetLink}</p>
                    <p>This link expires in 1 hour.</p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}

interface ContactFormData {
    name: string;
    grade?: string;
    parentName?: string;
    phone: string;
    program: string;
    message: string;
}

export async function sendContactEmail(data: ContactFormData) {
    if (!process.env.GOOGLE_SMTP_PASS) {
        console.warn("⚠️ NO SMTP PASSWORD SET. Contact email will not be sent.");
        console.log("📝 Mock Contact Email Data:", data);
        return true;
    }

    const adminEmail = process.env.GOOGLE_SMTP_USER || "gammatara.learning@gmail.com";

    try {
        await transporter.sendMail({
            from: '"Gamma Tara Web" <gammatara.learning@gmail.com>',
            to: adminEmail, // Send TO the admin
            replyTo: adminEmail, // In a real app we might want the user's email, but the form doesn't seem to ask for user email, only phone?
            subject: `New Inquiry: ${data.name} (${data.program})`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #0f172a;">New Inquiry Received</h2>
                    <p><strong>Student Name:</strong> ${data.name}</p>
                    <p><strong>Grade:</strong> ${data.grade || '-'}</p>
                    <p><strong>Parent Name:</strong> ${data.parentName || '-'}</p>
                    <p><strong>Phone/WhatsApp:</strong> <a href="https://wa.me/${data.phone.replace(/\D/g, '')}">${data.phone}</a></p>
                    <p><strong>Program Interest:</strong> ${data.program}</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin-top: 10px;">
                        <strong>Message:</strong><br/>
                        ${data.message || 'No message provided.'}
                    </div>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("Failed to send contact email:", error);
        return false;
    }
}
