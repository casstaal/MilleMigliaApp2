import { PdfReader } from 'pdfreader';
import { createError } from 'h3';
import path from 'path';

type TextItem = {
  text: string;
  x: number;
  y: number;
};


function extractCarInfo(filePath: string, searchNumber: number): Promise<{ number: number; make: string; model: string } | null> {
  return new Promise((resolve, reject) => {
    const rows: Record<number, any[]> = {};

    new PdfReader().parseFileItems(filePath, (err, item) => {
      const textItem = item as TextItem;
      //console.log('test 1')
      if (err) return reject(err);
        //console.log('test 2')
      if (!textItem) {
        for (const row of Object.values(rows)) {
          const text = row
            .sort((a, b) => a.x - b.x)
            .map(cell => cell.text)
            .join(' ');
            //console.log(text)
          if (text.startsWith(searchNumber.toString())) {
            //console.log('test 13')
            const parts = text.split(' ');
            const make = parts[6];
            const model = parts.slice(7, parts.length - 3).join(' ');
            return resolve({ number: searchNumber, make, model });
          }
        }
        return resolve(null);
      } else if (textItem.text) {
        //console.log(textItem.text);
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
