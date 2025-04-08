import { injectable } from "inversify";
import { sendEmail } from "./emailTransport";

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
            currentURL,
        }: {
            email: string,
            confirmationCode: string,
            currentURL: string,
        }) {
        const link = `${currentURL}/auth/registration-confirmation?code=${confirmationCode}`;

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

    async sendEmailWithPasswordRecoveryCode(
        {
            email,
            recoveryCode,
            currentURL,
        }: {
            email: string,
            recoveryCode: string,
            currentURL: string,
        }) {
        const link = `${currentURL}/auth/password-recovery?recoveryCode=${recoveryCode}`;

        const html = `
            <h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
                <a href=${link}>recovery password</a>
            </p>
        `

        await sendEmail({
            to: email,
            subject: "Восстановление пароля",
            html,
        })
    }
}