"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { usePermissions } from "@/context/AuthContext";
import { useChangePassword } from "@/hooks/useAuth";
import { adminPasswordFieldSchema } from "@/validations/adminPassword";

const changePasswordSchema = (email?: string) =>
  z
    .object({
      currentPassword: z.string().min(1, "Enter your current password"),
      newPassword: adminPasswordFieldSchema(email),
      confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    });

type ChangePasswordFormData = z.infer<ReturnType<typeof changePasswordSchema>>;

export default function ChangePasswordCard() {
  const { admin } = usePermissions();
  const changePassword = useChangePassword();
  const schema = useMemo(() => changePasswordSchema(admin?.email), [admin?.email]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    // Server errors (e.g. wrong current password) arrive as a toast and keep
    // the form filled in; only success clears it.
    changePassword.mutate(
      { current_password: data.currentPassword, new_password: data.newPassword },
      { onSuccess: () => reset() }
    );
  };

  const pending = changePassword.isPending;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Change password</h4>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        You&apos;ll stay signed in here; other devices will be signed out.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Hidden username field so password managers file the new password
            under the right account. */}
        <input type="email" autoComplete="username" value={admin?.email ?? ""} readOnly hidden />
        <div>
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
            error={!!errors.currentPassword}
            hint={errors.currentPassword?.message}
            disabled={pending}
          />
        </div>
        <div>
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            error={!!errors.newPassword}
            hint={errors.newPassword?.message ?? "At least 10 characters, with a letter and a digit."}
            disabled={pending}
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            hint={errors.confirmPassword?.message}
            disabled={pending}
          />
        </div>
        <div className="lg:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={pending || !admin}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Changing..." : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}
