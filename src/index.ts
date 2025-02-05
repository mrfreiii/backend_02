import {app} from './app';
import {SETTINGS} from './settings';
import { connectToDB } from "./db/mongodb";
import {config} from 'dotenv';

config();

const startApp = async () =>{
    const dbUrl = process.env?.MONGO_URL;
    if(!dbUrl) {
        console.log("db url is undefined");
        process.exit(1);
    }

    const res = await connectToDB(dbUrl);
    if(!res) process.exit(1);

    app.listen(SETTINGS.PORT, () => {
        console.log('...server started in port ' + SETTINGS.PORT)
    });
}

startApp();