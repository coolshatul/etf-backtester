export default {
  rsiPeriod: 10,
  emaFastPeriod: 8,
  emaSlowPeriod: 18,
  // trailing & risk config
  takeProfit: 8, // Exit if gain hits 8%
  stopLoss: 3, // Exit if loss hits 3%
  trailingTrigger: 5, // Start trailing after 5% gain
  trailingStop: 2, // Exit if drop from peak is >2%
  cooldownDays: 0, // Optional cooldown after SELL
  fromDate: '2024-01-01'
};


// one possible config example

// rsiPeriod: 14,
// emaFastPeriod: 9,
// emaSlowPeriod: 21,
// // trailing & risk config
// takeProfit: 10, // Exit if gain hits 10%
// stopLoss: 3, // Exit if loss hits 3%
// trailingTrigger: 5, // Start trailing after 5% gain
// trailingStop: 2, // Exit if drop from peak is >2%
// cooldownDays: 0, // Optional cooldown after SELL
// fromDate: '2024-01-01'
// 
