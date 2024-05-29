import page from 'page';
import { until } from 'lit/directives/until.js';
import { adminDashboard as template } from '../../templates';
import { getQueryParam, makeQueryParam, notice } from '../../utilities';
import { getRepairs, getAllUsers } from '../../api';
import { getRangeOption } from '../../utilities/rangeOptions';

/**
 * @description Renders the `admin` page.
 * @param {Context} ctx - The context object.
 */
export async function adminPage(ctx) {
  page.base(import.meta.env.VITE_APP_HOST_URL);

  const { page: pageNumber = '1', userProfit, userRepairs } = /**@type {{page: string, userProfit: string, userRepairs: string}}*/(getQueryParam(ctx.querystring));

  ctx.render(until((async () => {
    const data = await getPageData(Number(pageNumber), userProfit, userRepairs);
    if (!data) return;

    return template({
      ...data,
      onBrowseAsUser,
      onRangeSelect: (e, type) => onRangeSelect(e, type, { userProfit, userRepairs })
    });
  })(), notice.showLoading()));
}

/**
 * @description Retrieves data for the page.
 * @param {number} pageNumber - The page number to retrieve data for.
 * @param {string} [userProfit] - The user profit query parameter.
 * @param {string} [userRepairs] - The user repairs query parameter.
 * @returns {Promise<{users: Array<UserAuthData>, numberOfUsers: number, repairs: RepairsData, pageNumber: number,userProfit: string, userRepairs: string } | undefined>} A promise that resolves to an array containing the data for all users and repairs.
 */
async function getPageData(pageNumber, userProfit = '', userRepairs = '') {
  try {
    const [{ results, count }, repairsData] = await Promise.all([
      getAllUsers(pageNumber),
      getAllRepairsData(userProfit, userRepairs)
    ]);

    return { users: results, numberOfUsers: count, repairs: repairsData, pageNumber, userProfit, userRepairs };
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
 * @description Filters the repairs data based on the selected range.
 * @param {Event} event - The change event.
 * @param {string} type - The chosen type of range.
 * @param {{userProfit: string, userRepairs: string}} query - The query parameters.
 */
function onRangeSelect(event, type, query) {
  event.preventDefault();

  const select = /**@type {HTMLSelectElement}*/(event.target);
  const value = select.value;
  const range = getRangeOption(value);

  if (value === 'all_time' || !range) delete query[type];
  else query[type] = value;

  const queryParams = makeQueryParam(query);

  if (queryParams) page.redirect(`/admin?${queryParams}`);
  else page.redirect('/admin');
}

/**
 * @description Retrieves repairs data and calculates profit and count for each owner.
 * @param {string} userProfitQuery - The user profit query parameter.
 * @param {string} userRepairsQuery - The user repairs query parameter.
 * @returns {Promise<RepairsData>} An object containing profit and count for each owner.
 */
async function getAllRepairsData(userProfitQuery, userRepairsQuery) {
  const isWithinRange = (date, range) => {
    if (!range || !range.startDate) return true;
    return date >= range.startDate && date <= (range.endDate || new Date());
  };

  const repairs = await getRepairs();
  const repairsCountRange = getRangeOption(userRepairsQuery);
  const repairsProfitRange = getRangeOption(userProfitQuery);

  return repairs.reduceRight((acc, repair) => {
    const repairDate = new Date(repair.date);
    const username = repair.owner.username;

    if (isWithinRange(repairDate, repairsCountRange)) {
      if (!acc.count[username]) acc.count[username] = 0;
      acc.count[username]++;
    }

    if (isWithinRange(repairDate, repairsProfitRange)) {
      if (!acc.profit[username]) acc.profit[username] = 0;
      acc.profit[username] += parseFloat(repair.profit || '0');
    }

    return acc;
  }, { count: {}, profit: {} });
}

/**
 * @typedef {{count: Record<string, number>, profit: Record<string, number>}} RepairsData
 */