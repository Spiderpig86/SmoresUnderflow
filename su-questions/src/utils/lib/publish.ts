import {connect, Connection, Channel } from 'amqplib/callback_api';
import { EXCHANGE } from '../const';

export function addToQueue(details: any, key: string, ch: Channel) {

  ch.publish(EXCHANGE, key, new Buffer(JSON.stringify(details)));
  console.log(`Queued entry ${details}`);
}
