import { httpClient } from './client'

export interface RefundBank { id: number, name: string }

export interface RefundSentToBank {
  bankName: string
  accountLast4: string
  accountName: string
  /** False when Paystack did not answer; the backend checks again later. */
  confirmed: boolean
}

/** A refund Paystack cannot return the way it was paid, sent to a bank account instead. */
export const refundBankAccountAPI = {
  banks: () => httpClient.getAuth<{ banks: RefundBank[] }>('/api/subscriptions/refund/banks'),
  /** The name on the account, before anything is sent. */
  check: (body: { bankId: number, accountNumber: string }) =>
    httpClient.post<{ accountName: string, bankName: string }>('/api/subscriptions/refund/bank-account/check', body),
  send: (body: { bankId: number, accountNumber: string }) =>
    httpClient.post<RefundSentToBank>('/api/subscriptions/refund/bank-account', body),
}
