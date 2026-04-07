/**
 * Pure NUBAN / bank account checks shared by BankAccountForm and tests.
 */

const NUBAN_LENGTH = 10;

export interface BankAccountFields {
  accountNumber: string;
  bankCode: string;
  accountName: string;
}

export function isBankAccountValid(account: BankAccountFields): boolean {
  return (
    account.accountNumber.replace(/\D/g, "").length === NUBAN_LENGTH &&
    account.bankCode.length > 0 &&
    account.accountName.trim().length > 0
  );
}
