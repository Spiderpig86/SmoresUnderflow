import { Question, FrontendQuestion, User } from '../../models';
import { FrontendAnswer, Answer } from '../../models';

export function toFrontend(question: Question, user: User) {
  return {
    id: question._id,
    user: {
      id: user._id,
      username: user.username,
      reputation: user.reputation,
    },
    title: question.title,
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
  } as FrontendQuestion;
}

export function toFrontendAnswer(answer: Answer, user: User) {
  return {
    id: answer._id,
    user: answer.user.username,
    userBody: {
      id: answer.user._id,
      username: answer.user.username,
      reputation: user.reputation
    },
    body: answer.body,
    score: answer.upvoteIds.length - answer.downvoteIds.length,
    questionId: answer.questionId,
    is_accepted: answer.isAccepted,
    timestamp: answer.timestamp,
    media: answer.media,
    upvoteIds: answer.upvoteIds,
    downvoteIds: answer.downvoteIds
  } as FrontendAnswer;
}
