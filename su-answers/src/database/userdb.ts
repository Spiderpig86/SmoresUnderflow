import { MongoClient, Collection } from 'mongodb';
import { User } from '../models';
import { Redis } from 'ioredis';
import { CACHE_TIMEOUT } from '../utils/const';

export class UserDb {
    public collection: Collection;
    private USER_KEY_PREFIX: string;
    private redis: Redis;


    constructor(client: MongoClient, redis: Redis) {
        this.USER_KEY_PREFIX = 'user';
        this.collection = client.db(`underflow`).collection(`users`);
        this.redis = redis;
    }

    public async get(userId: string) {
        const key = this.getKey(this.USER_KEY_PREFIX, userId);

        try {
            const user = await this.redis.get(key);
            if (user) {
                return JSON.parse(user);
            }
        } catch (ex) {
            console.log('Error fetching cache, fetching from database instead: ' + ex);
        }

        const user = await this.collection.findOne({ _id: userId });
        this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(user));
        return user;
    }
    
    public async findByUsername(username: string): Promise<User | null> {
        const key = this.getKey(this.USER_KEY_PREFIX, username);
        try {
            const user = await this.redis.get(key);
            if (user) {
                return JSON.parse(user);
            }
        } catch (ex) {
            console.log('Error fetching cache, fetching from database instead: ' + ex);
        }

        const user = await this.collection.findOne({ username: username });
        this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(user));
        return user;
    }

    public async findByEmail(email: string): Promise<User | null> {
        return await this.collection.findOne({ email: email });
    }

    public async update(user: User): Promise<void> {
        // this.redis.del(this.getKey(this.USER_KEY_PREFIX, user._id));
        const key = this.getKey(this.USER_KEY_PREFIX, user._id);
        this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(user));
        await this.collection.findOneAndUpdate(
            { _id: user._id },
            {
                $set: {
                    reputation: user.reputation
                }
            }
        );
    }

    private getKey(keyPrefix: string, id: string): string {
        return `${keyPrefix}:${id}`;
    } 
}
