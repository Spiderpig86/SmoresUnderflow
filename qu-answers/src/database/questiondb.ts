import { MongoClient, Collection, Db } from 'mongodb';
import { Question, User, Answer } from '../models';
import { Redis } from 'ioredis';
import { CACHE_TIMEOUT } from '../utils/const';

export class QuestionDb {
  private USER_KEY_PREFIX: string;
  private QUESTION_KEY_PREFIX: string;
  private redis: Redis; // Redis brings in defintion for del

  public questionDb: Collection;
  private userDb: Collection;
  private answerDb: Collection;

  constructor(client: MongoClient, redis: any) {
    this.USER_KEY_PREFIX = 'user';
    this.QUESTION_KEY_PREFIX = 'question';
    this.redis = redis;

    const db = client.db('underflow');
    this.questionDb = db.collection('questions');
    this.answerDb = db.collection('answers');
    this.userDb = db.collection('users');
  }

  public async addAnswer(
    question: Question,
    answer: Answer,
    user: User
  ): Promise<void> {
    const questionKey = this.getKey(this.QUESTION_KEY_PREFIX, question._id);
    const userKey = this.getKey(this.USER_KEY_PREFIX, user._id);
    question.answers.push(answer._id); // Update answer
    this.redis.set(questionKey, JSON.stringify(question), 'ex', CACHE_TIMEOUT);
    this.redis.set(userKey, JSON.stringify(user), 'ex', CACHE_TIMEOUT);
    await this.answerDb.insertOne({ ...answer });

    await this.userDb.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          answers: answer._id
        }
      }
    );
    await this.questionDb.findOneAndUpdate(
      { _id: question._id },
      {
        $push: {
          answers: answer._id
        }
      }
    );
  }

  private getKey(keyPrefix: string, id: string): string {
    return `${keyPrefix}:${id}`;
  }
}
