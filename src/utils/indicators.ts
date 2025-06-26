import { RSI, EMA } from 'technicalindicators';

interface Candle {
  close: number;
  [key: string]: any;
}

export function calculateIndicators(
  data: Candle[],
  rsiPeriod: number,
  emaFast: number,
  emaSlow: number
): Candle[] {
  const closes = data.map(d => d.close);
  const rsi = RSI.calculate({ period: rsiPeriod, values: closes });
  const ema9 = EMA.calculate({ period: emaFast, values: closes });
  const ema21 = EMA.calculate({ period: emaSlow, values: closes });

  return data.map((d, i) => ({
    ...d,
    rsi: rsi[i - (data.length - rsi.length)] ?? null,
    emaFast: ema9[i - (data.length - ema9.length)] ?? null,
    emaSlow: ema21[i - (data.length - ema21.length)] ?? null,
  }));
}
