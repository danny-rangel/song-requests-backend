import getUserInfo from '../utils/getUserInfo';

const User = {
    // email: {
    //     fragment: 'fragment userId on User { id }',
    //     resolve(parent, args, { request }, info) {
    //         const userId = getUserInfo(request, false);
    //         if (userId && userId === parent.id) {
    //             return parent.email;
    //         } else {
    //             return null;
    //         }
    //     }
    // }
};

export { User as default };
