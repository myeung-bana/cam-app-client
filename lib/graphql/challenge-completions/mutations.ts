import { gql } from "graphql-tag";

export const INSERT_CHALLENGE_COMPLETION = gql`
  mutation InsertChallengeCompletion($object: challenge_completions_insert_input!) {
    insert_challenge_completions_one(object: $object) {
      id
      challenge_id
      session_id
      media_id
      completed_at
    }
  }
`;

export const GET_SESSION_COMPLETIONS = gql`
  query GetSessionCompletions($sessionId: uuid!) {
    challenge_completions(where: { session_id: { _eq: $sessionId } }) {
      id
      challenge_id
      media_id
    }
  }
`;
