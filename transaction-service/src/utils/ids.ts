import { v4 as uuidv4 } from "uuid";

export const generateTransactionId = (): string => `txn_${uuidv4()}`;

export const generateSessionId = (): string => `sess_${uuidv4()}`;
