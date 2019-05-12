import { MongoClient, Collection, ObjectId } from 'mongodb';
import { Answer } from '../models';
import { Redis } from 'ioredis';
import { CACHE_TIMEOUT } from '../utils/const';

export class AnswerDb {
    public collection: Collection;
    private KEY_PREFIX: string;
    private redis: Redis;

    constructor(client: MongoClient, redis: Redis) {
        this.KEY_PREFIX = 'answer';
        this.redis = redis;
        this.collection = client.db(`underflow`).collection(`answers`);
    }

    public async get(answerId: string): Promise<Answer | null> {
        const key = this.getKey(answerId);

        try {
            console.time('answer:get: redis');
            const question = await this.redis.get(key);
            console.timeEnd('answer:get: redis');
            if (question) {
                // console.log('hit');
                return JSON.parse(question);
            }
        } catch (ex) {
            console.log('AnswerDb: Error fetching cache, fetching from database instead: ' + ex);
        }

        // console.log('answer:get: miss');
        const answer = await this.collection.findOne({ _id: answerId });
        this.redis.set(key, JSON.stringify(answer), 'ex', CACHE_TIMEOUT);
        return answer;
    }

    public async insert(answer: Answer): Promise<void> {
        await this.collection.insertOne({
            ...answer
        });
    }

    public async update(answer: Answer): Promise<void> {
        // this.redis.del(this.getKey(answer._id));
        const key = this.getKey(answer._id);
        this.redis.set(key, JSON.stringify(answer), 'ex', CACHE_TIMEOUT);
        await this.collection.findOneAndUpdate(
            { _id: answer._id },
            {
                $set: {
                    ...answer
                }
            }
        );
    }

    public async delete(answerId: string): Promise<void> {
        await this.redis.del(this.getKey(answerId));
        await this.collection.deleteOne({ _id: answerId });
    }

    public async getMany(answerIds: string[]): Promise<Answer[]> {
        const ids: ObjectId[] = answerIds.map(id => new ObjectId(id));

        const cursor = await this.collection.find({
            _id: {
                $in: ids
            }
        });
        return cursor.toArray();
    }

    private getKey(id: string) {
        return `${this.KEY_PREFIX}:${id}`;
    }

    // private getKey(keyPrefix: string, id: string, extra: string = ''): string {
    //     return `${keyPrefix}:${id}` + (extra.length > 0 ? `:${extra}` : ``);
    // }
}
