import { gql } from "graphql-tag";

export const GET_SESSION_MEDIA = gql`
  query GetSessionMedia($sessionId: uuid!) {
    media(
      where: { session_id: { _eq: $sessionId } }
      order_by: { uploaded_at: desc }
    ) {
      id
      event_id
      file_url
      storage_file_id
      file_type
      filter_applied
      challenge_id
      uploaded_at
      is_hidden
      is_starred
    }
  }
`;
