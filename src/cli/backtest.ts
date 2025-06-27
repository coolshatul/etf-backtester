import chalk from 'chalk';
import { fetchETFData } from '../utils/fetchData.js';
import { readJSONData } from '../utils/fileUtils.js';
import { calculateIndicators } from '../utils/indicators.js';
import { backtestStrategy } from '../strategy/backtestEngine.js';
import settings from '../config/settings.js';

const symbol = process.argv[2] || 'NIFTYBEES';

(async () => {
    console.log(chalk.blueBright(`📈 Running backtest for ${symbol}...\n`));

    await fetchETFData(symbol, settings.fromDate);

    const rawData = readJSONData(symbol);
    const enrichedData = calculateIndicators(
        rawData,
        settings.rsiPeriod,
        settings.emaFastPeriod,
        settings.emaSlowPeriod
    );

    const { trades, summary } = backtestStrategy(enrichedData);

    console.log(chalk.yellow('🧾 Trade Log:'));
    for (const trade of trades) {
        const color = trade.type === 'BUY' ? chalk.green : chalk.red;
        let output = `${trade.type} on ${trade.date} @ ₹${trade.price}`;
        if (trade.profit) output += ` | Profit: ${trade.profit} | Days: ${trade.holdingDays}`;
        console.log(color(output));
    }

    // ➕ Add insights
    const sellTrades = trades.filter(t => t.type === 'SELL');
    const profits = sellTrades.map(t => parseFloat(t.profit!.replace('%', '')));
    const totalHoldingDays = sellTrades.reduce((acc, t) => acc + (t.holdingDays || 0), 0);

    const wins = profits.filter(p => p > 0);
    const losses = profits.filter(p => p <= 0);

    const avgHolding = sellTrades.length ? (totalHoldingDays / sellTrades.length).toFixed(1) : '0';
    const winRate = sellTrades.length ? ((wins.length / sellTrades.length) * 100).toFixed(2) : '0';

    const bestTrade = Math.max(...profits).toFixed(2);
    const worstTrade = Math.min(...profits).toFixed(2);

    console.log(chalk.cyan(`\n📊 Summary:`));
    console.log(`Total Trades    : ${chalk.bold(summary.totalTrades)}`);
    console.log(`Total Profit    : ${chalk.bold.green(summary.totalProfit)}`);
    console.log(`Winning Trades  : ${wins.length}`);
    console.log(`Losing Trades   : ${losses.length}`);
    console.log(`Win Rate        : ${winRate}%`);
    console.log(`Avg Holding Days: ${avgHolding}`);
    console.log(`Best Trade      : ${bestTrade}%`);
    console.log(`Worst Trade     : ${worstTrade}%`);
    console.log(`Annual Return    : ${chalk.bold(summary.annualReturn)}`);
    console.log(`Beats FD (7%)?   : ${summary.beatsFD ? chalk.green('✅ Yes') : chalk.red('❌ No')}`);

})();
