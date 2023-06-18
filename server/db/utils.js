import { GraphQLError } from 'graphql';

export const toIsoDate = (date) => date.slice(0, 'YYYY-MM-DD'.length);

export const notFoundError = (message, entity) => {
  if (!entity) {
    throw new GraphQLError(message, {
      extensions: { code: 'NOT_FOUND' },
    });
  }
};

export const notAuthorizedError = (message) => {
  throw new GraphQLError(message, {
    extensions: { code: 'NOT_AUTHORIZED' },
  });
};
