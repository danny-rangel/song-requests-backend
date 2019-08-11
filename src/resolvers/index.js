import { extractFragmentReplacements } from 'prisma-binding';
import Query from './Query';
import Mutation from './Mutation';
// import Subscription from './Subscription';
import Broadcaster from './Broadcaster';
import User from './User';
import Song from './Song';
import QueueSong from './QueueSong';

const resolvers = {
    Query,
    Mutation,
    // Subscription,
    Broadcaster,
    User,
    Song,
    QueueSong
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
