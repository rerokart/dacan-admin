"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";

export default function AddProduct() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("in_stock");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description,
      category,
      price: formData.get("price"),
      stock: formData.get("stock"),
      status,
    };
    // TODO: API integration
    console.log("Form submitted:", data);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Product" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Product Information
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter product name"
                />
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  placeholder="Enter product description"
                  rows={4}
                  value={description}
                  onChange={setDescription}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  options={[
                    { value: "electronics", label: "Electronics" },
                    { value: "clothing", label: "Clothing" },
                    { value: "home_garden", label: "Home & Garden" },
                    { value: "sports", label: "Sports" },
                  ]}
                  placeholder="Select Category"
                  defaultValue={category}
                  onChange={setCategory}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: "in_stock", label: "In Stock" },
                    { value: "low_stock", label: "Low Stock" },
                    { value: "out_of_stock", label: "Out of Stock" },
                  ]}
                  defaultValue={status}
                  onChange={setStatus}
                />
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  type="number"
                  id="stock"
                  name="stock"
                  placeholder="0"
                />
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="images">Product Images</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG or WEBP (MAX. 2MB)
                      </p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
