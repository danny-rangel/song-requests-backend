import bcrypt from 'bcryptjs';
import hashPassword from '../utils/hashPassword';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';

const Mutation = {
    async createUser(parent, args, { prisma }, info) {
        const emailTaken = await prisma.exists.User({ email: args.data.email });

        if (emailTaken) {
            throw new Error('Email taken!');
        }

        const password = await hashPassword(args.data.password);

        const user = await prisma.mutation.createUser({
            data: {
                ...args.data,
                password
            }
        });

        return {
            user,
            token: generateToken(user.id)
        };
    },
    async login(
        parent,
        {
            data: { email, password }
        },
        { prisma },
        info
    ) {
        const user = await prisma.query.user({ where: { email } });
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            throw new Error('Unable to login!');
        }

        return {
            user,
            token: generateToken(user.id)
        };
    },
    async deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);

        return prisma.mutation.deleteUser({ where: { id: userId } }, info);
    },
    async updateUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);

        if (typeof args.data.password === 'string') {
            args.data.password = await hashPassword(args.data.password);
        }

        return prisma.mutation.updateUser(
            {
                where: {
                    id: userId
                },
                data: args.data
            },
            info
        );
    },
    async createSong(parent, args, ctx, info) {
        return;
    }
};

export { Mutation as default };
