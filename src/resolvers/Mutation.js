import getUserInfo from '../utils/getUserInfo';

const Mutation = {
    deleteBroadcaster(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        return prisma.mutation.deleteBroadcaster(
            { where: { id: userInfo.user_id } },
            info
        );
    },
    async createSong(parent, { data }, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const song = await prisma.mutation.createSong(
            {
                data: {
                    title: data.title,
                    artist: data.artist,
                    requestedAmount: 0,
                    broadcaster: {
                        connect: {
                            id: userInfo.user_id
                        }
                    }
                }
            },
            info
        );

        const songs = await prisma.query.songs({
            where: {
                broadcaster: {
                    id: userInfo.user_id
                }
            }
        });

        await prisma.mutation.updateBroadcaster({
            data: {
                songCount: songs.length
            },
            where: {
                id: userInfo.user_id
            }
        });

        return song;
    },
    async addSongToQueue(parent, { songId }, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const songInQueue = await prisma.exists.QueueSong({
            id: songId
        });

        if (!userInfo.hasSharedId) {
            throw new Error('You must be logged in!');
        }

        if (songInQueue) {
            throw new Error('Song is already in queue!');
        }

        return prisma.mutation.createQueueSong(
            {
                data: {
                    id: songId,
                    broadcaster: {
                        connect: {
                            id: userInfo.channel_id
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
        const { userInfo, token } = getUserInfo(request);

        return prisma.mutation.deleteManyQueueSongs(
            {
                where: {
                    broadcaster: {
                        id: userInfo.user_id
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
        const { userInfo, token } = getUserInfo(request);

        return prisma.mutation.updateBroadcaster(
            {
                data: {
                    songs: {
                        delete: {
                            id: songId
                        }
                    }
                },
                where: {
                    id: userInfo.user_id
                }
            },
            info
        );
    },
    updateSong(parent, { data }, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        return prisma.mutation.updateBroadcaster(
            {
                data: {
                    songs: {
                        update: {
                            where: {
                                id: data.songId
                            },
                            data: {
                                title: data.title,
                                artist: data.artist
                            }
                        }
                    }
                },
                where: {
                    id: userInfo.user_id
                }
            },
            info
        );
    }
};

export { Mutation as default };
