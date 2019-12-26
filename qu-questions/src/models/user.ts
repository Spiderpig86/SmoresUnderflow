export interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    verified: boolean;
    token: string;
    reputation: number;
    questions: string[];
    answers: string[];
  }
  