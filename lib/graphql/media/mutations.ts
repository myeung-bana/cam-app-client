import { gql } from "graphql-tag";

export const INSERT_MEDIA = gql`
  mutation InsertGuestMedia($object: media_insert_input!) {
    insert_media_one(object: $object) {
      id
      event_id
      file_url
      storage_file_id
      file_type
      filter_applied
      challenge_id
      uploaded_at
    }
  }
`;
