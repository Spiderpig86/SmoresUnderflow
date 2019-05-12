import * as bcrypt from 'bcryptjs';
import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { IMiddleware } from 'koa-router';
import { createTransport } from 'nodemailer';

import { Context } from 'koa';
import { UserDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { Hash } from '../../utils/lib';
import { User } from '../../models';
import { SERVICE, generateMailBody } from '../../utils/verification-utils';
import { ERROR_CODE } from '../../utils/const';

export function postAddUser(userDb: UserDb, ch: Channel): IMiddleware {
    return async (ctx: Context) => {
        const details = ctx.request.body;
        console.info('/adduser', JSON.stringify(details));
        //console.time('adduser');
        if (!details) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Malformed request');
            return;
        }
        //console.time('adduser: inserting user');

        // Below will throw exception of request body does not have those fields
        const username = details.username;
        const email = details.email;
        const password = details.password;

        // const hash = new Hash();
        const user: User = {
            _id: username,
            username,
            email,
            // password: await hash.hashPassword(password),
            password,
            verified: false,
            token: bcrypt.genSaltSync(1),
            reputation: 1,
            questions: [],
            answers: [],
        };

        // Check for existing user for username and email
        try {
            if (await userDb.findByUsername(username)) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(
                    `User already exists with the username: ${username}`
                );
                return;
            }

            if (await userDb.findByEmail(email)) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(
                    `User already exists with the email: ${email}`
                );
                return;
            }
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }

        // Insert
        try {
            console.time('adduser: inserting user');
            await userDb.insert(user);
            console.timeEnd('adduser: inserting user');

            console.time('adduser: send email');
            // sendEmail(user);
            const queueName = 'mail';
            ch.sendToQueue(queueName, new Buffer(JSON.stringify(user)));
            console.timeEnd('adduser: send email');
            ctx.status = 200;
            ctx.body = sendSuccess('Successfully registered user', user);
            
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
        //console.timeEnd('adduser');
    };
}

async function sendEmail(user: User) {
    const transporter = createTransport({
        port: 25,
        host: 'localhost',
        tls: {
            rejectUnauthorized: false
        }
    });

    const mail = {
        from: SERVICE.email,
        to: String(user.email),
        subject: SERVICE.title,
        text: generateMailBody(String(user.email), String(user.token))
    };

    await transporter.sendMail(mail);
}
