import { gql } from "graphql-tag";

export const GET_EVENT_CHALLENGES = gql`
  query GetEventChallenges($eventId: uuid!) {
    challenges(
      where: { event_id: { _eq: $eventId } }
      order_by: { sort_order: asc }
    ) {
      id
      event_id
      title
      description
      icon
      is_required
      sort_order
    }
  }
`;
