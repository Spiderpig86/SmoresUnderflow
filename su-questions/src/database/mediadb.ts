import { MongoClient, Collection } from 'mongodb';
import { Media } from '../models/media';
import { Redis, Cluster } from 'ioredis';
import { CACHE_TIMEOUT } from '../utils/const';

export class MediaDb {
  public collection: Collection;
  private MEDIA_PREFIX: string;

  constructor(client: MongoClient) {
    this.collection = client.db(`underflow`).collection(`media`);
  }

  public async insert(media: Media) {
    await this.collection.insertOne({ ...media });
  }

  public async get(_id: string) {

    const media = await this.collection.findOne({ _id });
    return media;
  }

  public async delete(_id: string) {
    this.collection.deleteOne({ _id });
  }
}
