import jwt from 'jsonwebtoken';

const getUserInfo = (request, requireAuth = true) => {
    const header = request.request.headers.authorization;

    if (header) {
        const token = header.replace('Bearer ', '');
        const secret = Buffer.from(process.env.JWT_SECRET, 'base64');
        const { opaque_user_id, role, user_id, channel_id } = jwt.verify(
            token,
            secret
        );
        let isMod = false;
        let hasSharedId = false;

        if (role === 'broadcaster' || role === 'moderator') {
            isMod = true;
        }

        if (user_id) {
            hasSharedId = true;
        }

        const userInfo = {
            role,
            user_id,
            opaque_user_id,
            isMod,
            hasSharedId,
            channel_id
        };

        return {
            userInfo,
            token
        };
    }

    if (requireAuth) {
        throw new Error('Authentication required');
    }

    return null;
};

export { getUserInfo as default };
