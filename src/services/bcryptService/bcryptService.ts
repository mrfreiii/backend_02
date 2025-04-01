import bcrypt from "bcrypt";
import { injectable } from "inversify";

@injectable()
export class BcryptService {
    async generateHash({password, salt}:{password: string; salt?: string}): Promise<string> {
        const defaultSalt = await bcrypt.genSalt(10);
        const saltForHash = salt ?? defaultSalt;

        return bcrypt.hash(password, saltForHash)
    }
}