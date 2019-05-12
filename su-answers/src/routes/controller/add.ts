import * as crypto from 'crypto';

import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { AnswerDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { Answer } from '../../models';
import { ERROR_CODE } from '../../utils/const';

export function postAdd(answerDb: AnswerDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const details = ctx.request.body;

        if (!details) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Malformed request');
            return;
        }
        
        const timestamp = (Date.now() / 1000);

        // Extract answer fields
        const answer: Answer = {
            _id: crypto
                .createHash('sha256')
                .update(`${details.user}:${Date.now()}:${Math.random()}`, 'utf8')
                .digest()
                .toString('hex'),
            user: ctx.state.user,
            body: details.body,
            questionId: null,
            isAccepted: details.is_accepted,
            timestamp: details.timestamp,
            media: details.media,
            upvoteIds: [],
            downvoteIds: []
        };

        // TODO: Check for duplicate answers?

        // Insert answer
        try {
            await answerDb.insert(answer);

            ctx.status = 200;
            ctx.body = sendSuccess('Successfully added answer');
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}
