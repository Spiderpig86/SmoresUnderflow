con = new Mongo();
db = con.getDB('underflow');
db.users.insert([
  {
    _id: 'xx1',
    username: 'bob1',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,
    questions: [],
    answers: []
  },
  {
    _id: 'xx2',
    username: 'bob2',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,
    questions: [],
    answers: []
  },
  {
    _id: 'xx3',
    username: 'bob3',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,
    questions: [],
    answers: []
  },
  {
    _id: 'xx4',
    username: 'bob4',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,

    questions: [],
    answers: []
  },
  {
    _id: 'xx5',
    username: 'bob5',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,

    questions: [],
    answers: []
  },
  {
    _id: 'xx6',
    username: 'bob6',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,

    questions: [],
    answers: []
  },
  {
    _id: 'xx7',
    username: 'bob7',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,

    questions: [],
    answers: []
  },
  {
    _id: 'xx8',
    username: 'bob8',
    email: 'bob@bob.com',
    password: 'stan',
    verified: true,
    token: '123',
    reputation: 1,

    questions: [],
    answers: []
  }
]);
