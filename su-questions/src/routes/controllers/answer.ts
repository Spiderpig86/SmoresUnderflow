import * as crypto from 'crypto';

import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { QuestionDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { Question, Answer, User } from '../../models';
import { toFrontendAnswer } from '../../utils/lib/toFrontend';
import { ERROR_CODE, ANSWER_KEY } from '../../utils/const';
import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { addToQueue } from '../../utils/lib/publish';

// function addToQueue(question: Question, answer: Answer, user: User) {
//   amqp.connect(`amqp://localhost`, (err: any, conn: Connection) => {
//     console.log('addquestion connecting');
//     conn.createChannel((err: any, ch: Channel) => {
//       const queueName = 'questions/add';
//       console.log('channel created');
//       ch.sendToQueue(
//         queueName,
//         new Buffer(JSON.stringify({ question, answer, user }))
//       );
//     });
//     setTimeout(function() {
//       conn.close();
//     }, 250);
//   });
// }

export function addAnswer(questionDb: QuestionDb, ch: Channel): IMiddleware {
  return async (ctx: Context, next: (err?: any) => void) => {
    const details = ctx.request.body;
    const id = ctx.params.id;
    console.info('/addanswer', JSON.stringify(details), id);

    if (!details || !id) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError('Malformed request');
      return;
    }
    console.time('addanswer');

    let question;
    try {
      console.time('addanswer: Get question');
      question = await questionDb.get(id);
      console.timeEnd('addanswer: Get question');

      if (!question) {
        ctx.status = ERROR_CODE;
        ctx.body = sendError(`Given question with id ${id} does not exist.`);
        return;
      }

    } catch (e) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
      return;
    }

    const timestamp = Date.now() / 1000;

    console.time('addanswer: Create answer');
    const answer: Answer = {
      _id: crypto
        .createHash('sha256')
        .update(`${details.user}:${Date.now()}:${Math.random()}`, 'utf8')
        .digest()
        .toString('hex'),
      user: ctx.state.user,
      body: details.body,
      timestamp: timestamp,
      questionId: id,
      isAccepted: false,
      media: details.media ? details.media : [],
      upvoteIds: [],
      downvoteIds: []
    };
    console.timeEnd('addanswer: Create answer');

    // Check if question ID already appears in database
    try {
      console.log('getting media');
      await questionDb.updateMedia(answer.media, ctx.state.user.username);
      console.log('getting media end');
    } catch (e) {
      console.log('getting media error');
      console.log(e.message);
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
      return;
    }

    try {
      if (Math.random() < 0.5) {
        console.time('addanswer: Insert answer into queue');
        addToQueue({ question, answer, user: ctx.state.user }, ANSWER_KEY, ch);
        console.timeEnd('addanswer: Insert answer into queue');
      } else {
        console.time('addanswer: Insert answer');
        await questionDb.addAnswer(question, answer, ctx.state.user);
        console.timeEnd('addanswer: Insert answer');
      }
      ctx.status = 200;
      ctx.body = sendSuccess('Successfully added answer', answer._id, 'id');
      console.timeEnd('addanswer');
    } catch (e) {
      console.log('addMedia error', e.message);
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
    }
  };
}

export function getAnswers(questionDb: QuestionDb): IMiddleware {
  return async (ctx: Context, next: (err?: any) => void) => {
    const id = ctx.params.id;

    console.info('/getanswers', JSON.stringify(id));

    if (!id) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError('Malformed request');
      return;
    }
    console.time('getanswers');

    try {
      console.time('getanswers: Get question by ID');
      const question = await questionDb.get(id);
      console.timeEnd('getanswers: Get question by ID');
      if (!question) {
        ctx.status = ERROR_CODE;
        ctx.body = sendError(`Question does not exist with id ${id}`);
        return;
      }
      const answers: any = [];
      // question.answers.forEach(async answerId => {
      //     const answer = (await questionDb.getAnswer(answerId)) as Answer;
      //     console.log(answer);
      //     answers.push(toFrontendAnswer(answer));
      // });
      // Performance
      console.time('getanswers: Fetch answers');
      for (let i = 0; i < question.answers.length; i++) {
        const answer = await questionDb.getAnswer(question.answers[i]);
        if (!answer) {
          continue; // When the answer is deleted but not updated in question
        }
        const user = await questionDb.getUser(answer.user._id);
        answers.push(toFrontendAnswer(answer, user));
      }
      console.timeEnd('getanswers: Fetch answers');

      ctx.status = 200;
      ctx.body = sendSuccess(
        'Successfully queried answers',
        answers,
        'answers'
      );
      console.timeEnd('getanswers');
    } catch (e) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
    }
  };
}
