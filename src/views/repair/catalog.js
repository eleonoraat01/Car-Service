import page from 'page';
import { until } from 'lit/directives/until.js';
import { getCarById, getAllRepairsByCar } from '../../api';
import { repairCatalog as template } from '../../templates';
import { currencyFormatter, getDay, getQueryParam, notice } from '../../utilities';
import { PDF } from '../../export/pdf';

/**
 * @description Renders the `catalog with repairs` page.
 * @param {Context} ctx - The context object.
 */
export function repairsCatalogPage(ctx) {
  const { carId } = ctx.params;
  const { page: pageNumber = '1', } = /**@type {{page: string}}*/(getQueryParam(ctx.querystring));
  const { prev = `${page.base()}/cars` } = ctx.state;

  ctx.render(until((async () => {
    const data = await getPageData(carId, Number(pageNumber) || 1);
    if (!data) return;

    return template({ ...data, prev, onExport });
  })(), notice.showLoading()));
}

/**
 * @description Retrieves repairs data for a given car and car information itself along within the page number.
 * @param {string} carId - The ID of the car to retrieve data for.
 * @param {number} pageNumber - The page number to retrieve data for.
 * @returns {Promise<{repairs: Array<Repair>, allRepairs: Array<Repair>, car: Car, pageNumber: number} | undefined>} A promise that resolves with an object containing the data.
 */
async function getPageData(carId, pageNumber) {
  try {
    const [{ results: repairs, all: allRepairs }, car] = await Promise.all([
      getAllRepairsByCar(carId, pageNumber),
      getCarById(carId)
    ]);

    return { repairs, allRepairs, car, pageNumber };
  } catch (error) {
    const errorMessages = error instanceof Error ? error.message : 'Възникна грешка, моля опитайте по-късно';
    notice.showToast({ text: errorMessages, type: 'error' });
    page.redirect('/cars');
  } finally {
    notice.hideLoading();
  }
}

/**
 * @description Exports the repairs data.
 * @param {Event} event - The click event.
 * @param {Car} car - The car data to export.
 * @param {Array<Repair>} repairs - The repairs data to export.
 */
async function onExport(event, car, repairs) {
  event.preventDefault();

  if (!car || !repairs?.length) return;

  const carData = [[car.customerName, car.vin, car.registration, car.make, car.engine]];
  const repairsData = repairs.map(repair => {
    return [
      getDay(repair.date),
      `${repair.km} km`,
      currencyFormatter(repair.profit),
      repair.description
    ];
  });

  const doc = new PDF();
  await doc.applyFont();

  doc
    .addHeader()
    .generateCarTable(carData)
    .generateRepairTable(repairsData)
    .addFooter()
    .save(`Всични ремонти на ${car.customerName}.pdf`);
}