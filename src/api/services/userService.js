import * as api from '../api';
import { USER_ENDPOINTS } from '../endpoints';
import { memoization, updateNavigation } from '@utilities';
import config from '../../config';

const STORAGE_KEY = config.storageKeys.userService;
const SHOWN_USERS_PER_PAGE = config.adminDashboard.shownUsersPerPage;

/**
 * @description Performs a user login operation with the provided user credentials. Upon successful authentication, the user's information is stored in the session storage and the navigation bar is updated.
 * @param {UserLoginCredentials} data - User credentials.
 * @returns {Promise<UserAuthData & {isSuperUser: boolean}>} The result from the server.
 */
export async function login(data) {
  const response = /**@type {unknown}*/(await api.POST(USER_ENDPOINTS.LOGIN, data));
  const { result } = /**@type {{result: UserAuthData}}*/(response);

  const isSuperUser = result.roles.includes('Admin');

  await setUserData({
    username: data.username,
    id: result.objectId,
    token: result.sessionToken,
    isSuperUser
  });

  updateNavigation();

  return { isSuperUser, ...result };
}

/**
 * @description Performs a user registration operation with the provided user credentials. Upon successful authentication, the user's information is stored in the session storage and the navigation bar is updated.
 * @param {UserLoginCredentials} data - User credentials.
 * @returns {Promise<UserAuthData>} The result from the server.
 */
export async function register(data) {
  const result = /**@type {UserRegisterData}*/(await api.POST(USER_ENDPOINTS.REGISTER, data));

  await setUserData({
    username: data.username,
    id: result.objectId,
    token: result.sessionToken
  });

  updateNavigation();

  return { username: data.username, updatedAt: result.createdAt, roles: [], ...result };
}

/**
 * @description Performs a user logout operation. It removes the user data stored in the session storage and updates the navigation accordingly.
 * @returns {Promise<{}>} The result from the server.
 */
export async function logout() {
  const result = await api.POST(USER_ENDPOINTS.LOGOUT, {});

  await removeUserData();
  updateNavigation();

  return result;
}

/**
 * @description Retrieves all users from the server.
 * @param {number} [page] - The page number for pagination.
 * @returns {Promise<{results: Array<UserAuthData>, count: number}>} A promise that resolves to an array of user data.
 */
export async function getAllUsers(page) {
  const response = /**@type {unknown}*/(await api.POST(USER_ENDPOINTS.ALL_USERS, {}));
  const { result } = /**@type {{result: Array<UserAuthData>}}*/(response);

  const users = result
    .filter(user => !user.roles.includes('Admin'))
    .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));

  if (!page) return { results: users, count: users.length };

  const startIdx = (page - 1) * SHOWN_USERS_PER_PAGE;
  const endIdx = page * SHOWN_USERS_PER_PAGE;
  const paginatedResults = users.slice(startIdx, endIdx);

  return { results: paginatedResults, count: users.length };
}

/**
 * @description Checks whether user data exists in the session storage.
 * @returns {boolean} Returns true if user data is present, otherwise false.
 */
export function hasUserData() {
  return !!sessionStorage.getItem(STORAGE_KEY);
}

/**
 * @description Retrieves user data from the session storage.
 * @returns {UserStoredData | null} Returns the parsed user data if it exists, otherwise returns null.
 */
export function getUserData() {
  const STORAGE_KEY = config.storageKeys.userService; // To avoid circular dependency error
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
}

/**
 * @description Sets user data in the session storage.
 * @param {UserStoredData} data - The data to be stored in the session storage.
 */
export async function setUserData(data) {
  await memoization.deleteCache().catch(console.error);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * @description Removes user data from the session storage.
 */
export async function removeUserData() {
  await memoization.deleteCache().catch(console.error);
  sessionStorage.removeItem(STORAGE_KEY);
}