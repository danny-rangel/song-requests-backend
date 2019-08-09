import { extractFragmentReplacements } from 'prisma-binding';
import Query from './Query';
import Mutation from './Mutation';
// import Subscription from './Subscription';
import User from './User';
import Song from './Song';

const resolvers = {
    Query,
    Mutation,
    // Subscription,
    User,
    Song
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
