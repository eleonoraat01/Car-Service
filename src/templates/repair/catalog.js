import page from 'page';
import { html, nothing } from 'lit';
import { getUserData } from '@db';
import { renderPaginationLinks } from '@templates';
import { formatDateToLocale } from '@utilities';
import config from '../../config';

const ROWS_PER_PAGE = config.catalogsTable.rowsPerPage;

/**
 * @typedef {object} RepairCatalogPageProps
 * @property {Array<Repair>} repairs - The array of repairs.
 * @property {Array<Repair>} allRepairs - The array of all repairs, not only the paginated ones.
 * @property {Car} car - The car object.
 * @property {number} pageNumber - The current page number.
 * @property {string} prev - The previous page path.
 * @property {(event: Event, car: Car, repairs: Array<Repair>) => void} onExport - The function to be called when the export button is clicked.
 * @property {(event: Event, repair: Repair) => void} onDelete - The function to be called when the delete button is clicked.
 */

/**
 * @description Generates the HTML template for the `catalog with repairs` page.
 * @param {RepairCatalogPageProps} data - The data containing catalog information.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
export default (data) => {
  const { repairs, allRepairs, car, pageNumber, prev, onExport, onDelete } = data;
  const totalPages = Math.max(Math.ceil(allRepairs.length / ROWS_PER_PAGE), 1);

  return html`
    <section id="catalog-page">
      <form autocomplete="off">
        <fieldset>
          <legend>Всички ремонти на ${car.customerName} - рег. &numero; ${car.registration}</legend>

          <fieldset class="search">
            <div class="buttons">
              <a role="button" data-button-type="success" href="${page.base()}/cars/${car.objectId}/repairs/create">Добави ремонт</a>
              <button data-button-type="info" @click=${(e) => onExport(e, car, allRepairs)}>Експорт</button>
              <a role="button" href="${prev}">Назад</a>
            </div>
          </fieldset>

          ${renderContent(repairs, onDelete)}

          ${renderPaginationLinks(pageNumber, totalPages)}
        </fieldset>
      </form>
    </section>
  `;
};

/**
 * @description Render the content based on the repairs data.
 * @param {Array<Repair>} repairs - The array of repairs.
 * @param {(event: Event, repair: Repair) => void} onDelete - The function to be called when the delete button is clicked.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderContent = (repairs, onDelete) => {
  if (repairs.length > 0) return renderTable(repairs, onDelete);
  return html`<p class="empty">Нямаш завършени ремонти!</p>`;
};

/**
 * @description Render the table based on the repairs data.
 * @param {Array<Repair>} repairs - The array of repairs.
 * @param {(event: Event, repair: Repair) => void} onDelete - The function to be called when the delete button is clicked.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderTable = (repairs, onDelete) => {
  const isSuperUser = !!getUserData()?.isSuperUser;

  return html`
    <table role="table">
      <thead role="rowgroup">
        <tr role="row">
          <th role="columnheader">Извършен на</th>
          <th role="columnheader">Километри</th>
          <th role="columnheader">Детайли по ремонта</th>
          ${isSuperUser ? html`<th role="columnheader">Изтриване</th>` : nothing}
        </tr>
      </thead>
      <tbody role="rowgroup">
        ${repairs.map(repair => renderTableRow(repair, isSuperUser, onDelete))}
      </tbody>
    </table>
  `;
};

/**
 * @description Render a table row for a repair entry.
 * @param {Repair} repair - The repair object.
 * @param {boolean} isSuperUser - A flag indicating if the user is a super user.
 * @param {(event: Event, repair: Repair) => void} onDelete - The function to be called when the delete button is clicked.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderTableRow = (repair, isSuperUser, onDelete) => {
  return html`
    <tr role="row">
      <td role="cell" data-cell-content="Извършен на">${formatDateToLocale(repair.date)}</td>
      <td role="cell" data-cell-content="Километри">${repair.km}</td>
      <td role="cell" data-cell-content="Детайли по ремонта">
        <div class="buttons">
          <a role="button" data-button-type="info" href="${page.base()}/cars/${repair.car.objectId}/repairs/${repair.objectId}">Детайли</a>
        </div>
      </td>
      ${isSuperUser ? renderDeleteButton(repair, onDelete) : nothing}
    </tr>
  `;
};

/**
 * @description Renders the delete button for a repair in the catalog.
 * @param {Repair} repair - The repair object.
 * @param {(event: Event, repair: Repair) => void} onDelete - The function to be called when the delete button is clicked.
 * @returns {import('lit').TemplateResult} The HTML template string.
 */
const renderDeleteButton = (repair, onDelete) => {
  return html`
    <td role="cell" data-cell-content="Изтриване">
      <div class="buttons">
        <button data-button-type="danger" @click=${(e) => onDelete(e, repair)}>
          <i class="material-icons">delete_forever</i>
        </button>
      </div>
   </td>
  `;
};