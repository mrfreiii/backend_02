import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server"

export const connectToDB = async ({ dbUrl, dbName }:{ dbUrl: string, dbName: string }): Promise<boolean> => {
    try {
        await mongoose.connect(dbUrl, {dbName})
        console.log("connected to db");

        return true;
    } catch (e) {
        console.log(e);
        await mongoose.disconnect();

        return false;
    }
}

export const connectToTestDB = async (): Promise<{server: MongoMemoryServer; mongooseConnection:typeof mongoose}> => {
    const server = await MongoMemoryServer.create()
    const uri = server.getUri()

    const mongooseConnection = await mongoose.connect(uri)

    return {server, mongooseConnection};
}
