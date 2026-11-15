export interface TaxCalculationResult {
  subtotal: number;
  taxAmount: number;
  total: number;
  withholdingAmount?: number;
  netPayable?: number;
}

export function calculateInvoiceTotals(
  items: { quantity: number; unitPrice: number; taxRate: number }[],
  withholdingRate: number = 0 // Tevkifat oranı (örn: 2/10, 3/10 vb.)
): TaxCalculationResult {
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of items) {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;
    const itemTax = itemTotal * (item.taxRate / 100);
    taxAmount += itemTax;
  }

  let withholdingAmount = 0;
  if (withholdingRate > 0) {
    // KDV tevkifatı hesaplama
    withholdingAmount = taxAmount * withholdingRate;
  }

  const total = subtotal + taxAmount;
  const netPayable = total - withholdingAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    withholdingAmount: Number(withholdingAmount.toFixed(2)),
    netPayable: Number(netPayable.toFixed(2)),
  };
}
