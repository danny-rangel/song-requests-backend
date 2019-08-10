import getUserInfo from '../utils/getUserInfo';

const Query = {
    user(parent, args, { prisma }, info) {
        const operationArgs = {};
        if (args.id) {
            operationArgs.where = {
                id: args.id
            };
        }
        return prisma.query.user(operationArgs, info);
    },
    async me(parent, args, { prisma, request }, info) {
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
