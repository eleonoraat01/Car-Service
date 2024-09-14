import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getFont } from '../utilities';

/**
 * @classdesc Represents a PDF document.
 * @extends jsPDF
 */
export class PDF {
  /**
   * @description Represents a PDF object.
   * @param {Partial<import('jspdf').jsPDFOptions>} [options] - The options for configuring the PDF document.
   * @constructor
   */
  constructor(options = {}) {
    this._doc = new jsPDF(options);

    // https://github.com/parallax/jsPDF/issues/2958
    Object.assign(this, this._doc);
  }

  /**
   * @description Sets the font for the PDF document.
   */
  async applyFont() {
    const font = await getFont('Roboto-Regular.ttf');

    this._doc.addFileToVFS('Roboto-Regular.ttf', font);
    this._doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    this._doc.setFont('Roboto');
  }

  /**
   * @description Sets the header for the PDF document.
   * @returns {this & jsPDF} The PDF instance.
   */
  addHeader() {
    this._doc.text('Автомобилен сервиз', 105, 10, { align: 'center' });
    this._doc.setFontSize(14);
    this._doc.text('ул. "Цар Симеон" 99', 105, 16, { align: 'center' });
    this._doc.text('София, България', 105, 22, { align: 'center' });
    this._doc.text('Телефон: 0888 888 888', 105, 28, { align: 'center' });
    this._doc.setFontSize(16);

    return /**@type {this & jsPDF}*/(this);
  }

  /**
   * @description Sets the footer for the PDF document.
   * @returns {this & jsPDF} The PDF instance.
   */
  addFooter() {
    this._doc.setFontSize(12);
    this._doc.text('Предаващ: ........................', 20, 285, { align: 'left' });
    this._doc.text('Получател: ........................', 140, 285, { align: 'left' });

    return /**@type {this & jsPDF}*/(this);
  }

  /**
   * @description Generates a car table using the provided body data and options.
   * @param {Array<import('jspdf-autotable').RowInput>} data - The data for the table body.
   * @param {Partial<import('jspdf-autotable').UserOptions>} [options] - The options for configuring the table.
   * @returns {this & jsPDF} The PDF instance.
   */
  generateCarTable(data, options = {}) {
    autoTable(this._doc, {
      theme: 'grid',
      head: [['Име на клиента', 'VIN', 'Pегистрационен номер', 'Марка / Модел', 'Двигател'],],
      body: data,
      margin: { top: 45 },
      styles: {
        font: 'Roboto',
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
      ...options
    });

    return /**@type {this & jsPDF}*/(this);
  }

  /**
   * @description Generates a repair table using the provided body data and options.
   * @param {Array<import('jspdf-autotable').RowInput>} data - The data for the table body.
   * @param {Partial<import('jspdf-autotable').UserOptions>} [options] - The options for configuring the table.
   * @returns {this & jsPDF} The PDF instance.
   */
  generateRepairTable(data, options = {}) {
    autoTable(this._doc, {
      theme: 'grid',
      head: [['Дата на ремонт', 'Постъпващи километри', 'Дължима сума', 'Забележка']],
      body: data,
      margin: { top: 45 },
      styles: {
        font: 'Roboto',
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
      ...options
    });

    return /**@type {this & jsPDF}*/(this);
  }
}