// import 'core-js';
// import 'regenerator-runtime/runtime';
// import 'cross-fetch/polyfill';
// import prisma from '../src/prisma';
// import seedDatabase, { userOne } from './utils/seedDatabase';
// import getClient from './utils/getClientWithoutSubs';
// import { createUser, getUsers, login, getProfile } from './utils/operations';

// const client = getClient();

// beforeEach(seedDatabase);

// test('Should create a new user', async () => {
//     const variables = {
//         data: {
//             name: 'Danny',
//             email: 'danny@example.com',
//             password: 'testpassword123'
//         }
//     };

//     const response = await client.mutate({
//         mutation: createUser,
//         variables
//     });

//     const exists = await prisma.exists.User({
//         id: response.data.createUser.user.id
//     });
//     expect(exists).toBe(true);
// });

// test('Should expose public author profiles', async () => {
//     const response = await client.query({
//         query: getUsers
//     });

//     expect(response.data.users.length).toBe(2);
//     expect(response.data.users[0].email).toBe(null);
//     expect(response.data.users[0].name).toBe('Sarah');
// });

// test('Should not login with bad credentials', async () => {
//     console.warn = jest.fn();
//     const variables = {
//         data: {
//             email: 'jen@example.com',
//             password: 'fdhjsafhad'
//         }
//     };

//     await expect(
//         client.mutate({ mutation: login, variables })
//     ).rejects.toThrow();
//     expect(console.warn).toHaveBeenCalled();
// });

// test('Should not signup with invalid password', async () => {
//     const variables = {
//         data: {
//             name: 'Bob',
//             email: 'bob@example.com',
//             password: 'abc'
//         }
//     };

//     await expect(
//         client.mutate({ mutation: createUser, variables })
//     ).rejects.toThrow();
// });

// test('Should fetch user profile', async () => {
//     const client = getClient(userOne.jwt);

//     const { data } = await client.query({ query: getProfile });

//     expect(data.me.id).toBe(userOne.user.id);
//     expect(data.me.name).toBe(userOne.user.name);
//     expect(data.me.email).toBe(userOne.user.email);
// });
