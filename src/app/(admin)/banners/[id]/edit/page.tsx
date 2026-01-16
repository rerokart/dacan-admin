"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { useBanner, useUpdateBanner } from "@/hooks/useBanners";

const formatDateForInput = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    display_order: 0,
    is_active: true,
    active_from: "",
    active_to: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: banner, isLoading: loadingBanner } = useBanner(bannerId);
  const { mutate: updateBanner, isPending } = useUpdateBanner();

  // Initialize form with existing data
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        description: banner.description || "",
        image_url: banner.image_url,
        link_url: banner.link_url || "",
        display_order: banner.display_order,
        is_active: banner.is_active,
        active_from: formatDateForInput(banner.active_from),
        active_to: formatDateForInput(banner.active_to),
      });
      setImagePreview(banner.image_url);
    }
  }, [banner]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      title: formData.title,
      description: formData.description || undefined,
      image_url: formData.image_url,
      link_url: formData.link_url || undefined,
      display_order: formData.display_order,
      is_active: formData.is_active,
      active_from: formData.active_from || undefined,
      active_to: formData.active_to || undefined,
    };

    updateBanner(
      { id: bannerId, data },
      {
        onSuccess: () => {
          router.push("/banners");
        },
      }
    );
  };

  if (loadingBanner) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Banner" />
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit Banner" />
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-red-500">Banner not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Banner" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Banner Information
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Banner Image */}
              <div className="lg:col-span-2">
                <Label htmlFor="image">Banner Image *</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-48 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({ ...prev, image_url: "" }));
                        }}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <label
                        htmlFor="image"
                        className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white cursor-pointer"
                      >
                        Change Image
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
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
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG or WEBP (Recommended: 1920x600)
                        </p>
                      </div>
                    </label>
                  )}
                  <input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Summer Sale"
                  required
                />
              </div>

              {/* Link URL */}
              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  type="url"
                  id="link_url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://example.com/sale"
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  placeholder="Enter banner description (optional)"
                  rows={3}
                  value={formData.description}
                  onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                />
              </div>

              {/* Display Order */}
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={String(formData.display_order)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first
                </p>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  options={[
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                  defaultValue={String(formData.is_active)}
                  onChange={(val) => setFormData((prev) => ({ ...prev, is_active: val === "true" }))}
                />
              </div>

              {/* Active From */}
              <div>
                <Label htmlFor="active_from">Active From</Label>
                <Input
                  type="date"
                  id="active_from"
                  name="active_from"
                  value={formData.active_from}
                  onChange={(e) => setFormData((prev) => ({ ...prev, active_from: e.target.value }))}
                />
              </div>

              {/* Active To */}
              <div>
                <Label htmlFor="active_to">Active Until</Label>
                <Input
                  type="date"
                  id="active_to"
                  name="active_to"
                  value={formData.active_to}
                  onChange={(e) => setFormData((prev) => ({ ...prev, active_to: e.target.value }))}
                  min={formData.active_from}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !formData.title || !formData.image_url}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {isPending ? "Updating..." : "Update Banner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
