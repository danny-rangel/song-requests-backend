import getUserInfo from '../utils/getUserInfo';
import axios from 'axios';

const Query = {
    broadcaster(parent, args, { prisma }, info) {
        const operationArgs = {};
        if (args.id) {
            operationArgs.where = {
                id: args.id
            };
        }
        return prisma.query.broadcaster(operationArgs, info);
    },
    async me(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        if (userInfo.role === 'broadcaster') {
            const broadcasterExists = await prisma.exists.Broadcaster({
                id: userInfo.user_id
            });

            if (!broadcasterExists) {
                const res = await axios.get(
                    `https://api.twitch.tv/helix/users?id=${userInfo.user_id}`,
                    {
                        headers: {
                            'Client-ID': process.env.CLIENT_ID
                        }
                    }
                );

                const broadcaster = await prisma.mutation.createBroadcaster({
                    data: {
                        id: userInfo.user_id,
                        isMod: userInfo.isMod,
                        username: res.data.data[0].display_name,
                        profileImage: res.data.data[0].profile_image_url
                    }
                });

                return {
                    token,
                    broadcaster,
                    channelId: userInfo.channel_id
                };
            } else {
                const broadcaster = await prisma.query.broadcaster({
                    where: { id: userInfo.user_id }
                });

                return {
                    token,
                    broadcaster,
                    channelId: userInfo.channel_id
                };
            }
        } else {
            const user = {
                id: userInfo.opaque_user_id,
                userId: userInfo.user_id,
                role: userInfo.role,
                isMod: userInfo.isMod,
                hasSharedId: userInfo.hasSharedId
            };
            return {
                token,
                user,
                channelId: userInfo.channel_id
            };
        }
    },
    songs(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);
        const operationArgs = {
            first: args.first,
            skip: args.skip,
            orderBy: args.orderBy
        };

        if (args.query) {
            operationArgs.where = {
                AND: [
                    {
                        broadcaster: {
                            id: userInfo.channel_id
                        }
                    }
                ],
                OR: [
                    {
                        title_contains: args.query
                    },
                    {
                        artist_contains: args.query
                    }
                ]
            };
        }

        return prisma.query.songs(operationArgs, info);
    },
    async songCount(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const songs = await prisma.query.songs({
            where: {
                broadcaster: {
                    id: userInfo.channel_id
                }
            }
        });

        return songs.length;
    },
    queueSongs(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const operationArgs = {
            first: args.first,
            skip: args.skip,
            orderBy: args.orderBy,
            where: {
                broadcaster: {
                    id: userInfo.user_id
                }
            }
        };

        return prisma.query.queueSongs(operationArgs, info);
    },
    async queueSongCount(parent, args, { prisma, request }, info) {
        const { userInfo, token } = getUserInfo(request);

        const queueSongs = await prisma.query.queueSongs({
            where: {
                broadcaster: {
                    id: userInfo.user_id
                }
            }
        });

        return queueSongs.length;
    }
};

export { Query as default };
