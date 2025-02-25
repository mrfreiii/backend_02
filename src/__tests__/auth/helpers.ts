import { req } from "../helpers";
import { SETTINGS } from "../../settings";
import { UserViewType } from "../../repositories/usersRepositories/types";
import { nodemailerService } from "../../services/nodemailerService/nodemailerService";

export const registerUser = async () => {
    const newUser: Omit<UserViewType, "id" | "createdAt"> & {password: string} = {
        login: "userLogin",
        password: "userPassword",
        email: "user@email.com"
    }

    await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(newUser)
        .expect(204)

    expect(nodemailerService.sendEmailWithConfirmationCode).toBeCalled();
    expect(nodemailerService.sendEmailWithConfirmationCode).toBeCalledTimes(1);
}
