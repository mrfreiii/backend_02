import { Collection, Db, MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server"

import { SETTINGS } from "../settings";
import { BlogType } from "../blogs/types";
import { PostType } from "../posts/types";

export let blogCollection: Collection<BlogType>;
export let postCollection: Collection<PostType>;

export const connectToDB = async ({ dbUrl, dbName }:{ dbUrl: string, dbName: string }): Promise<boolean> => {
    const client: MongoClient = new MongoClient(dbUrl);
    const db: Db = client.db(dbName);

    blogCollection = db.collection<BlogType>(SETTINGS.PATH.BLOGS);
    postCollection = db.collection<PostType>(SETTINGS.PATH.POSTS);

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

    blogCollection = db.collection<BlogType>(SETTINGS.PATH.BLOGS);
    postCollection = db.collection<PostType>(SETTINGS.PATH.POSTS);

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