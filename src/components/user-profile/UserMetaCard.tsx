"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { usePermissions } from "@/context/AuthContext";
import { useUpdateMe } from "@/hooks/useAuth";

// Mirrors the backend's validate_full_name: 2–255 characters after trimming.
const nameSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must not exceed 255 characters"),
});

type NameFormData = z.infer<typeof nameSchema>;

const initials = (name?: string | null, email?: string | null) => {
  const source = (name || "").trim();
  if (source) {
    const parts = source.split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
};

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  // Server-driven (see AuthContext) — never read from the localStorage cache.
  const { admin } = usePermissions();
  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { full_name: "" },
  });

  // Start every edit from the current saved name, so a cancelled draft never
  // reappears and a background /me refetch never overwrites what's typed.
  const startEdit = () => {
    reset({ full_name: admin?.full_name ?? "" });
    openModal();
  };

  const draft = useWatch({ control, name: "full_name" }) ?? "";
  const unchanged = draft.trim() === (admin?.full_name ?? "").trim();

  const onSubmit = (data: NameFormData) => {
    updateMe.mutate({ full_name: data.full_name }, { onSuccess: () => closeModal() });
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="flex items-center justify-center w-20 h-20 text-2xl font-semibold rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              {initials(admin?.full_name, admin?.email)}
            </div>
            <div className="text-center xl:text-left">
              <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {admin?.full_name || "—"}
              </h4>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 break-all">
                {admin?.email ?? ""}
              </p>
              {admin && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    admin.role.is_super
                      ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
                      : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300"
                  }`}
                >
                  {admin.role.name}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={startEdit}
            disabled={!admin}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 xl:w-auto xl:whitespace-nowrap"
          >
            Edit name
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
        <div className="p-6">
          <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Edit name
          </h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="profile-full-name">
                Full name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="profile-full-name"
                type="text"
                autoComplete="name"
                {...register("full_name")}
                error={!!errors.full_name}
                hint={errors.full_name?.message}
                disabled={updateMe.isPending}
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={updateMe.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMe.isPending || unchanged || !draft.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMe.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
