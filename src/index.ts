import {config} from 'dotenv';

import {app} from './app';
import {SETTINGS} from './settings';
import { connectToDB } from "./db/mongodb";

config();

const startApp = async () => {
    const dbUrl = process.env?.MONGO_URL;
    if(!dbUrl) {
        console.log("db url is undefined");
        process.exit(1);
    }

    const dbName = process.env?.MONGO_DB_NAME;
    if(!dbName){
        console.log("db name is undefined");
        process.exit(1);
    }

    const res = await connectToDB({dbUrl, dbName});
    if(!res) process.exit(1);

    app.listen(SETTINGS.PORT, () => {
        console.log('...server started in port ' + SETTINGS.PORT)
    });
}

startApp();