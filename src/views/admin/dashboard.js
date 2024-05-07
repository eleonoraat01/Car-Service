import page from 'page';
import { until } from 'lit/directives/until.js';
import { adminDashboard as template } from '../../templates';
import { getQueryParam, notice } from '../../utilities';
import { getRepairs, getAllUsers } from '../../api';

/**
 * @description Renders the `admin` page.
 * @param {Context} ctx - The context object.
 */
export async function adminPage(ctx) {
  page.base(import.meta.env.VITE_APP_HOST_URL);

  const { page: pageNumber = '1' } = getQueryParam(ctx.querystring);

  ctx.render(until((async () => {
    const data = await getPageData(Number(pageNumber));
    if (!data) return;

    return template({ ...data, onBrowseAsUser });
  })(), notice.showLoading()));
}

/**
 * @description Retrieves data for the page.
 * @param {number} pageNumber - The page number to retrieve data for.
 * @returns {Promise<{users: Array<UserAuthData>, numberOfUsers: number, repairs: RepairsData, pageNumber: number } | undefined>} A promise that resolves to an array containing the data for all users and repairs.
 */
async function getPageData(pageNumber) {
  try {
    const [{ results, count }, repairsData] = await Promise.all([
      getAllUsers(pageNumber),
      getAllRepairsData()
    ]);

    return { users: results, numberOfUsers: count, repairs: repairsData, pageNumber };
  } catch (error) {
    const errorMessages = error instanceof Error ? error.message : 'Възникна грешка, моля опитайте по-късно';
    notice.showToast({ text: errorMessages, type: 'error' });
  } finally {
    notice.hideLoading();
  }
}

/**
 * @description Redirects to the user page.
 * @param {Event} event - The click event.
 * @param {UserAuthData} chosenUser - The chosen user.
 */
function onBrowseAsUser(event, chosenUser) {
  event.preventDefault();

  const base = import.meta.env.VITE_APP_HOST_URL;

  page.base(`${base}/admin/${chosenUser.objectId}`);
  page.redirect('/cars');
}

/**
 * @description Retrieves repairs data and calculates profit and count for each owner.
 * @returns {Promise<RepairsData>} An object containing profit and count for each owner.
 */
async function getAllRepairsData() {
  const repairs = await getRepairs();

  return repairs.reduceRight((acc, obj) => {
    const username = obj.owner.username;

    if (!acc[username]) {
      acc[username] = { profit: 0, count: 0 };
    }

    acc[username].profit += Number(obj.profit);
    acc[username].count++;

    return acc;
  }, {});
}

/**
 * @typedef {Record<string, { profit: number, count: number }>} RepairsData
 */