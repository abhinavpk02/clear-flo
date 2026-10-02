/**
 * Financial Precision Helper for ClearFlo (Paise Arithmetic)
 * All monetary amounts are stored as integers representing Paise (1 INR = 100 Paise).
 * Avoids floating point precision errors in financial calculations.
 * Always formats as Indian Rupees (₹).
 */

export function toPaise(rupees: number | string): number {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function toRupees(paise: number): number {
  return (paise || 0) / 100;
}

export function formatRupees(paise: number): string {
  const rupees = toRupees(paise);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
  return `₹${formatted}`;
}

export interface GSTBreakdown {
  subtotalInPaise: number;
  cgstInPaise: number;
  sgstInPaise: number;
  totalInPaise: number;
  cgstPercent: number;
  sgstPercent: number;
}

/**
 * Calculates 18% Kerala GST split into 9% CGST (Intra-state Central) & 9% SGST (Intra-state State)
 */
export function calculateKeralaGST(subtotalInPaise: number, totalGstPercent = 18): GSTBreakdown {
  const halfRate = totalGstPercent / 2; // e.g. 9%
  const cgstInPaise = Math.round(subtotalInPaise * (halfRate / 100));
  const sgstInPaise = Math.round(subtotalInPaise * (halfRate / 100));
  const totalInPaise = subtotalInPaise + cgstInPaise + sgstInPaise;

  return {
    subtotalInPaise,
    cgstInPaise,
    sgstInPaise,
    totalInPaise,
    cgstPercent: halfRate,
    sgstPercent: halfRate,
  };
}
