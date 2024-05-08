import page from 'page';
import { until } from 'lit/directives/until.js';
import { getCarById, getAllRepairsByCar } from '../../api';
import { repairCatalog as template } from '../../templates';
import { currencyFormatter, getDay, getFont, getQueryParam, notice } from '../../utilities';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const doc = new jsPDF();

  // Add cyrillic supported font
  const fontFile = 'Roboto-Regular.ttf';
  const fontFace = 'Roboto';
  const font = await getFont(fontFile);
  doc.addFileToVFS(fontFile, font);
  doc.addFont(fontFile, fontFace, 'normal');
  doc.setFont(fontFace);

  // Info about the company
  doc.text('Автомобилен сервиз', 105, 10, { align: 'center' });
  doc.setFontSize(14);
  doc.text('ул. "Цар Симеон" 99', 105, 16, { align: 'center' });
  doc.text('София, България', 105, 22, { align: 'center' });
  doc.text('Телефон: 0888 888 888', 105, 28, { align: 'center' });
  doc.setFontSize(16);

  // Generate the car table
  autoTable(doc, {
    theme: 'grid',
    head: [['Име на клиента', 'VIN', 'Pегистрационен номер', 'Марка / Модел', 'Двигател'],],
    body: [[car.customerName, car.vin, car.registration, car.make, car.engine]],
    margin: { top: 45 },
    styles: {
      font: fontFace,
      textColor: [35, 68, 101],
    },
    headStyles: {
      fillColor: [35, 68, 101],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [238, 238, 238],
    },
    tableLineWidth: 0.5,
    tableLineColor: [35, 68, 101],
  });

  const repairsData = repairs.map(repair => {
    return [
      getDay(repair.date),
      `${repair.km} km`,
      currencyFormatter(repair.profit),
      repair.description
    ];
  });

  // Generate repairs table
  autoTable(doc, {
    theme: 'grid',
    head: [['Дата на ремонт', 'Постъпващи километри', 'Платена сума', 'Забележка']],
    body: repairsData,
    margin: { top: 45 },
    styles: {
      font: fontFace,
      textColor: [35, 68, 101],
    },
    headStyles: {
      fillColor: [35, 68, 101],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [238, 238, 238],
    },
    tableLineWidth: 0.5,
    tableLineColor: [35, 68, 101],
  });

  // Add space for signature and stamp
  doc.setFontSize(12);
  doc.text('Предаващ: ........................', 20, 285, { align: 'left' });
  doc.text('Получател: ........................', 140, 285, { align: 'left' });

  // Save the PDF
  doc.save('repairs.pdf');
}