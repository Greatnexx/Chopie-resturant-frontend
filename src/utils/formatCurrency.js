export const formatCurrency = (amount) => {
  // Handle null, undefined, or NaN values only
  if (amount === null || amount === undefined || (typeof amount === 'string' && amount.trim() === '') || isNaN(parseFloat(amount))) {
    return '₦0.00';
  }
  
  const numericAmount = parseFloat(amount);
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount).replace('NGN', '₦');
};