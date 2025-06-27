import { fetchETFData } from '../utils/fetchData';
import { readJSONData } from '../utils/fileUtils';
import { calculateIndicators } from '../utils/indicators';
import { backtestStrategy } from '../strategy/backtestEngine';

interface TestConfig {
    rsi: number;
    emaFast: number;
    emaSlow: number;
}

const symbol = process.argv[2] || 'NIFTYBEES';

// 🔁 Define RSI + EMA fast/slow combinations to test
const testCases: TestConfig[] = [
    { rsi: 14, emaFast: 9, emaSlow: 21 },
    { rsi: 10, emaFast: 8, emaSlow: 18 },
    { rsi: 7, emaFast: 5, emaSlow: 13 },
    { rsi: 10, emaFast: 9, emaSlow: 21 },
    { rsi: 14, emaFast: 5, emaSlow: 13 },
];

console.log(`📊 Running batch backtest for ${symbol}...`);

async function run() {
    await fetchETFData(symbol); // Get latest price data
    const rawData = readJSONData(symbol);

    const results: {
        config: string;
        trades: number;
        profit: number;
    }[] = [];

    for (const test of testCases) {
        const enriched = calculateIndicators(
            rawData,
            test.rsi,
            test.emaFast,
            test.emaSlow
        );

        const { summary }: any = backtestStrategy(enriched);

        results.push({
            config: `RSI:${test.rsi} | EMA:${test.emaFast}/${test.emaSlow}`,
            trades: summary.totalTrades,
            profit: parseFloat(summary.totalProfit),
        });
    }

    // Sort by highest total profit
    results.sort((a, b) => b.profit - a.profit);

    console.log(`\n🔝 Sorted Results:`);
    for (const r of results) {
        console.log(
            `${r.config} => 📈 Trades: ${r.trades} | 💰 Profit: ${r.profit.toFixed(2)}%`
        );
    }
}

run();
