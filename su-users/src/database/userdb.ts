import { MongoClient, Collection } from 'mongodb';
import { User } from '../models';
import { Redis, Cluster } from 'ioredis';
import { CACHE_TIMEOUT } from '../utils/const';

export class UserDb {
    public collection: Collection;
    private USER_KEY_PREFIX: string;
    private redis: Redis; // The types for Cluster are missing functions

    constructor(client: MongoClient, redis: Redis) {
        this.USER_KEY_PREFIX = 'user';
        this.redis = redis;
        this.collection = client.db('underflow').collection('users');
    }

    public async get(userId: string) {
        const key = this.getKey(this.USER_KEY_PREFIX, userId);

        try {
            console.time('getuser: redis');
            const user = await this.redis.get(key);
            console.timeEnd('getuser: redis');
            if (user) {
                // console.log('hit');
                return JSON.parse(user);
            }
        } catch (ex) {
            console.log('Error fetching cache, fetching from database instead');
        }

        const user = await this.collection.findOne({ _id: userId });
        // this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(user));
        this.redis.set(key, JSON.stringify(user), 'ex', CACHE_TIMEOUT);
        return user;
    }

    public async insert(user: User): Promise<void> {
        await this.collection.insertOne({
            ...user
        });
    }

    public async update(user: User): Promise<void> {
        await this.redis.del(this.getKey(this.USER_KEY_PREFIX, user._id));
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
        await this.redis.del(this.getKey(this.USER_KEY_PREFIX, userId));
        await this.collection.deleteOne({ _id: userId });
    }

    public async findByUsername(username: string) {
        const key = this.getKey(this.USER_KEY_PREFIX, username);
        try {
            console.time('getuserusername: redis');
            const user = await this.redis.get(key);
            console.timeEnd('getuserusername: redis');
            if (user) {
                // console.log('hit');
                return JSON.parse(user);
            }
        } catch (ex) {
            console.log('Error fetching cache, fetching from database instead');
        }

        const user = await this.collection.findOne({ username: username });
        // this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(user));
        this.redis.set(key, JSON.stringify(user), 'ex', CACHE_TIMEOUT);
        return user;
    }

    public async findByEmail(email: string) {
        return await this.collection.findOne({ email: email });
    }

    private getKey(keyPrefix: string, id: string): string {
        return `${keyPrefix}:${id}`;
    } 
}
