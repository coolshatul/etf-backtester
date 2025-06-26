import chalk from 'chalk';
import { fetchETFData } from '../utils/fetchData.js';
import { readJSONData } from '../utils/fileUtils.js';
import { calculateIndicators } from '../utils/indicators.js';
import { backtestStrategy } from '../strategy/backtestEngine.js';
import settings from '../config/settings.js';

const symbol = process.argv[2] || 'NIFTYBEES';

console.log(chalk.blueBright(`📈 Running backtest for ${symbol}...`));

await fetchETFData(symbol, settings.fromDate);

const rawData = readJSONData(symbol);
const enrichedData = calculateIndicators(
    rawData,
    settings.rsiPeriod,
    settings.emaFastPeriod,
    settings.emaSlowPeriod
);

const { trades, summary } = backtestStrategy(enrichedData);

console.log(chalk.yellow('\n🧾 Trade Log:'));
for (const trade of trades) {
    const color = trade.type === 'BUY' ? chalk.green : chalk.red;
    let output = `${trade.type} on ${trade.date} @ ₹${trade.price}`;
    if (trade.profit) output += ` | Profit: ${trade.profit} | Days: ${trade.holdingDays}`;
    console.log(color(output));
}

console.log(chalk.cyan(`\n📊 Summary:`));
console.log(`Total Trades: ${summary.totalTrades}`);
console.log(`Total Profit: ${summary.totalProfit}`);
