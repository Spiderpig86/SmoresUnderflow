import * as mongo from 'mongodb';
import { MONGO_HOST } from './utils/const';

// const url = 'mongodb://localhost:27017/underflow';

export async function connect() {
    let client
    try {
        client = await mongo.MongoClient.connect(
            MONGO_HOST,
            { useNewUrlParser: true }
        );

        console.info('Connected to MongoDB!');
    } catch (err) {
        console.info(err.message);
    }
    return client;
}
