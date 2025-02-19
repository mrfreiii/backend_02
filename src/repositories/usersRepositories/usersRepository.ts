import { ObjectId, WithId } from "mongodb";

import { UserDbType } from "./types";
import { userCollection } from "../../db/mongodb";

export const usersRepository = {
    clearDB: async () => {
        return userCollection.drop();
    },
    getUsersByEmailOrLogin: async (
        {
            email,
            login
        }: {
            email?: string,
            login?: string
        }): Promise<WithId<UserDbType> | null > => {
        if (!email && !login) {
            return null
        }

        const emailTerm = email ? [{ email: { $regex: email, $options: "i" }}] : [];
        const loginTerm = login ? [{ login: { $regex: login, $options: "i" }}] : [];

        const filter = { $or: [...loginTerm, ...emailTerm] }

        return userCollection.findOne(filter)
    },
    addNewUser: async (
        newUser: UserDbType
    ): Promise<string> => {
        try {
            const createdUser = await userCollection.insertOne(newUser);
            return createdUser?.insertedId?.toString();
        } catch {
            return ""
        }
    },
    deleteUserById: async (id: string): Promise<boolean> => {
        try{
            const result = await userCollection.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch {
            return false;
        }
    },
}