// this file will tell what will be the structure of our data

import { gql } from "graphql-tag";

const typeDefs = gql`
  type SendResponse {
    status: String!
    traceId: ID!
    messageId: ID!
  }

  input SendMessageInput {
    channel: String! # email | sms | whatsapp
    to: String!
    body: String!
  }

  type Query {
    health: String!
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): SendResponse!
  }
`;

module.exports = typeDefs;
