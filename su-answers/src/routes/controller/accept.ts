import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { AnswerDb, QuestionDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { ERROR_CODE } from '../../utils/const';

export function postAccept(answerDb: AnswerDb, questionDb: QuestionDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const answerId = ctx.params.id;
        const user = ctx.state.user;
        console.time('acceptanswer');

        // Try accepting the answer
        try {
            console.time('acceptanswer: Get answer');
            const answer = await answerDb.get(answerId);
            console.timeEnd('acceptanswer: Get answer');
            if (!answer) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Answer not found with id: ${answerId}`);
                return;
            }

            // If answer is accepted already, send an error
            if (answer.isAccepted) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Answer is already accepted`);
                return;
            }

            // TODO: Check if there is an accepted answer for the corresponding question asked by that user
            console.time('acceptanswer: Get question');
            const question = await questionDb.get(answer.questionId);
            await questionDb.update(question);
            console.timeEnd('acceptanswer: Get question');
            if (question.acceptedAnswer) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Question already has an accepted answer`);
                return;
            }

            if (user.username !== question.user.username) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Unable to accept answer, not original asker.`);
                return;
            }

            answer.isAccepted = true;
            question.acceptedAnswer = answer._id;
            console.time('acceptanswer: Update answer/question');
            await questionDb.update(question);
            await answerDb.update(answer);
            // await Promise.all([questionDb.update(question), answerDb.update(answer)]);
            console.timeEnd('acceptanswer: Update answer/question');

            ctx.status = 200;
            ctx.body = sendSuccess('Successfully accepted answer');
            console.timeEnd('acceptanswer');
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}
