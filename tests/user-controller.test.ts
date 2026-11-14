import { test, expect, type APIRequestContext } from '@playwright/test';
import { StatusCodes } from 'http-status-codes';

const baseURL = 'http://localhost:3000/users';

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

test.describe('User management API', () => {
  const cleanupUsers = async (
    request: APIRequestContext,
    users: Array<Pick<User, 'id'>>,
  ): Promise<void> => {
    for (const user of users) {
      const response = await request.delete(`${baseURL}/${user.id}`);
      expect(response.status()).toBe(StatusCodes.OK);
    }
  };

  test('find user: should return a user by ID', async ({ request }) => {
    const createResponse = await request.post(baseURL);
    expect(createResponse.status()).toBe(StatusCodes.CREATED);
    const user: User = await createResponse.json();

    try {
      const response = await request.get(`${baseURL}/${user.id}`);
      expect(response.status()).toBe(StatusCodes.OK);
      expect(await response.json()).toEqual(user);
    } finally {
      await cleanupUsers(request, [user]);
    }
  });

  test('find user: should return 404 if user not found', async ({ request }) => {
    const response = await request.get(`${baseURL}/999999`);
    expect(response.status()).toBe(StatusCodes.NOT_FOUND);
    expect(await response.json()).toEqual({ message: 'User not found' });
  });

  test('create user: should add a new user', async ({ request }) => {
    const response = await request.post(baseURL);
    expect(response.status()).toBe(StatusCodes.CREATED);
    const user: User = await response.json();

    try {
      expect(user).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        phone: expect.any(String),
      });

      const allUsersResponse = await request.get(baseURL);
      expect(allUsersResponse.status()).toBe(StatusCodes.OK);
      expect(await allUsersResponse.json()).toContainEqual(user);
    } finally {
      await cleanupUsers(request, [user]);
    }
  });

  test('delete user: should delete a user by ID', async ({ request }) => {
    const createResponse = await request.post(baseURL);
    expect(createResponse.status()).toBe(StatusCodes.CREATED);
    const user: User = await createResponse.json();

    const deleteResponse = await request.delete(`${baseURL}/${user.id}`);
    expect(deleteResponse.status()).toBe(StatusCodes.OK);
    expect(await deleteResponse.json()).toEqual([user]);

    const findResponse = await request.get(`${baseURL}/${user.id}`);
    expect(findResponse.status()).toBe(StatusCodes.NOT_FOUND);
    expect(await findResponse.json()).toEqual({ message: 'User not found' });
  });

  test('delete user: should return 404 if user not found', async ({ request }) => {
    const response = await request.delete(`${baseURL}/999999`);
    expect(response.status()).toBe(StatusCodes.NOT_FOUND);
    expect(await response.json()).toEqual({ message: 'User not found' });
  });
});
