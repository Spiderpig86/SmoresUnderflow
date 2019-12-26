import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { QuestionDb } from './database';
import { connect } from './db';
import { REDIS_PORT, REDIS_HOST, EXCHANGE, ANSWER_KEY } from './utils/const';
import Redis from 'ioredis';
import { MongoClient } from 'mongodb';

function listen(questionDb: QuestionDb) {
  amqp.connect(`amqp://localhost`, (err: any, conn: Connection) => {
    conn.createChannel((err: any, ch: Channel) => {
      ch.assertExchange(EXCHANGE, 'direct', {
        durable: false
      });

      ch.assertQueue('', {
        exclusive: true
      }, (err, q) => {
        ch.bindQueue(q.queue, EXCHANGE, ANSWER_KEY);
        ch.consume(q.queue, async (msg: amqp.Message) => {

          console.log(`Received request to add ${msg.content.toString()}`);

          const { question, answer, user } = JSON.parse(msg.content.toString());
          await questionDb.addAnswer(question, answer, user);
        }, { noAck: false });
      });
    });
  });
}

connect()
  .then(async (client: MongoClient) => {
    const cache: Redis.Redis = new Redis(REDIS_PORT, REDIS_HOST, {
      dropBufferSupport: true
  }); // Default location

    // Connect to the redis client
    cache.on('connect', () => {
      console.log('Connected to Redis!');
    });
    cache.on('error', (err: any) => {
      console.log(`CACHE ERROR: SL1 - ` + err);
    });

    const questionDb = new QuestionDb(client, cache);
    listen(questionDb);
  })
  .catch(err => console.info(err));
