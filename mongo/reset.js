con = new Mongo();
db = con.getDB('underflow');
db.questions.remove({});
db.users.remove({});
db.answers.remove({});
db.media.remove({});