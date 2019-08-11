import getUserInfo from '../utils/getUserInfo';

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
                const broadcaster = await prisma.mutation.createBroadcaster({
                    data: {
                        id: userInfo.user_id,
                        isMod: true
                    }
                });

                return {
                    token,
                    broadcaster
                };
            } else {
                const broadcaster = await prisma.query.broadcaster({
                    where: { id: userInfo.user_id }
                });

                return {
                    token,
                    broadcaster
                };
            }
        } else {
            const user = {
                id: userInfo.opaque_user_id,
                userId: userInfo.user_id,
                role: userInfo.role,
                isMod: false,
                hasSharedId: userInfo.hasSharedId
            };
            return {
                token,
                user
            };
        }
    }
    // users(parent, args, { prisma }, info) {
    //     const operationArgs = {
    //         first: args.first,
    //         skip: args.skip,
    //         after: args.after,
    //         orderBy: args.orderBy
    //     };
    //     if (args.query) {
    //         operationArgs.where = {
    //             OR: [
    //                 {
    //                     name_contains: args.query
    //                 }
    //             ]
    //         };
    //     }
    //     return prisma.query.users(operationArgs, info);
    // },
};

export { Query as default };
