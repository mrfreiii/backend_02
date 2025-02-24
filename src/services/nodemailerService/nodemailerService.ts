import { sendEmail } from "./emailTransport";

export const nodemailerService = {
    sendEmailWithConfirmationCode: async (
        {
            email,
            confirmationCode,
            confirmationURL,
        }: {
            email: string,
            confirmationCode: string,
            confirmationURL: string,
        }) => {
        const link = `${confirmationURL}/auth/registration-confirmation?code=${confirmationCode}`;

        const html = `
            <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href=${link}>complete registration</a>
            </p>
        `

        await sendEmail({
            to: email,
            subject: "Подтверждение регистрации",
            html,
        })
    }
}