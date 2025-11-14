export const CURRENCY_SYMBOL = '₹';

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
};