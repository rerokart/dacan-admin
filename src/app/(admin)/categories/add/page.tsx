"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
export default function AddCategory() {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description,
      status,
    };
    // TODO: API integration
    console.log("Form submitted:", data);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Category" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Category Information
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter category name"
                />
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  placeholder="Enter category description"
                  rows={4}
                  value={description}
                  onChange={setDescription}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  defaultValue={status}
                  onChange={setStatus}
                />
              </div>

              <div>
                <Label htmlFor="image">Category Image</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload image
                      </p>
                    </div>
                    <input id="image" type="file" className="hidden" accept="image/*" />
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
                Save Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
