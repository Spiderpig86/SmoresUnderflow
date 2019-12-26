import { MongoClient, Collection, Db } from 'mongodb';
import { Question } from '../models';
import { Elastic } from './elastic';

export class QuestionDb {
  private questionDb: Collection;
  private userDb: Collection;
  private elastic: Elastic

  constructor(client: MongoClient, elastic: Elastic) {
    this.elastic = elastic;

    const db = client.db('underflow');
    this.questionDb = db.collection('questions');
    this.userDb = db.collection('users');
  }

  public async insert(question: Question): Promise<void> {
    this.questionDb.insertOne({
      ...question
    });

    // Add to elasticsearch
    this.elastic.insert(question);

    this.userDb.findOneAndUpdate(
      { _id: question.user._id },
      {
        $push: {
          questions: question._id
        }
      }
    );
  }
}
