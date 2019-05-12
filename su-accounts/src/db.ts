import * as mongo from 'mongodb';

// const url = 'mongodb://localhost:27017/underflow';

export async function connect(){
    let client;
    try {
        client = await mongo.MongoClient.connect(
            'mongodb://localhost:27017/underflow',
            { useNewUrlParser: true }
        );

        console.info('Connected to MongoDB!');
    } catch (err) {
        console.info(err.message);
    }
    return client;
}
