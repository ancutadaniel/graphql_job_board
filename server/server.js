import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { authMiddleware, handleLogin } from './auth.js';
import { readFile } from 'node:fs/promises';
import { resolvers } from './resolvers.js';
import { getUser } from './db/users.js';
import { createCompanyLoader } from './db/companies.js';

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

// read schema from file
const typeDefs = await readFile('./schema.graphql', 'utf8');

// context function for apollo server passes auth info to resolvers
const getContext = async ({ req }) => {
  const companyLoader = createCompanyLoader();
  const context = { companyLoader };
  if (req.auth) {
    context.user = await getUser(req.auth.sub);
  }
  return context;
};

// create instance of ApolloServer
const apolloServer = new ApolloServer({ typeDefs, resolvers });
// start apollo server
await apolloServer.start();
// integrate apollo server with express app
app.use('/graphql', apolloMiddleware(apolloServer, { context: getContext }));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  console.log(`GraphQL running on port http://localhost:${PORT}/graphql`);
});
