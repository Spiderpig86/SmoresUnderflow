import { MongoClient, Collection } from 'mongodb';

export class UserDb {
    public collection: Collection;

    constructor(client: MongoClient) {
        this.collection = client.db(`underflow`).collection(`users`);
    }

    public async get(userId: string) {
        return await this.collection.findOne({ _id: userId });
    }
    
    public async findByUsername(username: string){
        return await this.collection.findOne({ username: username });
    }

    public async findByEmail(email: string){
        return await this.collection.findOne({ email: email });
    }
}
