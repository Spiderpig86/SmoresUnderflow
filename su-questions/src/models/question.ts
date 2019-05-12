export interface Question {
    _id: string;
    title: string;
    body: string;
    score: number;
    tags: string[];
    answers: string[];
    user: {
        _id: string;
        username: string;
        email: string;
        reputation: number;
    };
    acceptedAnswer: string | null;
    timestamp: number;
    media: string[];
    viewCount: number;
    viewedIds: string[]; // Stores those who have seen question by IP/username
    upvoteIds: string[];
    downvoteIds: string[];
}

export interface FrontendQuestion {
    id: string;
    user: {
        id: string;
        username: string;
        reputation: number;
    };
    title: string;
    body: string;
    score: number;
    view_count: number;
    answer_count: number;
    timestamp: number;
    media: string[];
    tags: string[];
    accepted_answer_id: string;
    upvoteIds: string[];
    downvoteIds: string[]
}
