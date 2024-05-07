import page from 'page';
import { html } from 'lit';
import { Chart, registerables } from 'chart.js';
import config from '../../config';
import { makeQueryParam } from '../../utilities';

Chart.register(...registerables);


/**
 * @typedef {object} AdminPageProps
 * @property {Array<UserAuthData>} users - The array of users.
 * @property {number} numberOfUsers - The total number of users.
 * @property {import('../../views/admin/dashboard').RepairsData} repairs - The array of users.
 * @property {number} pageNumber - The current page number.
 * @property {(event: Event, user: UserAuthData) => void} onBrowseAsUser - The function to be called when the browse as user button is clicked.
 */

/**
 * @description Renders the admin dashboard page.
 * @param {AdminPageProps} data - The data for the page.
 * @returns {import('lit').TemplateResult} The rendered template.
 */
export default (data) => {
  const { users, numberOfUsers, repairs, pageNumber, onBrowseAsUser } = data;
  const totalPages = Math.max(Math.ceil(numberOfUsers / config.usersPerPage), 1);

  const userNames = Object.keys(repairs);
  const userData = Object.values(repairs);

  return html`
    <section id="admin-page">
      <span class="title">Aдминистраторско табло</span>
      <div class="container">
        <div class="chart">${renderUserRepairsChart(userNames, userData.map(x => x.count))}</div>
        <div class="chart">${renderUserProfitChart(userNames, userData.map(p => p.profit))}</div>
      </div>

      ${renderTable(users, onBrowseAsUser)}

      <div class="pagination">
        ${renderPaginationLinks(pageNumber, totalPages)}
      </div>
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

  new Chart(canvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        label: 'Печалба',
        ...colors,
      }]
    },
    options: profitChartConfig
  });

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

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        label: 'Ремонти',
        ...colors,
      }]
    },
    options: repairsChartConfig
  });

  return canvas;
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
          <th role="columnheader">Име</th>
          <th role="columnheader">Разглеждайте като потребител</th>
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
 * @description Render pagination links based on the current page, the total number of pages and the search query.
 * @param {number} pageNumber - The current page number.
 * @param {number} totalPages - The total number of pages.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderPaginationLinks = (pageNumber, totalPages) => {
  /**
   * @description Generates the URL for a specific page.
   * @param {number} pageNum - The page number.
   * @returns {string} The generated URL.
   */
  const getLinkUrl = (pageNum) => {
    const queryParams = makeQueryParam({
      page: pageNum.toString()
    });

    return `${window.location.pathname}?${queryParams}`;
  };

  /**
   * @description Generates a pagination link element.
   * @param {any} text - The text or HTML content of the link.
   * @param {number} pageNum - The page number.
   * @returns {import('lit').TemplateResult} The pagination link element.
   */
  const createPageLink = (text, pageNum) => {
    const isSamePage = pageNumber === pageNum || pageNum < 1 || pageNum > totalPages;
    const isCurrentPage = typeof text === 'number' && pageNumber === pageNum;
    const href = isSamePage ? '#' : getLinkUrl(pageNum);
    const className = `${isSamePage ? 'not-selectable' : ''} ${isCurrentPage ? 'active' : ''}`;

    return html`<a .href=${href} .className=${className}>${text}</a>`;
  };

  /**
   * @description Generates an array of page links based on the current page number, total pages, and a specified maximum number of pages.
   * @returns {Array<number>} - An array of page link objects.
   */
  function generateRelativePageLinks() {
    const relativePages = Math.floor(config.relativePageLinks / 2);
    const startPage = Math.min(Math.max(1, pageNumber - relativePages), Math.max(1, totalPages - config.relativePageLinks + 1));
    const endPage = Math.max(Math.min(totalPages, pageNumber + relativePages), Math.min(totalPages, config.relativePageLinks));
    const length = Math.min(endPage - startPage + 1, totalPages);

    return Array.from({ length }, (_, i) => startPage + i);
  }

  const first = createPageLink(html`<i class="material-icons">keyboard_double_arrow_left</i>`, 1);
  const prev = createPageLink(html`<i class="material-icons">chevron_left</i>`, pageNumber - 1);
  const pages = generateRelativePageLinks().map(pageNum => createPageLink(pageNum, pageNum));
  const next = createPageLink(html`<i class="material-icons">chevron_right</i>`, pageNumber + 1);
  const last = createPageLink(html`<i class="material-icons">keyboard_double_arrow_right</i>`, totalPages);

  return html`${first}${prev}${pages}${next}${last}`;
};

const colors = {
  backgroundColor: [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
  ],
  borderColor: [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
  ],
  borderWidth: 1,
};

const profitChartConfig = /**@type {import('chart.js').ChartOptions<'pie'>}*/({
  responsive: true,
  aspectRatio: 2 / 1,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Печалба на потребителите',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((acc, x) => acc + x, 0);
          const percent = ((value / total) * 100).toFixed(2);
          const currency = new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(value);

          return `${label}: ${currency} (${percent}%)`;
        }
      }
    }
  }
});

const repairsChartConfig = /**@type {import('chart.js').ChartOptions<'bar'>}*/({
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Брой ремонти на потребителите',
    },
  },
  scales: {
    y: {
      ticks: {
        stepSize: 1
      },
      title: {
        display: true,
        text: 'Брой ремонти',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Потребители',
      }
    }
  }
});