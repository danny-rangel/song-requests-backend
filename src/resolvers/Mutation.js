import axios from 'axios';
import getUserInfo from '../utils/getUserInfo';
import generateToken from '../utils/generateToken';

const Mutation = {
    deleteBroadcaster(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        return prisma.mutation.deleteBroadcaster(
            { where: { id: userInfo.user_id } },
            info
        );
    },
    updateBroadcasterSettings(
        parent,
        { queueIsClosed, subMode, bitsOnly, bitPriority, oneRequestPerUser },
        { prisma, request },
        info
    ) {
        const { userInfo, token } = getUserInfo(request);

        return prisma.mutation.updateBroadcaster({
            data: {
                queueIsClosed,
                subMode,
                bitsOnly,
                bitPriority,
                oneRequestPerUser
            },
            where: {
                id: userInfo.user_id
            }
        });
    },
    async createSong(parent, { title, artist }, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const song = await prisma.mutation.createSong(
            {
                data: {
                    title: title,
                    artist: artist,
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

        const oldUser = await prisma.query.broadcaster(
            {
                where: {
                    id: userInfo.user_id
                }
            },
            '{ songCount }'
        );

        await prisma.mutation.updateBroadcaster({
            data: {
                songCount: oldUser.songCount + 1
            },
            where: {
                id: userInfo.user_id
            }
        });

        try {
            await axios.post(
                `https://api.twitch.tv/extensions/message/${
                    userInfo.channel_id
                }`,
                {
                    content_type: 'application/json',
                    message: 'newSong',
                    targets: ['broadcast']
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Client-ID': process.env.CLIENT_ID,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.log('ERROR:', err);
        }

        return song;
    },
    async addSongToQueue(parent, { songId }, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const queueIsClosed = await prisma.query.broadcaster(
            {
                where: {
                    id: userInfo.channel_id
                }
            },
            '{ queueIsClosed, oneRequestPerUser, subMode }'
        );

        if (queueIsClosed.queueIsClosed) {
            throw new Error('Queue is currently closed!');
        }

        // if (queueIsClosed.subMode && !subscriber) {
        // throw new Error('Sub mode only right now!')
        // }

        const songInQueue = await prisma.exists.QueueSong({
            id: songId
        });

        if (!userInfo.hasSharedId) {
            throw new Error(
                'The extension needs your permission to request songs! Update permissions below!'
            );
        }

        if (songInQueue) {
            throw new Error('Song is already in queue!');
        }

        let song = null;

        try {
            const res = await axios.get(
                `https://api.twitch.tv/helix/users?id=${userInfo.user_id}`,
                {
                    headers: {
                        'Client-ID': process.env.CLIENT_ID
                    }
                }
            );

            if (queueIsClosed.oneRequestPerUser) {
                const queueSongs = await prisma.query.broadcaster(
                    {
                        where: {
                            id: userInfo.channel_id
                        }
                    },
                    '{ queue { requestedBy } }'
                );

                queueSongs.queue.forEach(object => {
                    if (object.requestedBy === res.data.data[0].display_name) {
                        throw new Error('Can only request one song!');
                    }
                });
            }

            song = await prisma.mutation.createQueueSong(
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
                        },
                        requestedBy: res.data.data[0].display_name
                    }
                },
                info
            );

            const oldSong = await prisma.query.song(
                {
                    where: {
                        id: songId
                    }
                },
                '{ requestedAmount }'
            );

            await prisma.mutation.updateSong({
                data: {
                    requestedAmount: oldSong.requestedAmount + 1,
                    inQueue: true
                },
                where: {
                    id: songId
                }
            });

            await axios.post(
                `https://api.twitch.tv/extensions/message/${
                    userInfo.channel_id
                }`,
                {
                    content_type: 'application/json',
                    message: 'newQueueSong',
                    targets: ['broadcast']
                },
                {
                    headers: {
                        Authorization: `Bearer ${generateToken(userInfo)}`,
                        'Client-ID': process.env.CLIENT_ID,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return song;
        } catch (err) {
            throw new Error(err.message);
        }
    },
    async deleteAllSongsInQueue(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const res = await prisma.mutation.deleteManyQueueSongs(
            {
                where: {
                    broadcaster: {
                        id: userInfo.user_id
                    }
                }
            },
            info
        );

        await prisma.mutation.updateManySongs({
            data: {
                inQueue: false
            },
            where: {
                broadcaster: {
                    id: userInfo.user_id
                }
            }
        });

        try {
            await axios.post(
                `https://api.twitch.tv/extensions/message/${
                    userInfo.channel_id
                }`,
                {
                    content_type: 'application/json',
                    message: 'newQueueSong',
                    targets: ['broadcast']
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Client-ID': process.env.CLIENT_ID,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.log('ERROR:', err);
        }

        return res;
    },
    async deleteSongInQueue(
        parent,
        { queueId, songId },
        { prisma, request },
        info
    ) {
        const { userInfo, token } = getUserInfo(request);

        const res = await prisma.mutation.deleteQueueSong(
            {
                where: {
                    id: queueId
                }
            },
            info
        );

        await prisma.mutation.updateSong({
            data: {
                inQueue: false
            },
            where: {
                id: songId
            }
        });

        try {
            await axios.post(
                `https://api.twitch.tv/extensions/message/${
                    userInfo.channel_id
                }`,
                {
                    content_type: 'application/json',
                    message: 'removeQueueSong',
                    targets: ['broadcast']
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Client-ID': process.env.CLIENT_ID,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.log('ERROR:', err);
        }

        return res;
    },
    async deleteSong(parent, { songId }, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const oldUser = await prisma.query.broadcaster(
            {
                where: {
                    id: userInfo.user_id
                }
            },
            '{ songCount }'
        );

        const res = await prisma.mutation.updateBroadcaster(
            {
                data: {
                    songCount: oldUser.songCount - 1,
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

        try {
            await axios.post(
                `https://api.twitch.tv/extensions/message/${
                    userInfo.channel_id
                }`,
                {
                    content_type: 'application/json',
                    message: 'removeSong',
                    targets: ['broadcast']
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Client-ID': process.env.CLIENT_ID,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.log('ERROR:', err);
        }

        return res;
    },
    async updateSong(
        parent,
        { songId, title, artist },
        { prisma, request },
        info
    ) {
        const { userInfo, token } = getUserInfo(request);

        const res = await prisma.mutation.updateBroadcaster(
            {
                data: {
                    songs: {
                        update: {
                            where: {
                                id: songId
                            },
                            data: {
                                title: title,
                                artist: artist
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

        try {
            await axios.post(
                `https://api.twitch.tv/extensions/message/${
                    userInfo.channel_id
                }`,
                {
                    content_type: 'application/json',
                    message: 'removeSong',
                    targets: ['broadcast']
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Client-ID': process.env.CLIENT_ID,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.log('ERROR:', err);
        }

        return res;
    },
    async createFeedback(parent, { content }, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        if (!userInfo.hasSharedId) {
            throw new Error('You must be logged in!');
        }

        if (content.match(/^\s*$/)) {
            throw new Error('Nothing to say, huh?');
        }

        const res = await axios.get(
            `https://api.twitch.tv/helix/users?id=${userInfo.user_id}`,
            {
                headers: {
                    'Client-ID': process.env.CLIENT_ID
                }
            }
        );

        return prisma.mutation.createFeedback({
            data: {
                userId: userInfo.user_id,
                username: res.data.data[0].display_name,
                channelId: userInfo.channel_id,
                content
            }
        });
    }
};

export { Mutation as default };
