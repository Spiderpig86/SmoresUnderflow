import { QuestionDb } from '../../database';
import { IMiddleware } from 'koa-router';
import { Context } from 'koa';
import { sendError, sendSuccess } from '../../utils/response';
import { ERROR_CODE } from '../../utils/const';
import { User } from '../../models';

export function postUpvote(questionDb: QuestionDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const questionId = ctx.params.id;
        const details = ctx.request.body;
        const user = ctx.state.user;
  
        console.info('/upvotequestion', JSON.stringify(details));
        console.time('upvotequestion');

        if (!details) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(`Malformed request`);
            return;
        }

        let isUpvote: boolean = details.upvote;
        if (isUpvote === undefined || isUpvote === null) {
            isUpvote = true;
        }

        try {
            console.time('upvotequestion: Get question');
            const question = await questionDb.get(questionId);
            console.timeEnd('upvotequestion: Get question');
            if (!question) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Question not found with id: ${questionId}`);
                return;
            }

            console.time('upvotequestion: Get user by username');
            const poster : User = await questionDb.getUser(question.user.username);
            console.timeEnd('upvotequestion: Get user by username');

            // Upvote the answer
            console.time('upvotequestion: Change vote');
            if (isUpvote) {
                // undo upvote
                if (question.upvoteIds.includes(user._id)) {
                    if (poster.reputation > 1) {
                        poster.reputation--;
                    }
                    
                    question.upvoteIds = question.upvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                } else { // upvote
                    poster.reputation++;
                    question.upvoteIds.push(user._id);
                    question.downvoteIds = question.downvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                }
            } else {
                // undo downvote
                if (question.downvoteIds.includes(user._id)) {
                    poster.reputation++;
                    question.downvoteIds = question.downvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                } else { // Downvote
                    if (poster.reputation > 1) {
                        poster.reputation--;
                    }
                    question.downvoteIds.push(user._id);
                    question.upvoteIds = question.upvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                }
            }

            question.score = question.upvoteIds.length - question.downvoteIds.length;
            
            await Promise.all([questionDb.update(question), questionDb.updateUser(poster)]);
            console.timeEnd('upvotequestion: Change vote');
            ctx.status = 200;
            ctx.body = sendSuccess('Successfully upvoted/downvoted question', question.upvoteIds.length - question.downvoteIds.length, 'score');
            console.timeEnd('upvotequestion');
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    }
}