import { describe, expect, it } from "vitest";
import { extractItems, routeUtterance } from "./intent";

describe("routeUtterance", () => {
  it("routes a natural order with two items", () => {
    expect(routeUtterance("I need one Crocin and one milk, deliver to my home")).toEqual({
      kind: "order",
      items: ["Crocin", "milk"],
    });
  });

  it("routes a cake request as an order", () => {
    const result = routeUtterance("I want a chocolate birthday cake for tomorrow");
    expect(result.kind).toBe("order");
  });

  it("routes status questions", () => {
    expect(routeUtterance("Where is my order?")).toEqual({ kind: "status" });
    expect(routeUtterance("mera order kahan hai")).toEqual({ kind: "status" });
  });

  it("routes repeat requests", () => {
    expect(routeUtterance("Repeat my last order")).toEqual({ kind: "repeat" });
  });

  it("sends off-topic chat to the guardrail", () => {
    expect(routeUtterance("tell me a joke")).toEqual({ kind: "off_topic" });
    expect(routeUtterance("what is the weather today")).toEqual({ kind: "off_topic" });
  });

  it("treats empty input as off-topic", () => {
    expect(routeUtterance("   ")).toEqual({ kind: "off_topic" });
  });
});

describe("extractItems", () => {
  it("splits on commas, 'and' and Hindi 'aur'", () => {
    expect(extractItems("paracetamol, cough syrup aur bread")).toEqual([
      "paracetamol",
      "cough syrup",
      "bread",
    ]);
  });

  it("drops the address tail", () => {
    expect(extractItems("paracetamol deliver to my office")).toEqual(["paracetamol"]);
  });
});
