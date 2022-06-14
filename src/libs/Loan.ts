/*
 * LoanJS
 * Calculating loan in equal or diminishing installments
 * https://github.com/kfiku/LoanJS
 *
 * Copyright (c) 2014 Grzegorz Klimek
 * Licensed under the MIT license.
 *
 * Modifier
 * Famuyiwa Dayo - 13 May 2022
 * https://github.com/famuyiwadayo
 */

import { nanoid } from "nanoid";
import { rnd } from "../utils";
import { addWeeks } from "date-fns";

// const precision = (value: number) => +Number(value).toPrecision();

export type PaymentPeriodType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

interface IInstallment {
  capital: number;
  interest: number;
  installment: number;
  remain: number;
  interestSum: number;
  instalmentId: string;
  nextInstalmentId?: string;
  prevInstalmentId?: string;
  paybackDate: Date;
}

interface ICalcLoan {
  installments: Array<IInstallment>;
  amount: number;
  interestSum: number;
  capitalSum: number;
  sum: number;
}

export enum PaymentPeriod {
  DAILY = 365,
  WEEKLY = 52,
  MONTHLY = 12,
  YEARLY = 1,
}

export default class Loan {
  private installments: IInstallment[];

  constructor() {
    this.installments = [];
  }

  private getNextInstalment(
    amount: number,
    installmentsNumber: number,
    interestRate: number,
    diminishing: boolean,
    capitalSum: number,
    interestSum: number,
    paymentPeriod = PaymentPeriod.MONTHLY,
    prevPayDate?: Date
  ): IInstallment {
    let capital: number;
    let interest: number;
    let installment: number;
    let irmPow: number;
    let _interestRate = interestRate / 100;

    if (paymentPeriod === PaymentPeriod.DAILY)
      _interestRate = interestRate / (PaymentPeriod.DAILY * 100);
    if (paymentPeriod === PaymentPeriod.WEEKLY)
      _interestRate = interestRate / (PaymentPeriod.WEEKLY * 100);
    if (paymentPeriod === PaymentPeriod.MONTHLY)
      _interestRate = interestRate / (PaymentPeriod.MONTHLY * 100);
    if (paymentPeriod === PaymentPeriod.YEARLY)
      _interestRate = interestRate / (PaymentPeriod.YEARLY * 100);

    // console.log(`Interest Rate: ${_interestRate}`);

    if (diminishing) {
      capital = rnd(amount / installmentsNumber);
      interest = rnd((amount - capitalSum) * _interestRate);
      installment = capital + interest;
    } else {
      irmPow = Math.pow(1 + _interestRate, installmentsNumber);
      installment = rnd(amount * ((_interestRate * irmPow) / (irmPow - 1)));
      interest = rnd((amount - capitalSum) * _interestRate);
      capital = installment - interest;
    }

    return {
      capital: capital,
      interest: interest,
      installment: installment,
      remain: amount - capitalSum - capital,
      interestSum: interestSum + interest,
      instalmentId: nanoid(24),
      paybackDate: addWeeks(prevPayDate ?? new Date(), 1),
    };
  }

  calc(
    amount: number,
    installmentsNumber: number,
    interestRate: number,
    downPayment?: number,
    period: PaymentPeriodType = "MONTHLY",
    diminishing = false
  ): ICalcLoan {
    /** Checking params */
    if (
      !amount ||
      amount <= 0 ||
      !installmentsNumber ||
      installmentsNumber <= 0 ||
      !interestRate ||
      interestRate <= 0
    ) {
      throw new Error(
        `wrong parameters: ${amount} ${installmentsNumber} ${interestRate}`
      );
    }

    if (downPayment) amount = amount - downPayment;

    let interestSum = 0;
    let capitalSum = 0;
    let sum = 0;

    for (let i = 0; i < installmentsNumber; i++) {
      const inst = this.getNextInstalment(
        amount,
        installmentsNumber,
        interestRate,
        diminishing,
        capitalSum,
        interestSum,
        PaymentPeriod[period],
        this.installments[i - 1]?.paybackDate
      );

      sum += inst.installment;
      capitalSum += inst.capital;
      interestSum += inst.interest;
      /** adding lost sum on rounding */
      if (i === installmentsNumber - 1) {
        capitalSum += inst.remain;
        sum += inst.remain;
        inst.remain = 0;
      }

      const prevInst = this.installments[i - 1];

      if (prevInst) {
        this.installments[i - 1].nextInstalmentId = inst.instalmentId;
        inst.prevInstalmentId = prevInst.instalmentId;
      }

      this.installments.push(inst);
    }

    return {
      installments: this.installments,
      amount: rnd(amount),
      interestSum: rnd(interestSum),
      capitalSum: rnd(capitalSum),
      sum: rnd(sum),
    };
  }

  getPeriodicPayment(
    amount: number,
    installmentsNumber: number,
    interestRate: number,
    downPayment?: number,
    period: PaymentPeriodType = "MONTHLY",
    diminishing = false
  ): number {
    if (downPayment) amount = amount - downPayment;
    return this.getNextInstalment(
      amount,
      installmentsNumber,
      interestRate,
      diminishing,
      0,
      0,
      PaymentPeriod[period]
    ).installment;
  }
}
