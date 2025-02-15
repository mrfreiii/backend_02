import { Collection, Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server"

import { SETTINGS } from "../settings";
import { BlogDbType } from "../repositories/blogsRepositories/types";
import { PostDbType } from "../repositories/postsRepositories/types";
import { UserDbType } from "../repositories/usersRepositories/types";

export let blogCollection: Collection<BlogDbType>;
export let postCollection: Collection<PostDbType>;
export let userCollection: Collection<UserDbType>;

export const connectToDB = async ({ dbUrl, dbName }:{ dbUrl: string, dbName: string }): Promise<boolean> => {
    const client: MongoClient = new MongoClient(dbUrl);
    const db: Db = client.db(dbName);

    blogCollection = db.collection<BlogDbType>(SETTINGS.PATH.BLOGS);
    postCollection = db.collection<PostDbType>(SETTINGS.PATH.POSTS);
    userCollection = db.collection<UserDbType>(SETTINGS.PATH.USERS);

    try {
        await client.connect();
        await db.command({ping: 1});
        console.log("connected to db");

        return true;
    } catch (e) {
        console.log(e);
        await client.close();

        return false;
    }
}

export const connectToTestDB = async (): Promise<MongoMemoryServer> => {
    const server = await MongoMemoryServer.create()

    const uri = server.getUri()
    const client: MongoClient = new MongoClient(uri)

    const db: Db = client.db("test");

    blogCollection = db.collection<BlogDbType>(SETTINGS.PATH.BLOGS);
    postCollection = db.collection<PostDbType>(SETTINGS.PATH.POSTS);
    userCollection = db.collection<UserDbType>(SETTINGS.PATH.USERS);

    try {
        await client.connect();
        await db.command({ping: 1});
        console.log("connected to test db");
    } catch (e) {
        console.log(e);
        await server.stop();
    }

    return server;
}