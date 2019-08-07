import { extractFragmentReplacements } from 'prisma-binding';
import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';
import User from './User';
import Song from './Song';
import Queue from './Queue';

const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Song,
    Queue
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
