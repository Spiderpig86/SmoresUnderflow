import * as crypto from 'crypto';

import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { QuestionDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { Question, Answer } from '../../models';
import { ERROR_CODE, ENTRY_POINT, DELETE_KEY } from '../../utils/const';
import fetch from 'node-fetch';
import { addToQueue } from '../../utils/lib/publish';

import { Channel } from 'amqplib/callback_api';

export function deleteQuestion(questionDb: QuestionDb, ch: Channel): IMiddleware {
  return async (ctx: Context, next: (err?: any) => void) => {
    const id = ctx.params.id;
    const details = ctx.request.body;
    console.info('/deletequestion', JSON.stringify(details));
    console.time('deletequestion');

    if (!details || !id) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError('Malformed request');
      return;
    }

    try {
      console.time('deletequestion: Get question');
      const question = await questionDb.get(id);
      console.timeEnd('deletequestion: Get question');
      if (!question) {
        throw new Error(`No question with id ${id}`);
      }
      if (question.user.username !== ctx.state.user.username) {
        throw new Error('Not original poster.');
      }

      
      // Delete question media
      if (question.media.length > 0) {
        await Promise.all(
          question.media.map(
            async (id): Promise<void> => {
              fetch(ENTRY_POINT + '/deletemedia/' + id);
            })
        );
      }
      
      if(Math.random() < 0.35) {
        console.time('deletequestion: Add entry to queue');
        addToQueue({ question }, DELETE_KEY, ch);
        console.time('deletequestion: Add entry to queue');
      } else {
        // delete the actual question
        console.time('deletequestion: Delete question');
        questionDb.delete(id);
        console.timeEnd('deletequestion: Delete question');
      

        // delete answer
        // also delete answer's media
        // and update the answerer's answers array
        console.time('deletequestion: Delete all answers');
        // await answers.forEach(async (answer: string) => {
        //   questionDb.deleteAnswer(answer);
        // });
        
        Promise.all(
          question.answers.map(
            async (answer: string): Promise<void> => {
              questionDb.deleteAnswer(answer);
            })
        );
        console.timeEnd('deletequestion: Delete all answers');

        // update the questioner's question array
        console.time('deletequestion: Delete from user');
        questionDb.deleteQuestionFromUser(question);
        console.timeEnd('deletequestion: Delete from user');
      }

      ctx.status = 200;
      ctx.body = sendSuccess('Successfully deleted question');
      console.timeEnd('deletequestion');
    } catch (e) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
      return;
    }
  };
}
