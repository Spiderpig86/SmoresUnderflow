import { MongoClient, Collection, Db } from 'mongodb';
import { Redis } from 'ioredis';
import { Elastic } from './elastic';
import { User, Answer, Question } from '../models';
import { ENTRY_POINT } from '../utils/const';

export class QuestionDb {
  private questionDb: Collection;
  private answerDb: Collection;
  private userDb: Collection;
  private elastic: Elastic;
  private redis: Redis;
  private KEY_PREFIX: string;

  constructor(client: MongoClient, redis: Redis, elastic: Elastic) {
    this.elastic = elastic;
    this.redis = redis;
    this.KEY_PREFIX = 'question';

    const db = client.db('underflow');
    this.questionDb = db.collection('questions');
    this.userDb = db.collection('users');
    this.answerDb = db.collection('answers');
  }

  public async delete(questionId: string): Promise<void> {
    // Delete media from database and cache
    
    this.redis.del(this.getKey(this.KEY_PREFIX, questionId));
    this.elastic.delete(questionId);
    await this.questionDb.deleteOne({ _id: questionId });
  }

  public async deleteAnswer(answerId: string): Promise<void> {
    const answer = (await this.answerDb.findOne({ _id: answerId })) as Answer;
    const user = (await this.userDb.findOne({
      _id: answer.user.username
    })) as User;

    await Promise.all(
      answer.media.map(
        async (id: string): Promise<void> => {
          fetch(ENTRY_POINT + '/deletemedia/' + id);
        })
    );

    const answers = user.answers.filter((ans: string) => answer._id !== ans);
    this.userDb.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          answers
        }
      }
    );

    this.answerDb.deleteOne({ _id: answer._id });
  }

  public async deleteQuestionFromUser(question: Question) {
    const user = (await this.userDb.findOne({
      _id: question.user.username
    })) as User;
    const questions = user.questions.filter(
      (ques: string) => ques !== question._id
    );

    this.userDb.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          questions
        }
      }
    );
  }

  private getKey(keyPrefix: string, id: string): string {
    return `${keyPrefix}:${id}`;
  }
}
