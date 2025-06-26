import yahooFinance from 'yahoo-finance2';
import fs from 'fs';
import path from 'path';

type Interval = "1d" | "1wk" | "1mo";

export async function fetchETFData(symbol: string = 'NIFTYBEES', from: string = '2023-01-01'): Promise<void> {
  const options = {
    period1: from,
    interval: "1d" as Interval, // ✅ Tell TypeScript it’s a valid literal
  };

  const result = await yahooFinance.historical(`${symbol}.NS`, options);

  const dataDir = path.resolve('./data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const filePath = path.join(dataDir, `${symbol}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  console.log(`✅ Saved ${result.length} records to ${filePath}`);
}
