export interface Question {
    _id: string;
    title: string;
    body: string;
    tags: string[];
    score: number;
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
    downvoteIds: string[]
  }
  