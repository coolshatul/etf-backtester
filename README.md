# 📊 ETF Swing Trading Backtester

A Node.js + TypeScript-based backtesting engine for swing trading ETFs like NIFTYBEES and JUNIORBEES using technical indicators such as RSI, EMA, MACD, ADX, ATR, and Bollinger Bands.

---

## 🚀 Features

- 📈 Supports multiple ETFs (NIFTYBEES, JUNIORBEES, etc.)
- 🧠 Strategy based on:
  - RSI uptrend
  - EMA crossover
  - MACD bullish crossover
  - ADX, ATR, Bollinger Bands, Volume confirmation
- 🪙 Realistic trade logging with profit/loss & holding period
- 🎯 Risk management:
  - Take Profit %
  - Stop Loss %
  - Trailing Stop & Trigger %
  - Cooldown period
- 🔁 Batch testing of RSI/EMA combos
- 📅 Annual return calculation vs FD benchmark (7%)
- 📦 JSON-based data cache per ETF
- 📊 CLI output with color-coded logs

---

## 🛠️ Tech Stack

- Node.js + TypeScript
- `technicalindicators` for TA
- `chalk` for colorful terminal output
- `yahoo-finance2` for ETF price data

