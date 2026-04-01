"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type DiscountType = "percentage" | "fixed" | "buyXgetY";

export default function DiscountCalculatorTool() {
  const t = useTranslations("toolUi");

  // Main calculator
  const [originalPrice, setOriginalPrice] = useState("100");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [fixedAmount, setFixedAmount] = useState("15");
  const [buyX, setBuyX] = useState("2");
  const [getY, setGetY] = useState("1");

  // Double discount
  const [enableDouble, setEnableDouble] = useState(false);
  const [secondDiscount, setSecondDiscount] = useState("10");

  const results = useMemo(() => {
    const price = parseFloat(originalPrice) || 0;
    if (price <= 0) return null;

    let discountAmount = 0;
    let finalPrice = price;

    switch (discountType) {
      case "percentage": {
        const pct = parseFloat(discountPercent) || 0;
        discountAmount = price * (pct / 100);
        finalPrice = price - discountAmount;
        break;
      }
      case "fixed": {
        discountAmount = Math.min(parseFloat(fixedAmount) || 0, price);
        finalPrice = price - discountAmount;
        break;
      }
      case "buyXgetY": {
        const x = parseInt(buyX) || 0;
        const y = parseInt(getY) || 0;
        if (x > 0 && y > 0) {
          const totalItems = x + y;
          const pricePerItem = price / totalItems;
          discountAmount = pricePerItem * y;
          finalPrice = price - discountAmount;
        }
        break;
      }
    }

    // Double discount
    let doubleFinal = finalPrice;
    let secondDiscountAmount = 0;
    if (enableDouble && discountType === "percentage") {
      const pct2 = parseFloat(secondDiscount) || 0;
      secondDiscountAmount = finalPrice * (pct2 / 100);
      doubleFinal = finalPrice - secondDiscountAmount;
    }

    // Effective discount percentage
    const totalSaved = enableDouble ? price - doubleFinal : discountAmount;
    const effectivePct = price > 0 ? (totalSaved / price) * 100 : 0;

    return {
      originalPrice: price,
      discountAmount,
      finalPrice: Math.max(0, finalPrice),
      savings: discountAmount,
      savingsPercent: price > 0 ? (discountAmount / price) * 100 : 0,
      // Double discount
      secondDiscountAmount,
      doubleFinal: Math.max(0, doubleFinal),
      effectivePct,
      totalSaved,
    };
  }, [originalPrice, discountType, discountPercent, fixedAmount, buyX, getY, enableDouble, secondDiscount]);

  const formatCurrency = (value: number): string => {
    return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        {/* Original Price */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">Original Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className={inputClass}
            placeholder="e.g. 100"
          />
        </div>

        {/* Discount Type Tabs */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-300">Discount Type</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "percentage" as DiscountType, label: "% Off" },
              { value: "fixed" as DiscountType, label: "$ Off" },
              { value: "buyXgetY" as DiscountType, label: "Buy X Get Y" },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDiscountType(opt.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  discountType === opt.value
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-gray-700 bg-gray-900 text-gray-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Discount Value Input */}
        {discountType === "percentage" && (
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-300">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className={inputClass}
              placeholder="e.g. 20"
            />
          </div>
        )}

        {discountType === "fixed" && (
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-300">Amount Off ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fixedAmount}
              onChange={(e) => setFixedAmount(e.target.value)}
              className={inputClass}
              placeholder="e.g. 15"
            />
          </div>
        )}

        {discountType === "buyXgetY" && (
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Buy (X items)</label>
              <input
                type="number"
                min="1"
                value={buyX}
                onChange={(e) => setBuyX(e.target.value)}
                className={inputClass}
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Get Free (Y items)</label>
              <input
                type="number"
                min="1"
                value={getY}
                onChange={(e) => setGetY(e.target.value)}
                className={inputClass}
                placeholder="e.g. 1"
              />
            </div>
          </div>
        )}

        {/* Double Discount Toggle */}
        {discountType === "percentage" && (
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Double Discount</label>
              <button
                onClick={() => setEnableDouble(!enableDouble)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  enableDouble ? "bg-indigo-600" : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    enableDouble ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {enableDouble && (
              <div className="mt-3">
                <label className="mb-2 block text-xs font-medium text-gray-400">Second Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={secondDiscount}
                  onChange={(e) => setSecondDiscount(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 10"
                />
                <p className="mt-1 text-xs text-gray-500">Applied on already discounted price</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Visual Price Comparison */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">Price Comparison</h3>
            <div className="flex items-end gap-6 justify-center">
              {/* Original */}
              <div className="text-center">
                <div
                  className="mx-auto w-20 rounded-t-lg bg-gray-600 transition-all duration-500"
                  style={{ height: `${Math.min(180, 180)}px` }}
                />
                <div className="mt-2 rounded-b-lg border border-gray-700 bg-gray-800 px-3 py-2">
                  <p className="text-xs text-gray-500 line-through">{formatCurrency(results.originalPrice)}</p>
                  <p className="text-xs text-gray-400">Original</p>
                </div>
              </div>
              {/* Discounted */}
              <div className="text-center">
                <div
                  className="mx-auto w-20 rounded-t-lg bg-indigo-500 transition-all duration-500"
                  style={{
                    height: `${Math.max(10, results.originalPrice > 0 ? (results.finalPrice / results.originalPrice) * 180 : 0)}px`,
                  }}
                />
                <div className="mt-2 rounded-b-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
                  <p className="text-sm font-bold text-indigo-400">{formatCurrency(results.finalPrice)}</p>
                  <p className="text-xs text-gray-400">After Discount</p>
                </div>
              </div>
              {/* Double Discount */}
              {enableDouble && discountType === "percentage" && (
                <div className="text-center">
                  <div
                    className="mx-auto w-20 rounded-t-lg bg-green-500 transition-all duration-500"
                    style={{
                      height: `${Math.max(10, results.originalPrice > 0 ? (results.doubleFinal / results.originalPrice) * 180 : 0)}px`,
                    }}
                  />
                  <div className="mt-2 rounded-b-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                    <p className="text-sm font-bold text-green-400">{formatCurrency(results.doubleFinal)}</p>
                    <p className="text-xs text-gray-400">Double Discount</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">You Save</p>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(enableDouble ? results.totalSaved : results.savings)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {(enableDouble ? results.effectivePct : results.savingsPercent).toFixed(1)}% off
              </p>
            </div>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-indigo-400">Final Price</p>
              <p className="text-3xl font-bold text-indigo-400">
                {formatCurrency(enableDouble ? results.doubleFinal : results.finalPrice)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 text-center">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Original Price</p>
              <p className="text-3xl font-bold text-gray-500 line-through">{formatCurrency(results.originalPrice)}</p>
            </div>
          </div>

          {/* Breakdown Details */}
          {enableDouble && discountType === "percentage" && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">Double Discount Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                  <span className="text-gray-400">Original Price</span>
                  <span className="font-semibold text-white">{formatCurrency(results.originalPrice)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                  <span className="text-gray-400">1st Discount ({discountPercent}%)</span>
                  <span className="font-semibold text-red-400">-{formatCurrency(results.discountAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                  <span className="text-gray-400">Price After 1st Discount</span>
                  <span className="font-semibold text-white">{formatCurrency(results.finalPrice)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-3">
                  <span className="text-gray-400">2nd Discount ({secondDiscount}%)</span>
                  <span className="font-semibold text-red-400">-{formatCurrency(results.secondDiscountAmount)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
                  <span className="font-medium text-indigo-400">Final Price</span>
                  <span className="text-lg font-bold text-indigo-400">{formatCurrency(results.doubleFinal)}</span>
                </div>
                <div className="mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-center">
                  <p className="text-xs text-yellow-400">
                    Note: {discountPercent}% + {secondDiscount}% does NOT equal{" "}
                    {(parseFloat(discountPercent) + parseFloat(secondDiscount)).toFixed(1)}% off.
                    Effective discount is {results.effectivePct.toFixed(1)}%.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buy X Get Y explanation */}
          {discountType === "buyXgetY" && (
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-400">How It Works</h3>
              <p className="text-sm text-gray-300">
                Buy {buyX} item(s) and get {getY} item(s) free. Total price of{" "}
                {formatCurrency(results.originalPrice)} is split across {parseInt(buyX) + parseInt(getY)} items.
                You effectively save {results.savingsPercent.toFixed(1)}% on the total.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
