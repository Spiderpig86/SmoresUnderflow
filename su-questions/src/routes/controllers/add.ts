import * as crypto from 'crypto';

import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { Channel } from 'amqplib/callback_api';
import { QuestionDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { Question } from '../../models';
import { ERROR_CODE, ADD_KEY } from '../../utils/const';
import { MediaDb } from '../../database/mediadb';
import { addToQueue } from '../../utils/lib/publish';

export function addQuestion(questionDb: QuestionDb, mediaDb: MediaDb, ch: Channel): IMiddleware {
  return async (ctx: Context, next: (err?: any) => void) => {
    const details = ctx.request.body;
    console.time('question: start');
    
    console.info('/addquestion');

    if (!details || !details.title || !details.body || !details.tags) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError('Malformed request');
      return;
    }
    console.timeEnd('question: start');
    console.time('addquestion');

    const timestamp = (Date.now() / 1000);

    console.time('addquestion: Create question');
    const question: Question = {
      _id: crypto
        .createHash('sha1')
        .update(`${details.user}:${Date.now()}:${Math.random()}`, 'utf8')
        .digest()
        .toString('hex'),
      title: details.title,
      body: details.body,
      score: 0,
      tags: details.tags ? details.tags : [],
      answers: [],
      user: ctx.state.user,
      acceptedAnswer: null,
      timestamp: timestamp,
      media: details.media ? details.media : [],
      viewCount: 0,
      viewedIds: [],
      upvoteIds: [],
      downvoteIds: []
    };
    console.timeEnd('addquestion: Create question');

    // Check if question ID already appears in database
    console.time('addquestion: Media check');
    if(question.media.length) {
      try {
        await questionDb.updateMedia(question.media, ctx.state.user.username);
      } catch (e) {
        console.log(e.message);
        ctx.status = ERROR_CODE;
        ctx.body = sendError(e.message);
        return;
      }
    }
    console.timeEnd('addquestion: Media check');

    
    try {
      if(Math.random() < 0.35){
        console.time('addquestion: Insert question to queue');
        addToQueue({ question }, ADD_KEY, ch);
        console.timeEnd('addquestion: Insert question to queue');
      } else {
        console.time('addquestion: Insert question');
        await questionDb.insert(question);
        console.timeEnd('addquestion: Insert question');
      }

      ctx.status = 200;
      ctx.body = sendSuccess('Successfully added question', question._id, 'id');
      console.timeEnd('addquestion');
    } catch (e) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
    }
  };
}