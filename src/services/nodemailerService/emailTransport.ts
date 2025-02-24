import { config } from "dotenv";
import { createTransport } from "nodemailer";

config();

export const sendEmail = async ({to, subject, html}:{to: string; subject: string; html: string}) => {
    const transporter = createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_ACCOUNT,
            pass: process.env.EMAIL_ACCOUNT_PASSWORD
        },
    });

    try {
        await transporter.sendMail({
            from: "Backend_02 <process.env.EMAIL>",
            to,
            subject,
            html,
        })
    } catch (err) {
        console.log(`Email transport error: ${err}`)
    }
}
