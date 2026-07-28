import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const zxcvbn = new ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
});

export interface StrengthResult {
  score: number; // 0-5, rescaled from zxcvbn's 0-4 for the 5-segment meter UI
  labelKey: string;
  color: string;
}

/** Shared by Register and ResetPassword — keeps the strength meter and policy check identical everywhere a new password is set. */
export const computeStrength = (password: string): StrengthResult => {
  const { score: zxcvbnScore } = zxcvbn.check(password);
  const score = password.length === 0 ? 0 : zxcvbnScore + 1;

  if (zxcvbnScore <= 1) return { score, labelKey: 'register.strengthWeak', color: 'bg-red-500' };
  if (zxcvbnScore === 2) return { score, labelKey: 'register.strengthFair', color: 'bg-yellow-500' };
  if (zxcvbnScore === 3) return { score, labelKey: 'register.strengthGood', color: 'bg-primary-500' };
  return { score, labelKey: 'register.strengthStrong', color: 'bg-accent-500' };
};

/** Mirrors the backend policy enforced in registerValidation / changePassword / resetPassword. */
export const meetsPolicy = (password: string): boolean =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);
