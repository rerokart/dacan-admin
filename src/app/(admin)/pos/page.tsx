"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  usePOSProductSearch,
  usePOSCustomerSearch,
  usePOSCart,
  useCreatePOSCustomer,
  useCreatePOSOrder,
} from "@/hooks/usePOS";
import type { POSProduct, POSCartItem, OfflineOrderResponse, POSCustomer } from "@/services/pos.service";
import { formatReceiptDate } from "@/services/pos.service";
import { formatCurrency } from "@/utils/helpers/helperfn";
import { priceWithGst } from "@/utils/margin";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { usePermissions } from "@/context/AuthContext";
import { TAX_READ_PERMISSIONS } from "@/components/products/product-form/tabs/PricingTab";
import PermissionGuard from "@/components/auth/PermissionGuard";
import Can from "@/components/auth/Can";

type PaymentMethod = "cash" | "card" | "upi";

function POSPageContent() {
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ full_name: "", mobile: "", email: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OfflineOrderResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [variantProduct, setVariantProduct] = useState<POSProduct | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Prices shown with GST (what the customer pays per unit). Totals still come from the server quote.
  const { can } = usePermissions();
  const { data: taxSettings } = useTaxSettings({ enabled: can(TAX_READ_PERMISSIONS) });
  const {
    cart,
    selectedCustomer,
    setSelectedCustomer,
    couponCode,
    setCouponCode,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totals,
  } = usePOSCart();

  const { data: searchData, isLoading: loadingProducts } = usePOSProductSearch(productSearch);
  const products = searchData?.products;
  const priceText = (price: number, rate?: number | null) => {
    // The store setting comes from the tax settings, the product search or the quote.
    // Until one of them has answered, show a placeholder, never a bare number.
    const includeGst =
      taxSettings?.prices_include_gst ?? searchData?.prices_include_gst ?? totals.quote?.summary.prices_include_gst;
    if (includeGst === undefined || includeGst === null) return "…";
    if (includeGst) return formatCurrency(price);
    // With no known rate we never guess an exact figure: show the price with "+ GST".
    if (rate === null || rate === undefined) return `${formatCurrency(price)} + GST`;
    return formatCurrency(priceWithGst(price, rate, false) ?? price);
  };

  const { data: customers, isLoading: loadingCustomers } = usePOSCustomerSearch(customerSearch);
  const { mutate: createCustomer, isPending: creatingCustomer } = useCreatePOSCustomer();
  const { mutate: createOrder, isPending: creatingOrder } = useCreatePOSOrder();

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleAddProduct = useCallback((product: POSProduct) => {
    if (product.has_variants && product.variants?.length) {
      setVariantProduct(product);
      setSelectedVariant(null);
    } else {
      addToCart(product);
      setProductSearch("");
    }
  }, [addToCart]);

  const handleAddVariant = useCallback(() => {
    if (variantProduct && selectedVariant) {
      addToCart(variantProduct, selectedVariant);
      setVariantProduct(null);
      setSelectedVariant(null);
      setProductSearch("");
    }
  }, [variantProduct, selectedVariant, addToCart]);

  const handleSelectCustomer = useCallback((customer: POSCustomer) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
  }, [setSelectedCustomer]);

  const handleCreateCustomer = useCallback(() => {
    if (!newCustomer.full_name || !newCustomer.mobile) return;

    createCustomer(newCustomer, {
      onSuccess: (customer) => {
        setSelectedCustomer(customer);
        setNewCustomer({ full_name: "", mobile: "", email: "" });
        setShowNewCustomerForm(false);
      },
    });
  }, [newCustomer, createCustomer, setSelectedCustomer]);

  const handleCompleteSale = useCallback(() => {
    if (cart.length === 0 || !totals.canCharge) return;

    createOrder(
      {
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        customer_id: selectedCustomer?.id || undefined,
        // Send the coupon the server just priced
        ...(totals.quote?.summary.coupon_code
          ? { coupon_code: totals.quote.summary.coupon_code }
          : {}),
        payment_method: paymentMethod,
        // Card/UPI: omit amount_paid so the server defaults it to its own total.
        ...(paymentMethod === "cash" ? { amount_paid: amountPaid } : {}),
      },
      {
        onSuccess: (order) => {
          setCompletedOrder(order);
          setShowReceipt(true);
        },
      }
    );
  }, [cart, selectedCustomer, paymentMethod, amountPaid, createOrder, totals.canCharge, totals.quote]);

  const handleNewSale = useCallback(() => {
    clearCart();
    setCompletedOrder(null);
    setShowReceipt(false);
    setPaymentMethod("cash");
    setAmountPaid(0);
    searchInputRef.current?.focus();
  }, [clearCart]);

  // Change due and the cash check use only the server quote's total.
  const quotedTotal = totals.canCharge ? totals.total : null;
  const changeAmount =
    paymentMethod === "cash" && quotedTotal !== null && amountPaid > quotedTotal
      ? amountPaid - quotedTotal
      : 0;
  const cashShort =
    paymentMethod === "cash" && quotedTotal !== null && amountPaid < quotedTotal;
  const summary = totals.quote?.summary;

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products by name or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : !productSearch ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Search for products to add to cart</p>
            </div>
          ) : products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {products?.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  disabled={product.stock_quantity === 0}
                  className="relative flex flex-col rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:border-brand-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-full rounded-lg object-cover mb-2"
                    />
                  ) : (
                    <div className="h-24 w-full rounded-lg bg-gray-100 dark:bg-gray-700 mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-brand-600">{priceText(product.price, product.gst_rate)}</span>
                    <span className={`text-xs ${product.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
                    </span>
                  </div>
                  {product.has_variants && (
                    <span className="absolute top-2 right-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-900/30">
                      Variants
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Sale
          </h2>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Customer Section */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          {selectedCustomer ? (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedCustomer.full_name}
                </p>
                <p className="text-sm text-gray-500">{selectedCustomer.mobile}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : showNewCustomerForm ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={newCustomer.full_name}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Mobile Number *"
                value={newCustomer.mobile}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, mobile: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewCustomerForm(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <Can permission="pos.create">
                  <button
                    onClick={handleCreateCustomer}
                    disabled={creatingCustomer || !newCustomer.full_name || !newCustomer.mobile}
                    className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    {creatingCustomer ? "..." : "Add"}
                  </button>
                </Can>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Search customer by phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                {loadingCustomers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
              {customers && customers.length > 0 && customerSearch && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{customer.full_name}</p>
                      <p className="text-gray-500">{customer.mobile}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Can permission="pos.create">
                  <button
                    onClick={() => setShowNewCustomerForm(true)}
                    className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    + New Customer
                  </button>
                </Can>
                <button
                  onClick={() => setSelectedCustomer({ id: "", full_name: "Walk-in Customer", mobile: "" })}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Walk-in
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <CartItem
                  key={`${item.product_id}-${item.variant_id || ""}`}
                  item={item}
                  priceLabel={priceText(item.price, totals.quote?.lines[cart.indexOf(item)]?.gst_rate ?? item.gst_rate)}
                  error={totals.quote?.lines[cart.indexOf(item)]?.error ?? null}
                  onUpdateQuantity={(qty) => updateQuantity(item.product_id, item.variant_id, qty)}
                  onRemove={() => removeFromCart(item.product_id, item.variant_id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          {/* Payment Method */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "card", "upi"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                    paymentMethod === method
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Received (only for cash payment) */}
          {paymentMethod === "cash" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cash Received
              </label>
              <input
                type="number"
                value={amountPaid || ""}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Coupon */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coupon
            </label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              disabled={cart.length === 0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            {totals.couponError && (
              <p className="mt-1 text-xs text-red-600">{totals.couponError}</p>
            )}
            {summary && !totals.couponError && summary.coupon_code && (
              <p className="mt-1 text-xs text-green-600">
                {summary.coupon_code} applied: you save {formatCurrency(summary.discount_amount)}
              </p>
            )}
            {summary?.coupon_note && !totals.couponError && (
              <p className="mt-1 text-xs text-gray-500">{summary.coupon_note}</p>
            )}
          </div>

          {/* Totals (server quote) */}
          <div className="space-y-2 text-sm">
            {cart.length > 0 && totals.quoteError ? (
              <p className="text-red-600">Could not price this sale. Change the cart or try again.</p>
            ) : cart.length > 0 && !summary ? (
              <p className="text-gray-500">Calculating totals...</p>
            ) : summary ? (
              <>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({totals.itemCount} items)</span>
                  <span>{formatCurrency(summary.subtotal)}</span>
                </div>
                {summary.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon discount</span>
                    <span>-{formatCurrency(summary.discount_amount)}</span>
                  </div>
                )}
                {summary.delivery_charge > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery</span>
                    <span>{formatCurrency(summary.delivery_charge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Taxable value</span>
                  <span>{formatCurrency(summary.taxable_amount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>CGST</span>
                  <span>{formatCurrency(summary.cgst_amount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>SGST</span>
                  <span>{formatCurrency(summary.sgst_amount)}</span>
                </div>
                {summary.round_off !== 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Round off</span>
                    <span>{formatCurrency(summary.round_off)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatCurrency(summary.total_amount)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {summary.prices_include_gst ? "Prices include GST" : "GST added on top"}
                </p>
              </>
            ) : (
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(0)}</span>
              </div>
            )}
            {paymentMethod === "cash" && changeAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Change</span>
                <span>{formatCurrency(changeAmount)}</span>
              </div>
            )}
          </div>

          {/* Complete Sale Button */}
          <Can permission="pos.create">
            <button
              onClick={handleCompleteSale}
              disabled={
                cart.length === 0 ||
                creatingOrder ||
                totals.isQuoting ||
                !totals.canCharge ||
                cashShort
              }
              className="mt-4 w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingOrder
                ? "Processing..."
                : quotedTotal !== null
                  ? `Complete Sale - ${formatCurrency(quotedTotal)}`
                  : "Complete Sale"}
            </button>
          </Can>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {variantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select Variant
            </h3>
            <p className="mt-1 text-sm text-gray-500">{variantProduct.name}</p>
            <div className="mt-4 space-y-2">
              {variantProduct.variants?.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  disabled={variant.stock_quantity === 0}
                  className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedVariant === variant.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {variant.variant_name}
                    </p>
                    <p className="text-sm text-gray-500">{variant.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-600">{priceText(variant.price, variantProduct.gst_rate)}</p>
                    <p className={`text-xs ${variant.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {variant.stock_quantity > 0 ? `${variant.stock_quantity} in stock` : "Out of stock"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setVariantProduct(null);
                  setSelectedVariant(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVariant}
                disabled={!selectedVariant}
                className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900">
            <div className="text-center border-b border-dashed border-gray-300 pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Rerokart
              </h3>
              <p className="text-sm text-gray-500 mt-1">Tax Invoice</p>
              {completedOrder.store_gstin && (
                <p className="text-sm text-gray-500">GSTIN: {completedOrder.store_gstin}</p>
              )}
              <p className="text-sm text-gray-500">{formatReceiptDate(new Date(completedOrder.created_at))}</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                Order #{completedOrder.order_number}
              </p>
            </div>

            <div className="py-4 border-b border-dashed border-gray-300 dark:border-gray-700">
              {completedOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <div>
                    <span className="text-gray-900 dark:text-white">{item.product_name}</span>
                    {item.variant_name && (
                      <span className="text-gray-500"> ({item.variant_name})</span>
                    )}
                    <span className="text-gray-500"> x{item.quantity}</span>
                    {(item.hsn_code || item.gst_rate != null) && (
                      <p className="text-xs text-gray-500">
                        {item.hsn_code ? `HSN ${item.hsn_code}` : ""}
                        {item.hsn_code && item.gst_rate != null ? " · " : ""}
                        {item.gst_rate != null ? `GST ${item.gst_rate}%` : ""}
                      </p>
                    )}
                    {item.taxable_value != null && (
                      <p className="text-xs text-gray-500">
                        Taxable {formatCurrency(item.taxable_value)} · Tax {formatCurrency(item.tax_amount ?? 0)}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="py-4 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(completedOrder.subtotal)}</span>
              </div>
              {(completedOrder.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Coupon discount
                    {completedOrder.coupon_code ? ` (${completedOrder.coupon_code})` : ""}
                  </span>
                  <span>-{formatCurrency(completedOrder.discount_amount ?? 0)}</span>
                </div>
              )}
              {completedOrder.taxable_amount != null && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Taxable value</span>
                  <span>{formatCurrency(completedOrder.taxable_amount)}</span>
                </div>
              )}
              {completedOrder.cgst_amount != null && completedOrder.sgst_amount != null ? (
                <>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>CGST</span>
                    <span>{formatCurrency(completedOrder.cgst_amount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>SGST</span>
                    <span>{formatCurrency(completedOrder.sgst_amount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST</span>
                  <span>{formatCurrency(completedOrder.tax_amount)}</span>
                </div>
              )}
              {(completedOrder.round_off ?? 0) !== 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Round off</span>
                  <span>{formatCurrency(completedOrder.round_off ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(completedOrder.total_amount)}</span>
              </div>
              {completedOrder.prices_include_gst != null && (
                <p className="text-xs text-gray-500">
                  {completedOrder.prices_include_gst ? "Prices include GST" : "GST added on top"}
                </p>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-2">
                <span>Payment ({completedOrder.payment_method})</span>
                <span>{formatCurrency(completedOrder.amount_paid)}</span>
              </div>
              {completedOrder.change_amount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Change</span>
                  <span>{formatCurrency(completedOrder.change_amount)}</span>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-500 border-t border-dashed border-gray-300 pt-4 dark:border-gray-700">
              <p>Thank you for your purchase!</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Print
              </button>
              <button
                onClick={handleNewSale}
                className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function POSPage() {
  return (
    <PermissionGuard permission="pos.view">
      <POSPageContent />
    </PermissionGuard>
  );
}

// Cart Item Component
interface CartItemProps {
  item: POSCartItem;
  /** Unit price with GST, ready to show */
  priceLabel: string;
  error?: string | null;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

function CartItem({ item, priceLabel, error, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="h-12 w-12 rounded-lg object-cover"
        />
      ) : (
        <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
          {item.name}
        </p>
        {item.variant_name && (
          <p className="text-xs text-gray-500">{item.variant_name}</p>
        )}
        <p className="text-sm text-brand-600 font-medium">{priceLabel}</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="rounded bg-gray-200 p-1 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            disabled={item.quantity >= item.stock_quantity}
            className="rounded bg-gray-200 p-1 text-gray-600 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-400"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
