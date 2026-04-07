import { describe, expect, it } from "vitest";
import {
  isBankAccountValid,
  type BankAccountFields,
} from "../../lib/bankAccountValidation";

function acct(
  partial: Partial<BankAccountFields> & Pick<BankAccountFields, "bankCode">
): BankAccountFields {
  return {
    accountNumber: partial.accountNumber ?? "0123456789",
    bankCode: partial.bankCode,
    accountName: partial.accountName ?? "Jane Doe",
  };
}

describe("isBankAccountValid (NUBAN)", () => {
  it("accepts 10-digit NUBAN with bank and name", () => {
    expect(isBankAccountValid(acct({ bankCode: "GTBINGLA" }))).toBe(true);
  });

  it("rejects 9-digit account number", () => {
    expect(
      isBankAccountValid(
        acct({ accountNumber: "123456789", bankCode: "GTBINGLA" })
      )
    ).toBe(false);
  });

  it("rejects empty account name", () => {
    expect(
      isBankAccountValid(
        acct({ bankCode: "GTBINGLA", accountName: "   " })
      )
    ).toBe(false);
  });
});
