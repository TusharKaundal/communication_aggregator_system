import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { createRabbitMQ } from "./utils/rabbitmq.js";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";

dotenv.config();

async function startServer() {
  const rabbit = await createRabbitMQ();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    context: async () => ({ rabbit }),
    listen: { port: process.env.PORT || 4000 },
  });

  console.log(`Server ready at: ${url}`);
}

startServer();
