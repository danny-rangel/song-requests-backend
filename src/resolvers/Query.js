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
    // me(parent, args, { prisma, request }, info) {
    //     const userId = getUserInfo(request);
    //     return prisma.query.user({
    //         where: {
    //             id: userId
    //         }
    //     });
    // }
};

export { Query as default };
