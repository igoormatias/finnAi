import { describe, expect, it } from "vitest";

import {
  centsToCurrencyInput,
  formatCurrencyBRL,
  formatGrowthRate,
  formatPercent,
  maskCurrencyBRL,
  parseCurrencyBRL,
} from "./money";

describe("formatCurrencyBRL", () => {
  it("formats cents as BRL per spec examples", () => {
    expect(formatCurrencyBRL(100)).toBe("R$\u00a01,00");
    expect(formatCurrencyBRL(1000)).toBe("R$\u00a010,00");
    expect(formatCurrencyBRL(10000)).toBe("R$\u00a0100,00");
    expect(formatCurrencyBRL(123456)).toBe("R$\u00a01.234,56");
  });

  it("handles invalid numbers", () => {
    expect(formatCurrencyBRL(NaN)).toBe("R$\u00a00,00");
    expect(formatCurrencyBRL(Infinity)).toBe("R$\u00a00,00");
  });

  it("supports negative cents", () => {
    expect(formatCurrencyBRL(-100)).toBe("-R$\u00a01,00");
  });
});

describe("parseCurrencyBRL", () => {
  it("parses BRL formatted values", () => {
    expect(parseCurrencyBRL("R$ 12,34")).toBe(1234);
    expect(parseCurrencyBRL("12,34")).toBe(1234);
    expect(parseCurrencyBRL("1.234,56")).toBe(123456);
  });

  it("returns 0 for empty or invalid input", () => {
    expect(parseCurrencyBRL("")).toBe(0);
    expect(parseCurrencyBRL("abc")).toBe(0);
  });
});

describe("maskCurrencyBRL", () => {
  it("masks digit-by-digit as cents", () => {
    expect(maskCurrencyBRL("1")).toBe("R$\u00a00,01");
    expect(maskCurrencyBRL("12")).toBe("R$\u00a00,12");
    expect(maskCurrencyBRL("1234")).toBe("R$\u00a012,34");
    expect(maskCurrencyBRL("123456")).toBe("R$\u00a01.234,56");
  });

  it("returns empty for no digits", () => {
    expect(maskCurrencyBRL("")).toBe("");
    expect(maskCurrencyBRL("R$ ")).toBe("");
  });

  it("strips non-digits from pasted values", () => {
    expect(maskCurrencyBRL("1.234,56")).toBe("R$\u00a01.234,56");
  });
});

describe("roundtrip", () => {
  it("format → parse", () => {
    expect(parseCurrencyBRL(formatCurrencyBRL(123456))).toBe(123456);
  });

  it("mask → parse", () => {
    expect(parseCurrencyBRL(maskCurrencyBRL("123456"))).toBe(123456);
  });
});

describe("centsToCurrencyInput", () => {
  it("formats positive cents and returns empty for zero", () => {
    expect(centsToCurrencyInput(1234)).toBe("R$\u00a012,34");
    expect(centsToCurrencyInput(0)).toBe("");
  });
});

describe("formatPercent", () => {
  it("formats percent from decimal", () => {
    expect(formatPercent(0.125)).toBe("12.5%");
  });
});

describe("formatGrowthRate", () => {
  it("formats growth rate with sign", () => {
    expect(formatGrowthRate(0.08)).toBe("+8.0%");
    expect(formatGrowthRate(-0.03)).toBe("-3.0%");
  });
});
