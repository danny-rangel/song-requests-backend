import jwt from 'jsonwebtoken';

const generateToken = userInfo => {
    return jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 30,
            channel_id: userInfo.channel_id,
            user_id: process.env.DEV_ID,
            role: 'external',
            pubsub_perms: {
                send: ['*']
            }
        },
        Buffer.from(process.env.JWT_SECRET, 'base64'),
        {
            algorithm: 'HS256'
        }
    );
};

export { generateToken as default };
