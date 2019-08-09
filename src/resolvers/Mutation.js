import getUserInfo from '../utils/getUserInfo';

const Mutation = {
    async login(parent, args, { prisma, request }, info) {
        const userInfo = getUserInfo(request);
        const userId = userInfo.decoded.user_id;

        if (userInfo.decoded.role === 'broadcaster') {
            const userExists = await prisma.exists.User({ id: userId });

            if (!userExists) {
                const user = await prisma.mutation.createUser({
                    data: {
                        id: userId
                    }
                });

                return {
                    token: userInfo.token,
                    user
                };
            } else {
                const existingUser = await prisma.query.user({
                    where: { id: userId }
                });

                return {
                    token: userInfo.token,
                    user: existingUser
                };
            }
        }
    },
    deleteUser(parent, args, { prisma, request }, info) {
        const userInfo = getUserInfo(request);
        const userId = userInfo.decoded.user_id;

        return prisma.mutation.deleteUser({ where: { id: userId } }, info);
    },
    createSong(parent, { data }, { prisma, request }, info) {
        const userInfo = getUserInfo(request);
        const userId = userInfo.decoded.user_id;

        return prisma.mutation.createSong(
            {
                data: {
                    name: data.name,
                    artist: data.artist,
                    requestedAmount: 0,
                    user: {
                        connect: {
                            id: userId
                        }
                    }
                }
            },
            info
        );
    },
    addSongToQueue(parent, { songId }, { prisma, request }, info) {
        const userInfo = getUserInfo(request);
        const userId = userInfo.decoded.user_id;

        // check if song is in queue already

        return prisma.mutation.createQueueSong(
            {
                data: {
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    song: {
                        connect: {
                            id: songId
                        }
                    }
                }
            },
            info
        );
    },
    deleteAllSongsInQueue(parent, args, { prisma, request }, info) {
        const userInfo = getUserInfo(request);
        const userId = userInfo.decoded.user_id;

        return prisma.mutation.deleteManyQueueSongs(
            {
                where: {
                    user: {
                        id: userId
                    }
                }
            },
            info
        );
    },
    deleteSongInQueue(parent, { queueId }, { prisma }, info) {
        return prisma.mutation.deleteQueueSong(
            {
                where: {
                    id: queueId
                }
            },
            info
        );
    },
    deleteSong(parent, { songId }, { prisma, request }, info) {
        const userInfo = getUserInfo(request);
        const userId = userInfo.decoded.user_id;

        return prisma.mutation.updateUser(
            {
                data: {
                    songs: {
                        delete: {
                            id: songId
                        }
                    }
                },
                where: {
                    id: userId
                }
            },
            info
        );
    },
    updateSong(parent, { data }, { prisma, request }, info) {
        const userInfo = getUserInfo(request);
        const userId = userInfo.decoded.user_id;

        return prisma.mutation.updateUser(
            {
                data: {
                    songs: {
                        update: {
                            where: {
                                id: data.songId
                            },
                            data: {
                                name: data.name,
                                artist: data.artist
                            }
                        }
                    }
                },
                where: {
                    id: userId
                }
            },
            info
        );
    }
};

export { Mutation as default };
