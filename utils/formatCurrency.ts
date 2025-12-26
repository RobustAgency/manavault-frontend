export const formatCurrency = (amount: number, currency: string | null = 'usd') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency?.toUpperCase() || 'USD',
    }).format(amount)
};  