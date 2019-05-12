import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { createTransport } from 'nodemailer';

function listen() {
    amqp.connect(`amqp://localhost`, (err: any, conn: Connection) => {
        console.log('mail connecting');
        conn.createChannel((err: any, ch: Channel) => {
            console.log('channel created');
            const queueName = 'mail';
            ch.assertQueue(queueName, { exclusive: false, durable: false });

            ch.consume(queueName, (msg: amqp.Message) => {
                console.log(`Received request to mail ${msg.content.toString()}`);

                const details = JSON.parse(msg.content.toString());

                const mail = {
                    from: SERVICE.email,
                    to: String(details.email),
                    subject: SERVICE.title,
                    text: generateMailBody(String(details.email), String(details.token))
                };

                const transporter = createTransport({
                    port: 25,
                    host: 'localhost',
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                transporter.sendMail(mail);

            }, { noAck: false });

        });
    });
}

const SERVICE = {
    host: 'cloud.cloud.compas.cs.stonybrook.edu',
    email: 'smores.overflow@gmail.com',
    password: 'stanleythemanly',
    title: 'Verify your account at SMORES'
};

function generateMailBody(email: string, verificationToken: string): string {
    return `validation key: <${verificationToken}>
        `;
}

listen();