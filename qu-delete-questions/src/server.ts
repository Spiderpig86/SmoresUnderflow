import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { QuestionDb, Elastic } from './database';
import Redis from 'ioredis';
import { connect } from './db';
import { MongoClient } from 'mongodb';
import { EXCHANGE, DELETE_KEY, ENTRY_POINT } from './utils/const';
import fetch from 'node-fetch';

function listen(questionDb: QuestionDb) {
  amqp.connect(`amqp://localhost`, (err: any, conn: Connection) => {
    conn.createChannel((err: any, ch: Channel) => {
      ch.assertExchange(EXCHANGE, 'direct', {
        durable: false
      });

      ch.assertQueue('', {
        exclusive: true
      }, (err, q) => {
        ch.bindQueue(q.queue, EXCHANGE, DELETE_KEY);
        ch.consume(q.queue, async (msg: amqp.Message) => {
          console.log(`Received request to detele ${msg.content.toString()}`);

          const { question } = JSON.parse(msg.content.toString());
          await questionDb.delete(question._id);
          
          // Delete question media
          await Promise.all(
            question.media.map(
              async (id: string): Promise<void> => {
                fetch(ENTRY_POINT + '/deletemedia/' + id);
              })
          );
          
          // delete question answers
          await Promise.all(
            question.answers.map(
              async (answer: string): Promise<void> => {
                questionDb.deleteAnswer(answer);
              })
          );
          
          //delete quetion from user
          questionDb.deleteQuestionFromUser(question);

        }, { noAck: false });
      });
    });
  });
}

connect()
  .then(async (client: MongoClient) => {
    
    const REDIS_HOST = '130.245.168.122';
    const REDIS_PORT = 6379;

    const cache: Redis.Redis = new Redis(REDIS_PORT, REDIS_HOST, {
      dropBufferSupport: true
  }); // Default location

    cache.on('connect', () => {
      console.log('Connected to Redis!');
    });
    cache.on('error', (err: any) => {
        console.log(`CACHE ERROR: SL1 - ` + err);
    });

    const elastic = new Elastic();
    const questionDb = new QuestionDb(client, cache, elastic);

    listen(questionDb);
  })
  .catch(err => console.info(err));
