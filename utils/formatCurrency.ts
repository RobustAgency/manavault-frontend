export const formatCurrency = (amount: number, currency: string | null = 'usd') => {
  const normalizedCurrency = currency?.trim().toUpperCase() || 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrency,
    }).format(amount);
  } catch (error) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${normalizedCurrency} ${formattedAmount}`;
  }
};