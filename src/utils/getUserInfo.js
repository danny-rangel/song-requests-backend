import jwt from 'jsonwebtoken';

const getUserInfo = (request, requireAuth = true) => {
    const header = request.request.headers.authorization;

    if (header) {
        const token = header.replace('Bearer ', '');
        const secret = Buffer.from(process.env.JWT_SECRET, 'base64');
        const decoded = jwt.verify(token, secret);
        return {
            decoded,
            token
        };
    }

    if (requireAuth) {
        throw new Error('Authentication required');
    }

    return null;
};

export { getUserInfo as default };
