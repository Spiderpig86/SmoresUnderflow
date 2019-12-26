
export interface User {
    _id: string; // TODO: May not be needed (hashed string of username + email)
    username: string;
    email: string;
    password: string;
    verified: boolean;
    token: string;
    reputation: number;
    questions: string[];
    answers: string[];
}
