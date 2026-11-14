import { test, expect } from '@playwright/test';
import { StatusCodes } from 'http-status-codes';

const baseURL = 'http://localhost:3000/users';

test('all users: should return empty array when no users', async ({ request }) => {
  const response = await request.get(baseURL);
  expect(response.status()).toBe(StatusCodes.OK);

  const users: Array<{ id: number }> = await response.json();
  for (const user of users) {
    const deleteResponse = await request.delete(`${baseURL}/${user.id}`);
    expect(deleteResponse.status()).toBe(StatusCodes.OK);
  }

  const responseAfterCleanup = await request.get(baseURL);
  expect(responseAfterCleanup.status()).toBe(StatusCodes.OK);
  expect(await responseAfterCleanup.json()).toEqual([]);
});
