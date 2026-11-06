export const formatNumber = (n: number): string => n.toLocaleString("en-US");
export const formatPercent = (x: number, digits = 1): string => (x * 100).toFixed(digits) + "%";
