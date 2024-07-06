import { ApolloServer, gql } from "apollo-server";
import { ApolloServer as ApolloServerLambda } from "apollo-server-lambda";

import admin, { ServiceAccount } from "firebase-admin";

// ---------------------------------------- TODO: THIS REPO MUST BE PRIVATE!!!

// Initialize Firebase Admin SDK
import serviceAccount from "./serviceAccountKey.json";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const db = admin.firestore();

const typeDefs = gql`
  type Query {
    collections: [Collection!]!
    collection(id: ID!): Collection
    getCollectionsByTitle(title: String): Collection
  }

  type Collection {
    id: ID!
    title: String!
    items: [Item!]!
  }

  type Item {
    id: ID!
    name: String!
    price: Float!
    imageUrl: String!
    collection: Collection
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    collections: async () => {
      const snapshot = await db.collection("categories").get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.id,
        items: doc.data().items,
      }));
    },
    collection: async (_, { id }) => {
      const doc = await db
        .collection("categories")
        .doc(id)
        .get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        title: doc.id,
        items: doc.data().items,
      };
    },
    getCollectionsByTitle: async (_, { title }) => {
      const doc = await db
        .collection("categories")
        .doc(title.toLowerCase())
        .get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        title: doc.id,
        items: doc.data().items,
      };
    },
  },
};

function createLambdaServer() {
  return new ApolloServerLambda({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });
}

function createLocalServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });
}

export { createLambdaServer, createLocalServer };
