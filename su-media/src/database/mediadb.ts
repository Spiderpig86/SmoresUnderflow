import { MongoClient, Collection } from 'mongodb';
import { Media } from '../models/media';
import { Redis, Cluster } from 'ioredis';
import { CACHE_TIMEOUT } from '../utils/const';

export class MediaDb {
  public collection: Collection;
  private MEDIA_KEY_PREFIX: string;
  private redis: Redis;

  constructor(client: MongoClient, redis: Redis) {
    this.collection = client.db(`underflow`).collection(`media`);
    this.MEDIA_KEY_PREFIX = 'media';
    this.redis = redis;
  }

  public async insert(media: Media) {
    const key = this.getKey(this.MEDIA_KEY_PREFIX, media._id);
    this.redis.set(key, JSON.stringify(media), 'ex', CACHE_TIMEOUT);
    await this.collection.insertOne({ ...media });
  }

  public async get(_id: string) {

    const media = await this.collection.findOne({ _id });
    return media;
  }

  public async deleteMedia(ids: string[]) {
    this.collection.deleteOne({ _id: { $in: ids} });
  }

  private getKey(keyPrefix: string, id: string, extra: string = ''): string {
    return `${keyPrefix}:${id}` + (extra.length > 0 ? `:${extra}` : ``);
  }
}
