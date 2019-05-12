import { MongoClient, Collection, Db } from 'mongodb';
import { Question, User } from '../models';
import { Parameter } from '../models/parameter';
import { Redis } from 'ioredis';
import { CACHE_TIMEOUT, REDIS_HOST } from '../utils/const';

export class SearchDb {
  public db: Db;
  private redis: Redis
  private USER_KEY_PREFIX = 'user';

  constructor(client: MongoClient, redis: Redis) {
    this.db = client.db('underflow');
    this.redis = redis;
  }

  public async get(param: Parameter): Promise<Question[]> {
    const questionCollection = this.db.collection('questions');
    return await questionCollection
      .find(param.find)
      .limit(param.limit)
      .sort(param.sort)
      .toArray();
  }

  public async getUsers(userIds: Set<string>) {
    const pipeline = this.redis.pipeline();
    const reqs = [];
    for (const id of userIds) {
      const key = this.getKey(this.USER_KEY_PREFIX, id);
      reqs.push(id);
      pipeline.get(key);
    }


    // Exec pipeline
    const res = await pipeline.exec();
    const users: Map<string, User> = new Map();
    let i = 0;
    for (const item of res) {
      if (item && item[1]) {
        const user: User = JSON.parse(item[1]);
        users.set(user._id, user);
      } else {
        console.log('miss2');
        const user = await this.getUser(reqs[i]); // Get from database
        console.log('missed user', user);
        users.set(user._id, user);
      }
      i++;
    }
    return users;
  }

  public async getUser(userId: string) {
    const key = this.getKey(this.USER_KEY_PREFIX, userId);
    // if (Math.random() < 1) {
      try {
        const user = await this.redis.get(key);
        if (user) {
          // console.log('search: getUser hit');
          return JSON.parse(user);
        }
      } catch (ex) {
        console.log('Error user from cache for search, fetching from database instead: ' + ex);
      }
    // }
    const userCollection = this.db.collection('users');
    const user = await userCollection.findOne({ _id: userId });
    if (user) {
      this.redis.set(key, JSON.stringify(user), 'ex', CACHE_TIMEOUT);
    }
    return user;
  }

  private getKey(keyPrefix: string, id: string): string {
    return `${keyPrefix}:${id}`;
  }
}
