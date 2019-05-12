import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { AnswerDb, UserDb, QuestionDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { ERROR_CODE } from '../../utils/const';

export function postUpvote(answerDb: AnswerDb, userDb: UserDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const details = ctx.request.body;
        const answerId = ctx.params.id;
        const user = ctx.state.user;

        console.info('/upvoteanswer', JSON.stringify(details));
        console.time('upvoteanswer');

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
            const answer = await answerDb.get(answerId);
            if (!answer) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Answer not found with id: ${answerId}`);
                return;
            }

            console.time('upvoteanswer: Find user by username');
            const poster = await userDb.findByUsername(answer.user.username);
            console.timeEnd('upvoteanswer: Find user by username');

            // Upvote the answer
            console.time('upvoteanswer: Change vote');
            
            if (isUpvote) {
                // Undo upvote
                if (answer.upvoteIds.includes(user._id)) {
                    if (poster.reputation > 1) {
                        poster.reputation--;
                    }

                    answer.upvoteIds = answer.upvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                } else { // Upvote
                    poster.reputation++;
                    answer.upvoteIds.push(user._id);
                    answer.downvoteIds = answer.downvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                }
            } else {
                // Undo downvote
                if (answer.downvoteIds.includes(user._id)) {
                    poster.reputation++;
                    answer.downvoteIds = answer.downvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                } else { // Downvote
                    if (poster.reputation > 1) {
                        poster.reputation--;
                    }
                    answer.downvoteIds.push(user._id);
                    answer.upvoteIds = answer.upvoteIds.filter(
                        (id: string) => id !== user._id
                    );
                }
            }

            await Promise.all([answerDb.update(answer), userDb.update(poster)]);
            console.timeEnd('upvoteanswer: Change vote');

            ctx.status = 200;
            ctx.body = sendSuccess('Successfully upvoted/downvoted answer', answer.upvoteIds.length - answer.downvoteIds.length, 'score');
            console.timeEnd('upvoteanswer');
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}
