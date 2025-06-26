import fs from 'fs';
import path from 'path';

export function readJSONData<T = any>(symbol: string): T[] {
  try {
    const filePath = path.resolve(`./data/${symbol}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Could not read data for ${symbol}:`, err);
    return [];
  }
}
