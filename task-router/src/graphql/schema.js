// this file will tell what will be the structure of our data

export const typeDefs = `#graphql
  type SendResponse {
    status: String!
    traceId: ID!
    messageId: ID!
  }

  enum ChannelType{
    email
    sms
    whatsapp
  }

  input SendMessageInput {
    channel: ChannelType!
    to: String!
    body: String!
  }

  
  type Query {
    portStatus: String!
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): SendResponse!
  }
`;
