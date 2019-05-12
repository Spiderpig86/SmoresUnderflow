import { Question, FrontendQuestion, User } from '../../models';

export function toFrontend(question: Question, user: User) {
  return {
    id: question._id,
    user: {
      id: user._id,
      username: user.username,
      reputation: user.reputation,
    },
    view_count: question.viewCount,
    answer_count: question.answers.length,
    accepted_answer_id: question.acceptedAnswer
      ? question.acceptedAnswer
      : null,
    body: question.body,
    score: question.upvoteIds.length - question.downvoteIds.length,
    timestamp: question.timestamp,
    media: question.media,
    tags: question.tags,
    title: question.title
  } as FrontendQuestion;
}