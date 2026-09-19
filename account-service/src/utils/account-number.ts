export const generateAccountNumber = (): string => {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 90 + 10).toString();
  return `${timestamp}${random}`;
};
