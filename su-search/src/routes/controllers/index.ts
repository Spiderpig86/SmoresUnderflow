import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { SearchDb, Elastic } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { toFrontend } from '../../utils/lib/toFrontend';
import { Parameter } from '../../models/parameter';
import { ERROR_CODE } from '../../utils/const';
import { Question, User } from '../../models';

function getSortBy(sort_by: string){
  if(sort_by == 'time') {
    return { timestamp: -1};
  }
  return { score: -1};
}

// Remember to configure the index with: db.questions.createIndex({ title: "text", body: "text" }, { default_language: "none" })
export function search(searchDb: SearchDb, elastic: Elastic): IMiddleware {
  return async (ctx: Context, next: (err?: any) => void) => {
    const details = ctx.request.body;
    console.log('/search', details);

    if (!details) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError('Malformed request');
      return;
    }
    console.time('search');

    try {
      const param = new Parameter(details);
      // const rslts = await searchDb.get(param);
      console.time('search: Fetching from elastic search');
      const rslts = await elastic.search(param);
      console.timeEnd('search: Fetching from elastic search');

      console.time('search: Get users');
      const questions: any = [];
      const userIds: Set<string> = new Set();
      rslts.map((res: any) => userIds.add(res._source.user.username));
      const users: Map<string, User> = await searchDb.getUsers(userIds);

      for (const res of rslts) {
        const question: Question = { ...res._source, _id: res._id } as Question;
        questions.push(toFrontend(question, users.get(question.user._id) as User));
      }

      // for (const res of rslts) {
      //   const question: Question = { ...res._source, _id: res._id } as Question;
      //   const user = await searchDb.getUser(question.user.username);
      //   questions.push(toFrontend(question, user));
      // }
      // for (const question of rslts) {
      //   const user = await searchDb.getUser(question.user.username);
      //   questions.push(toFrontend(question, user));
      // }
      console.timeEnd('search: Get users');

      ctx.status = 200;
      ctx.body = sendSuccess('Successfully queried question', questions, 'questions');
      console.timeEnd('search');
    } catch (e) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
    }
  };
}

export function deleteAll(elastic: Elastic) {
  return async (ctx: Context, next: (err?: any) => void) => {
    try {
      await elastic.deleteAll();
    } catch (e) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError(e.message);
    }
  };
}