import { MongoClient, Collection } from 'mongodb';
import { User } from '../models';

export class UserDb {
    public collection: Collection;

    constructor(client: MongoClient) {
        this.collection = client.db(`underflow`).collection(`users`);
    }

    public async get(userId: string) {
        return await this.collection.findOne({ _id: userId });
    }

    public async insert(user: User): Promise<void> {
        await this.collection.insertOne({
            ...user
        });
    }

    public async update(user: User): Promise<void> {
        await this.collection.findOneAndUpdate(
            { _id: user._id },
            {
                $set: {
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    verified: user.verified,
                }
            }
        );
    }

    public async delete(userId: string): Promise<void> {
        await this.collection.deleteOne({ _id: userId });
    }

    public async findByUsername(username: string){
        return await this.collection.findOne({ username: username });
    }

    public async findByEmail(email: string){
        return await this.collection.findOne({ email: email });
    }
}
