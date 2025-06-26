// Define what a single trade looks like
interface Trade {
  type: 'BUY' | 'SELL';   // Trade type
  date: string;           // Date of trade
  price: number;          // Price at trade
  profit?: string;        // % profit (only for SELL)
  holdingDays?: number;   // Days the position was held (only for SELL)
}

// Return value of the backtest
interface Result {
  trades: Trade[];        // List of executed trades
  summary: {
    totalTrades: number;  // Number of completed trades (BUY+SELL pairs)
    totalProfit: string;  // Net % profit across all trades
  };
}

// Backtest function to simulate strategy over historical data
export function backtestStrategy(data: any[]): Result {
  let inPosition = false;   // Whether we currently hold a position
  let entry: { entryPrice: number; entryDate: string } | null = null;  // Buy details
  const trades: Trade[] = [];   // Track all trades
  let totalProfit = 0;          // Cumulative profit %

  for (const day of data) {
    // Ensure indicators are present for this day
    if (!day.rsi || !day.emaFast || !day.emaSlow) continue;

    // Define buy condition:
    // RSI > 50 → upward momentum
    // EMA(9) > EMA(21) → short-term trend stronger than long-term
    const buySignal = day.rsi > 50 && day.emaFast > day.emaSlow;

    // Define sell condition:
    // RSI < 50 → momentum weakening
    // OR EMA(9) < EMA(21) → possible trend reversal
    const sellSignal = day.rsi < 50 || day.emaFast < day.emaSlow;

    // --- BUY LOGIC ---
    if (buySignal && !inPosition) {
      inPosition = true;
      entry = {
        entryPrice: day.close,
        entryDate: day.date,
      };

      // Log buy trade
      trades.push({
        type: 'BUY',
        date: day.date,
        price: day.close,
      });
    }

    // --- SELL LOGIC ---
    if (sellSignal && inPosition && entry) {
      inPosition = false;

      const exitPrice = day.close;
      const profitPct = ((exitPrice - entry.entryPrice) / entry.entryPrice) * 100;
      totalProfit += profitPct;

      // Log sell trade with profit and duration
      trades.push({
        type: 'SELL',
        date: day.date,
        price: exitPrice,
        profit: `${profitPct.toFixed(2)}%`,
        holdingDays: Math.round(
          (new Date(day.date).getTime() - new Date(entry.entryDate).getTime()) / (1000 * 60 * 60 * 24)
        ),
      });
    }
  }

  return {
    trades,
    summary: {
      totalTrades: trades.length / 2, // Each full trade is a BUY+SELL pair
      totalProfit: `${totalProfit.toFixed(2)}%`,
    },
  };
}
