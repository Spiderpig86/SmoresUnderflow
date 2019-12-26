import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { QuestionDb, Elastic } from './database';
import { connect } from './db';
import { MongoClient } from 'mongodb';
import { EXCHANGE, ADD_KEY } from './utils/const';

function listen(questionDb: QuestionDb) {
  amqp.connect(`amqp://localhost`, (err: any, conn: Connection) => {
    conn.createChannel((err: any, ch: Channel) => {
      ch.assertExchange(EXCHANGE, 'direct', {
        durable: false
      });

      ch.assertQueue('', {
        exclusive: true
      }, (err, q) => {
        ch.bindQueue(q.queue, EXCHANGE, ADD_KEY);
        ch.consume(q.queue, async (msg: amqp.Message) => {

          console.log(`Received request to add ${msg.content.toString()}`);

          const { question } = JSON.parse(msg.content.toString());
          await questionDb.insert(question);
        }, { noAck: false });
      });
    });
  });
}

connect()
  .then(async (client: MongoClient) => {
    const elastic = new Elastic();
    const questionDb = new QuestionDb(client, elastic);

    listen(questionDb);
  })
  .catch(err => console.info(err));
