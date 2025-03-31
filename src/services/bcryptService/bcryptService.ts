import bcrypt from "bcrypt";
import { injectable } from "inversify";

@injectable()
export class BcryptService {
    async generateHash({password, salt}:{password: string; salt: string}): Promise<string> {
        return bcrypt.hash(password, salt)
    }
}