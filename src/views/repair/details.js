import page from 'page';
import { until } from 'lit/directives/until.js';
import { getRepairById, getCarById } from '../../api';
import { repairDetails as template } from '../../templates';
import { currencyFormatter, getDay, notice } from '../../utilities';
import { PDF } from '../../export/pdf';

/**
 * @description Renders the `details for a repair` page and handles the deletion of a repair.
 * @param {Context} ctx - The context object.
 */
export function detailsRepairPage(ctx) {
  const { carId, repairId } = ctx.params;
  const { prev = `${page.base()}/cars/${carId}/repairs` } = ctx.state;

  ctx.render(until((async () => {
    const data = await getPageData(carId, repairId);
    if (!data) return;

    return template({
      repair: data,
      prev,
      onExport: (event) => onExport(event, data),
    });
  })(), notice.showLoading()));
}

/**
 * @description Retrieves the repair data for a given car.
 * @param {string} carId - The ID of the car associated with the repair.
 * @param {string} repairId - The ID of the repair to retrieve.
 * @returns {Promise<Repair | undefined>} A promise that resolves with the repair object.
 */
async function getPageData(carId, repairId) {
  try {
    return await getRepairById(carId, repairId);
  } catch (error) {
    const errorMessages = error instanceof Error ? error.message : 'Възникна грешка, моля опитайте по-късно';
    notice.showToast({ text: errorMessages, type: 'error' });
    page.redirect(`/cars/${carId}/repairs`);
  } finally {
    notice.hideLoading();
  }
}

/**
 * @description Handles the export event for a repair.
 * @param {Event} event - The form deletion event.
 * @param {Repair} repair - The repair object to be deleted.
 */
async function onExport(event, repair) {
  event.preventDefault();
  if (!repair) return;

  const car = await getCarById(repair.car.objectId);
  if (!car) return;

  const carData = [[car.customerName, car.vin, car.registration, car.make, car.engine]];
  const repairData = [[
    getDay(repair.date),
    `${repair.km} km`,
    currencyFormatter(repair.profit),
    repair.description
  ]];

  const doc = new PDF();
  await doc.applyFont();

  doc
    .addHeader()
    .generateCarTable(carData)
    .generateRepairTable(repairData)
    .addFooter()
    .save(`Ремонт на ${car.customerName} от ${getDay(repair.date)}.pdf`);
}