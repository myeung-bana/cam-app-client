import { gql } from "graphql-tag";

export const SUBSCRIBE_EVENT_MEDIA_COUNT = gql`
  subscription EventMediaCount($eventId: uuid!) {
    media_aggregate(where: { event_id: { _eq: $eventId } }) {
      aggregate {
        count
      }
    }
  }
`;
