export interface IAppState {
    loginSuccess: boolean;
    token?: string;
    loginErrorMessage?: string;
    registerSuccess: boolean;
    registerErrorMessage?: string;
}

export type AppState = Readonly<IAppState>;

export interface ILoginState {
    isLoggedIn: boolean;
    token: string;
    loginErrorMessage: string;
}

export type LoginState = Readonly<ILoginState>;

export interface ILoginFormState {
    username: string;
    password: string;
}

export type LoginFormStateFields =
    | 'username'
    | 'password';

export type LoginFormState = Readonly<ILoginFormState>;

export interface IRegisterState {
    isRegistered: boolean;
    registerErrorMessage: string;
    username: string;
}

export type RegisterState = Readonly<IRegisterState>;

export interface IRegisterFormState {
    username: string;
    email: string;
    password: string;
    repeatPassword: string;
}

export type RegisterFormStateFields =
    | 'username'
    | 'email'
    | 'password'
    | 'repeatPassword';

export type RegisterFormState = Readonly<IRegisterFormState>;

export interface IUserState {
    _id: string;
    username: string;
    email: string;
    reputation: number;
    questions: string[]; // Question IDs
    answers: string[]; // Question answers
    viewedQuestions: string[]; // Not sure if needed to hold seen question IDs
}

export type UserState = Readonly<IUserState>;

export interface ISearchResult {
    _id: string;
    user: {
        id: string;
        username: string;
        reputation: number;
    };
    title: string;
    viewCount: number;
    answerCount: number;
    acceptedAnswerId: string | null;
    body: string;
    score: number,
    timestamp: number;
    tags: string[];
    media: string[];
}

export type SearchResultState = Readonly<ISearchResult>;

export interface IQuestion {
    id: string;
    user: {
        id: string;
        username: string;
        reputation: number;
    };
    title: string;
    view_count: number;
    answer_count: number;
    accepted_answer_id: string | null;
    body: string;
    score: number;
    timestamp: number;
    media: string[];
    tags: string[];
}

export type Question = Readonly<IQuestion>;

export interface IAnswer {
    id: string;
    user: string;
    userBody: {
        id: string;
        username: string;
        reputation: number;
    };
    body: string;
    score: number;
    questionId: string;
    is_accepted: boolean;
    timestamp: number;
    media: string[];
    upvoteIds: string[];
    downvoteIds: string[];
}

export type Answer = Readonly<IAnswer>;