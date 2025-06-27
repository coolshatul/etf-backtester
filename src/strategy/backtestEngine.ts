import settings from '../config/settings';

// Define what a single trade looks like
interface Trade {
  type: 'BUY' | 'SELL';
  date: string;
  price: number;
  profit?: string;
  holdingDays?: number;
}

// Return value of the backtest
interface Result {
  trades: Trade[];
  summary: {
    totalTrades: number;
    totalProfit: string;
    annualReturn: string;
    beatsFD: boolean;
  };
}

export function backtestStrategy(data: any[]): Result {
  const config = {
    takeProfit: settings.takeProfit,
    stopLoss: settings.stopLoss,
    trailingTrigger: settings.trailingTrigger,
    trailingStop: settings.trailingStop,
    cooldownDays: settings.cooldownDays,
  };

  let inPosition = false;
  let entry: null | { price: number; date: string; peak: number } = null;
  const trades: Trade[] = [];
  let totalProfit = 0;
  let cooldownUntil: string | null = null;

  for (let i = 3; i < data.length; i++) {
    const day = data[i];
    const prev1 = data[i - 1];
    const prev2 = data[i - 2];
    const prev3 = data[i - 3];
    if (!day || !prev1 || !prev2 || !prev3) continue;

    const currentDate = new Date(day.date);
    if (cooldownUntil && currentDate <= new Date(cooldownUntil)) continue;

    const { rsi, emaFast, emaSlow, macd, macdSignal, adx, atr, bbUpper, avgVolume20, volume } = day;

    if (
      !rsi || !emaFast || !emaSlow || !macd || !macdSignal ||
      !adx || !atr || !bbUpper || !avgVolume20 || !volume
    ) continue;

    const rsiUptrend = rsi > prev1.rsi && prev1.rsi > prev2.rsi && prev2.rsi > prev3.rsi;
    const emaCrossover = emaFast > emaSlow;
    const macdBullish = macd > macdSignal;

    const coreConditions = rsiUptrend && emaCrossover && macdBullish;

    const optionalConditions = [
      adx > 15,
      (atr / day.close) * 100 > 0.7,
      volume > avgVolume20,
      (bbUpper - day.close) / bbUpper > 0.01,
    ];

    const optionalCount = optionalConditions.filter(Boolean).length;

    const buySignal = !inPosition && coreConditions && optionalCount >= 1;

    if (buySignal) {
      inPosition = true;
      entry = {
        price: day.close,
        date: day.date,
        peak: day.close,
      };
      trades.push({
        type: 'BUY',
        date: day.date,
        price: day.close,
      });
      continue;
    }

    if (inPosition && entry) {
      const priceChange = ((day.close - entry.price) / entry.price) * 100;
      const holdingDays = Math.round(
        (currentDate.getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (day.close > entry.peak) entry.peak = day.close;
      const drawdown = ((day.close - entry.peak) / entry.peak) * 100;

      const hitStopLoss = priceChange <= -config.stopLoss;
      const hitTakeProfit = priceChange >= config.takeProfit;
      const trailingExit = priceChange >= config.trailingTrigger && drawdown <= -config.trailingStop;
      const bollingerExit = day.close >= bbUpper && rsi < prev1.rsi;

      const shouldSell = hitStopLoss || hitTakeProfit || trailingExit || bollingerExit;

      if (shouldSell) {
        inPosition = false;
        trades.push({
          type: 'SELL',
          date: day.date,
          price: day.close,
          profit: `${priceChange.toFixed(2)}%`,
          holdingDays,
        });
        totalProfit += priceChange;
        entry = null;

        cooldownUntil = new Date(currentDate.getTime() + config.cooldownDays * 86400000)
          .toISOString()
          .slice(0, 10);
      }
    }
  }

  // 📅 Annual Return (CAGR) Calculation
  const buy = trades.find(t => t.type === 'BUY');
  const sell = [...trades].reverse().find(t => t.type === 'SELL');
  let annualReturn = 0;

  if (buy && sell) {
    const start = new Date(buy.date).getTime();
    const end = new Date(sell.date).getTime();
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    const profitMultiplier = 1 + totalProfit / 100;

    if (years > 0) {
      annualReturn = Math.pow(profitMultiplier, 1 / years) - 1;
    }
  }

  return {
    trades,
    summary: {
      totalTrades: trades.length / 2,
      totalProfit: `${totalProfit.toFixed(2)}%`,
      annualReturn: `${(annualReturn * 100).toFixed(2)}%`,
      beatsFD: annualReturn * 100 > 7,
    },
  };
}
