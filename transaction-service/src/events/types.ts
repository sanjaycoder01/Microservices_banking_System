export type TransactionCompletedEvent = {
  eventType: "transaction.completed";
  transactionId: string;
  customerId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  occurredAt: string;
};
