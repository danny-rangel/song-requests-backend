import getUserId from '../utils/getUserId';

const Query = {
    users(parent, args, { prisma }, info) {
        const operationArgs = {
            first: args.first,
            skip: args.skip,
            after: args.after,
            orderBy: args.orderBy
        };

        if (args.query) {
            operationArgs.where = {
                OR: [
                    {
                        name_contains: args.query
                    }
                ]
            };
        }

        return prisma.query.users(operationArgs, info);
    },
    me(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);

        return prisma.query.user({
            where: {
                id: userId
            }
        });
    }
};

export { Query as default };
