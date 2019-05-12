import { MongoClient, Collection } from 'mongodb';
import { Question } from '../models';
import { Redis } from 'ioredis';
import { CACHE_TIMEOUT } from '../utils/const';

export class QuestionDb {
    public collection: Collection;
    private KEY_PREFIX: string;
    private redis: Redis;

    constructor(client: MongoClient, redis: Redis) {
        this.redis = redis;
        this.KEY_PREFIX = 'question';
        this.collection = client.db(`underflow`).collection(`questions`);
    }

    public async get(questionId: string): Promise<Question> {
        const key = this.getKey(questionId);
        try {
            console.time('answer:get: redis');
            const question = await this.redis.get(key);
            console.timeEnd('answer:get: redis');
            if (question) {
                // console.log('hit');
                return JSON.parse(question);
            }
        } catch (ex) {
            console.log('QuestionDb: Error fetching cache, fetching from database instead: ' + ex);
        }
        const question = await this.collection.findOne({ _id: questionId });
        this.redis.set(key, JSON.stringify(question), 'ex', CACHE_TIMEOUT);
        // this.redis.del(this.getKey(question._id));
        return question;
    }
    
    public async update(question: Question) {
        // this.redis.del(this.getKey(question._id));
        const key = this.getKey(question._id);
        this.redis.set(key, JSON.stringify(question), 'ex', CACHE_TIMEOUT);
        await this.collection.findOneAndUpdate({ _id: question._id }, { $set: { acceptedAnswer: question.acceptedAnswer } });
    }

    private getKey(id: string) {
        return `${this.KEY_PREFIX}:${id}`;
    }
}
