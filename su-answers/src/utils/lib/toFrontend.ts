import { Answer, User } from '../../models';

export function toFrontend(answer: Answer, user: User) {
    return {
        id: answer._id,
        user: {
            id: answer._id,
            username: user.username,
            reputation: user.reputation
        },
        body: answer.body,
        is_accepted: answer.isAccepted,
        media: answer.media,
        score: answer.upvoteIds.length - answer.downvoteIds.length,
        timestamp: answer.timestamp
    }
}