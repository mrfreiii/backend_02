import { Collection, Db, MongoClient } from "mongodb";
import {config} from 'dotenv';

config();

import { SETTINGS } from "../settings";
import { BlogType, PostType } from "./types";

export let blogCollection: Collection<BlogType>;
export let postCollection: Collection<PostType>;

export const connectToDB = async (url: string): Promise<boolean> => {
    const client: MongoClient = new MongoClient(url);

    const dbName = process.env?.MONGO_DB_NAME;
    if(!dbName){
        console.log("db name is undefined");
        return false;
    }

    const db: Db = client.db(dbName);

    blogCollection = db.collection<BlogType>(SETTINGS.PATH.BLOGS);
    postCollection = db.collection<PostType>(SETTINGS.PATH.POSTS);

    try {
        await client.connect();
        await db.command({ping: 1});
        console.log('connected to db');

        return true;
    } catch (e) {
        console.log(e);
        await client.close();

        return false;
    }
}