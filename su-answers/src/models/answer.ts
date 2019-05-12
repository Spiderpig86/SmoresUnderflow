export interface Answer {
    _id: string;
    user: {
        _id: string;
        username: string;
        reputation: number;
    };
    body: string;
    questionId: string;
    isAccepted: boolean;
    timestamp: number; // UNIX timestamp
    media: string[]; // List of media IDs
    upvoteIds: string[];
    downvoteIds: string[];
}

export interface FrontendAnswer {
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
