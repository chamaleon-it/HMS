export const formatId = (id: string | number, prefix?: string): string => {
  const numStr = String(id).padStart(5, "0");
  return prefix ? `${prefix}-${numStr}` : numStr;
};
