import { html } from 'lit';
import { Chart, registerables } from 'chart.js';
import { renderPaginationLinks } from '@templates';
import { currencyFormatter, RANGE_OPTIONS } from '@utilities';
import config from '../../config';

Chart.register(...registerables);

const SHOWN_USERS_PER_PAGE = config.adminDashboard.shownUsersPerPage;

/**
 * @typedef {object} AdminPageProps
 * @property {Array<UserAuthData>} users - The array of users.
 * @property {number} numberOfUsers - The total number of users.
 * @property {import('../../views/admin/dashboard').RepairsData} repairs - The array of users.
 * @property {number} pageNumber - The current page number.
 * @property {string} userProfit - The user profit query parameter.
 * @property {string} userRepairs - The user repairs query parameter.
 * @property {(event: Event, user: UserAuthData) => void} onBrowseAsUser - The function to be called when the browse as user button is clicked.
 * @property {(event: Event, type: string) => void} onRangeSelect - The function to be called when the range is selected.
 */

/**
 * @description Renders the admin dashboard page.
 * @param {AdminPageProps} data - The data for the page.
 * @returns {import('lit').TemplateResult} The rendered template.
 */
export default (data) => {
  const { users, numberOfUsers, repairs, pageNumber, userProfit, userRepairs, onBrowseAsUser, onRangeSelect } = data;
  const totalPages = Math.max(Math.ceil(numberOfUsers / SHOWN_USERS_PER_PAGE), 1);

  return html`
    <section id="admin-page">
      <span class="title">Aдминистраторско табло</span>
      <div class="container">
        <div class="chart">
          ${renderDropdownMenu(onRangeSelect, 'userRepairs', userRepairs)}
          ${renderUserRepairsChart(Object.keys(repairs.count), Object.values(repairs.count))}
        </div>
        <div class="chart">
          ${renderDropdownMenu(onRangeSelect, 'userProfit', userProfit)}
          ${renderUserProfitChart(Object.keys(repairs.profit), Object.values(repairs.profit))}
        </div>
      </div>

      ${renderTable(users, onBrowseAsUser)}

      ${renderPaginationLinks(pageNumber, totalPages)}
    </section>
  `;
};

/**
 * @description Renders a user profit chart.
 * @param {Array<string>} labels - The labels for the chart.
 * @param {Array<number>} data - The data for the chart.
 * @returns {HTMLCanvasElement} The canvas element containing the rendered chart.
 */
const renderUserProfitChart = (labels, data) => {
  const canvas = document.createElement('canvas');
  const { profitChartConfig } = config.adminDashboard.carts;

  customTooltipLabel(profitChartConfig);
  profitChartConfig.data.labels = labels;
  profitChartConfig.data.datasets[0].data = data;

  new Chart(canvas, profitChartConfig);

  return canvas;
};

/**
 * @description Renders a chart displaying user repairs.
 * @param {Array<string>} labels - The labels for the chart.
 * @param {Array<number>} data - The data for the chart.
 * @returns {HTMLCanvasElement} The canvas element containing the rendered chart.
 */
const renderUserRepairsChart = (labels, data) => {
  const canvas = document.createElement('canvas');
  const { repairsChartConfig } = config.adminDashboard.carts;

  repairsChartConfig.data.labels = labels;
  repairsChartConfig.data.datasets[0].data = data;

  new Chart(canvas, repairsChartConfig);

  return canvas;
};

/**
 * @description Renders a dropdown menu with options based on the given range options.
 * @param {(event: Event, type: string) => void} onRangeSelect - The function to be called when the range is selected.
 * @param {string} type - The type of the dropdown menu.
 * @param {string} query - The currently selected option.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderDropdownMenu = (onRangeSelect, type, query) => {
  return html`
    <select class="dropdown" @change=${(e) => onRangeSelect(e, type)}>
      ${Object.entries(RANGE_OPTIONS).map(([key, { label }]) => html`
        <option .selected=${query === key} value=${key}>${label}</option>
      `)}
    </select>
  `;
};

/**
 * @description Render the table based on the users data.
 * @param {Array<UserAuthData>} users - The array of users.
 * @param {(event: Event, user: UserAuthData) => void} onBrowseAsUser - The function to be called when the browse as user button is clicked.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderTable = (users, onBrowseAsUser) => {
  return html`
    <table role="table">
      <thead role="rowgroup">
        <tr role="row">
          <th role="columnheader">Потребителско име</th>
          <th role="columnheader">Преглед като потребител</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        ${users.map(user => renderTableRow(user, onBrowseAsUser))}
      </tbody>
    </table>
  `;
};

/**
 * @description Render a table row for a user entry.
 * @param {UserAuthData} user - The user object.
 * @param {(event: Event, user: UserAuthData) => void} onBrowseAsUser - The function to be called when the browse as user button is clicked.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderTableRow = (user, onBrowseAsUser) => {
  return html`
    <tr role="row">
      <td role="cell" data-cell-content="Име">${user.username}</td>
      <td role="cell" data-cell-content="Разглеждайте">
        <div class="buttons">
          <button data-button-type="success" @click=${(e) => onBrowseAsUser(e, user)}>
            <i class="material-icons">person_search</i>
          </button>
        </div>
      </td>
    </tr>
  `;
};

/**
 * @description Customizes the tooltip label for the pie chart.
 * @param {import('chart.js').ChartConfiguration<'pie'>} config - The chart configuration.
 */
function customTooltipLabel(config) {
  if (!config.options?.plugins?.tooltip?.callbacks) return;

  config.options.plugins.tooltip.callbacks.label = (context) => {
    const label = context.label || '';
    const value = context.parsed || 0;
    const total = context.dataset.data.reduce((acc, x) => acc + x, 0);
    const percent = ((value / total) * 100).toFixed(2);
    const currency = currencyFormatter(value.toString());

    return `${label}: ${currency} (${percent}%)`;
  };
}