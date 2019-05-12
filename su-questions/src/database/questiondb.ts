import { MongoClient, Collection, Db } from 'mongodb';
import { Question, User, Answer } from '../models';
import { Redis, Cluster } from 'ioredis';
import { CACHE_TIMEOUT, ENTRY_POINT, CACHE_MEDIA_TIMEOUT } from '../utils/const';
import { Media } from '../models/media';
import fetch from 'node-fetch';
import { Elastic } from './elastic';

export class QuestionDb {
  public db: Db;
  public collection: Collection;
  private QUESTION_KEY_PREFIX: string;
  private ANSWER_KEY_PREFIX: string;
  private USER_KEY_PREFIX: string;
  private MEDIA_KEY_PREFIX: string;
  private redis: Redis;
  private mediaRedis: Redis;

  private mediaDb: Collection;
  private userDb: Collection;
  private answerDb: Collection;
  private elastic: Elastic

  constructor(client: MongoClient, redis: Redis, mediaRedis: Redis, elastic: Elastic) {
    this.QUESTION_KEY_PREFIX = 'question';
    this.ANSWER_KEY_PREFIX = 'answer';
    this.USER_KEY_PREFIX = 'user';
    this.MEDIA_KEY_PREFIX = 'media';
    this.redis = redis;
    this.mediaRedis = mediaRedis;
    this.elastic = elastic;

    this.db = client.db('underflow');
    this.collection = this.db.collection('questions');
    this.mediaDb = this.db.collection('media');
    this.answerDb = this.db.collection('answers');
    this.userDb = this.db.collection('users');
  }

  public async get(questionId: string): Promise<Question> {
    const key = this.getKey(this.QUESTION_KEY_PREFIX, questionId);

    try {
      console.time('get: redis');
      const question = await this.redis.get(key);
      console.timeEnd('get: redis');
      if (question) {
        // console.log('hit');
        return JSON.parse(question);
      }
    } catch (ex) {
      console.log('Error fetching cache, fetching from database instead');
    }
    console.time('get: mongo');
    const question = await this.collection.findOne({ _id: questionId });
    console.timeEnd('get: mongo');
    // this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(question));
    if (question) {
      this.redis.set(key, JSON.stringify(question), 'ex', CACHE_TIMEOUT);
    }
    return question;
  }

  public async getUser(userId: string) {
    const key = this.getKey(this.USER_KEY_PREFIX, userId);

    if (Math.random() < 0.5) {
      try {
          console.time('addquestion:getuser:redis');
          const user = await this.redis.get(key);
          console.timeEnd('addquestion:getuser:redis');
          if (user) {
              return JSON.parse(user);
          }
      } catch (ex) {
          console.log('Error fetching cache, fetching from database instead');
      }
    }

    const userCollection = this.db.collection('users');
    const user = await userCollection.findOne({ _id: userId });
    // this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(user));
    this.redis.set(key, JSON.stringify(user), 'ex', CACHE_TIMEOUT);
    return user as User;
  }

  public async updateUser(user: User): Promise<void> {
    const key = this.getKey(this.USER_KEY_PREFIX, user._id);
    // this.redis.del(this.getKey(this.USER_KEY_PREFIX, user._id));
    this.redis.set(key, JSON.stringify(user), 'ex', CACHE_TIMEOUT);
    const userCollection = this.db.collection('users');
    userCollection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          reputation: user.reputation
        }
      }
    );
  }

  public async insert(question: Question): Promise<void> {
    this.collection.insertOne({
      ...question
    });

    // Add to elasticsearch
    this.elastic.insert(question);

    const userCollection = this.db.collection('users');
    userCollection.findOneAndUpdate(
      { _id: question.user._id },
      {
        $push: {
          questions: question._id
        }
      }
    );
  }

  public async update(question: Question): Promise<void> {
    // this.redis.del(this.getKey(this.QUESTION_KEY_PREFIX, question._id));
    const key = this.getKey(this.QUESTION_KEY_PREFIX, question._id);
    this.redis.set(key, JSON.stringify(question), 'ex', CACHE_TIMEOUT);
    this.elastic.update(question);
    this.collection.findOneAndUpdate(
      { _id: question._id },
      {
        $set: {
          ...question
        }
      }
    );
  }

  public async delete(questionId: string): Promise<void> {
    // Delete media from database and cache
    this.redis.del(this.getKey(this.QUESTION_KEY_PREFIX, questionId));
    this.elastic.delete(questionId);
    await this.collection.deleteOne({ _id: questionId });
  }

  public async incrementViewCount(
    questionId: string,
    question: Question,
    id: string
  ): Promise<void> {
    this.redis.del(this.getKey(this.QUESTION_KEY_PREFIX, questionId));
    question.viewedIds.push(id);
    this.elastic.update(question);
    this.collection.findOneAndUpdate(
      { _id: questionId },
      {
        $set: {
          viewedIds: question.viewedIds
        },
        $inc: {
          viewCount: 1
        }
      }
    );
  }

  public async addAnswer(
    question: Question,
    answer: Answer,
    user: User
  ): Promise<void> {
    // this.redis.del(this.getKey(this.QUESTION_KEY_PREFIX, question._id));
    // this.redis.del(this.getKey(this.USER_KEY_PREFIX, user._id));
    const questionKey = this.getKey(this.QUESTION_KEY_PREFIX, question._id);
    const userKey = this.getKey(this.USER_KEY_PREFIX, user._id);
    question.answers.push(answer._id); // Update answer
    this.redis.set(questionKey, JSON.stringify(question), 'ex', CACHE_TIMEOUT);
    this.redis.set(userKey, JSON.stringify(user), 'ex', CACHE_TIMEOUT);
    const answerDb = this.db.collection('answers');
    answerDb.insertOne({ ...answer });

    const userCollection = this.db.collection('users');
    await userCollection.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          answers: answer._id
        }
      }
    );
    await this.collection.findOneAndUpdate(
      { _id: question._id },
      {
        $push: {
          answers: answer._id
        }
      }
    );
  }

  public async getAnswer(answerId: string) {
    const key = this.getKey(this.ANSWER_KEY_PREFIX, answerId);

    try {
      const answer = await this.redis.get(key);
      if (answer) {
        // console.log('hit');
        return JSON.parse(answer);
      }
    } catch (ex) {
      console.log('Error fetching cache, fetching from database instead');
    }

    // console.log('miss');
    const answerDb = this.db.collection('answers');
    const answer = await answerDb.findOne({ _id: answerId });
    // this.redis.setex(key, CACHE_TIMEOUT, JSON.stringify(answer));
    this.redis.set(key, JSON.stringify(answer), 'ex', CACHE_TIMEOUT);
    return answer;
  }

  public async deleteAnswer(answerId: string): Promise<void> {

    const answer = (await this.answerDb.findOne({ _id: answerId })) as Answer;
    const user = (await this.userDb.findOne({
      _id: answer.user.username
    })) as User;
    this.redis.del(this.getKey(this.USER_KEY_PREFIX, user._id));

    // Delete media from database and cache
    // this.deleteMedia(answer.media);
    Promise.all(
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
    this.redis.del(this.getKey(this.USER_KEY_PREFIX, question.user._id));
    const userDb = this.db.collection('users');

    const user = (await userDb.findOne({
      _id: question.user.username
    })) as User;
    // const viewedQuestions = user.viewedQuestions.filter((id: string) => id !== question._id);
    const questions = user.questions.filter(
      (ques: string) => ques !== question._id
    );

    await userDb.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          questions
          // viewedQuestions
        }
      }
    );
  }

  public async insertMedia(media: Media) {
    const key = this.getKey(this.MEDIA_KEY_PREFIX, media._id);
    this.mediaRedis.set(key, JSON.stringify(media), 'ex', CACHE_MEDIA_TIMEOUT);
    await this.mediaDb.insertOne({ ...media });
  }

  public async updateMedia(mediaIds: string[], username: string) {
    const mediaObjs: Media[] = await this.getMediaArray(mediaIds, username);

    if (mediaObjs.length < mediaIds.length) {
      console.log('Invalid media params');
      throw new Error(
        `Invalid media params`
      );
    }

    // Otherwise update status to used
    for (const media of mediaObjs) {
      const key = this.getKey(this.MEDIA_KEY_PREFIX, media._id);
      this.mediaRedis.del(key);
      this.mediaDb.findOneAndUpdate(
        { _id: media._id },
        {
          $set: {
            used: true
          }
        }
      );
    }
  }

  public async getMediaArray(ids: string[], username: string): Promise<Media[]> {
    if (Math.random() < 0.3) {
      const media = await this.mediaDb.find({
        _id: { $in: ids },
        used: false,
        username
      }
      ).toArray();
      return media;
    } else {
      // Get all get media one at a time (partially uses cache)
      const mediaArr: Media[] = [];
      for (const id of ids) {
        const media = await this.getMedia(id);
        if (media && !media.used && media.username === username) {
          mediaArr.push(media);
        }
      }
      return mediaArr;
    }
  }

  public async getMedia(_id: string): Promise<Media | null> {
    const key = this.getKey(this.MEDIA_KEY_PREFIX, _id);
    if (Math.random() < 0.5) {
      try {
        const media = await this.mediaRedis.get(key);
        if (media) {
          // console.log('getMedia: hit');
          return JSON.parse(media);
        }
      } catch (ex) {
        console.log('Error media from fetching cache, fetching from database instead: ' + ex);
      }
    }

    try {
      // console.log('getMedia: miss');
      const media = await this.mediaDb.findOne({ _id });
      if (media) {
        this.mediaRedis.set(key, JSON.stringify(media), 'ex', CACHE_TIMEOUT);
      }
      return media;
    } catch (e) {
      throw new Error(`No media found with ID ${_id}`);
    }
  }

  public async deleteMedia(mediaIds: string[]) {
    for (const id of mediaIds) {
      this.mediaRedis.del(this.getKey(this.MEDIA_KEY_PREFIX, id));
      this.mediaDb.deleteOne({ _id: id });
    }
  }

  private getKey(keyPrefix: string, id: string, extra: string = ''): string {
    return `${keyPrefix}:${id}` + (extra.length > 0 ? `:${extra}` : ``);
  }
}
