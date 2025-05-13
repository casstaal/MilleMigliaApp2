import { PdfReader } from 'pdfreader';
import { createError } from 'h3';
import path from 'path';

type TextItem = {
  text: string;
  x: number;
  y: number;
};


function extractCarInfo(filePath: string, searchNumber: number): Promise<object[] | null> { // { number: number; make: string; model: string }
  return new Promise((resolve, reject) => {
    const rows: Record<number, any[]> = {};
    const items: object[] = [];
    let skipCount = 0;

    new PdfReader().parseFileItems(filePath, (err, item) => {
      skipCount++;

      if(skipCount < 27) {
        return;
      }

      const textItem = item as TextItem;
      items.push(item as object)

      if (err) return reject(err);

      if (!textItem) {
        return resolve(items)
      } else if (textItem.text) {
        (rows[textItem.y] = rows[textItem.y] || []).push(textItem);
      }

    });
  });
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const number = parseInt(query.number as string);

  if (isNaN(number)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid car number' });
  }

  try {
    const filePath = path.resolve('public/millemiglia2024.pdf');
    console.log('Resolved file path:', filePath);
    const data = await extractCarInfo(filePath, number);
    console.log("filepath" + filePath);
    console.log(number);

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Car not found' });
    }

    return data;
  } catch (err) {
    console.error('PDF error', err);
    throw createError({ statusCode: 500, statusMessage: 'Failed to parse PDF' });
  }
});
