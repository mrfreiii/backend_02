import bcrypt from "bcrypt";

export const bcryptService = {
    generateHash: async ({password, salt}:{password: string; salt: string}): Promise<string> => {
        return bcrypt.hash(password, salt)
    }
}