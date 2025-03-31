import { sendEmail } from "./emailTransport";
import { injectable } from "inversify";

@injectable()
export class NodemailerService {
    static service: NodemailerService;

    constructor() {
        if (NodemailerService.service) {
            return NodemailerService.service
        }
        NodemailerService.service = this;
    }

    async sendEmailWithConfirmationCode(
        {
            email,
            confirmationCode,
            confirmationURL,
        }: {
            email: string,
            confirmationCode: string,
            confirmationURL: string,
        }) {
        const link = `${confirmationURL}/auth/registration-confirmation?code=${confirmationCode}`;

        const html = `
            <h1>Thanks for your registration</h1>
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