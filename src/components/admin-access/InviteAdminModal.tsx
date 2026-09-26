"use client";

import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useRoles, useInviteAdmin } from "@/hooks/useAdminAccess";
import { usePermissions } from "@/context/AuthContext";

const inviteAdminSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  full_name: z.string().min(1, "Full name is required").max(120, "Full name is too long"),
  role_id: z.string().min(1, "Select a role"),
});

type InviteAdminFormData = z.infer<typeof inviteAdminSchema>;

const DEFAULT_VALUES: InviteAdminFormData = { email: "", full_name: "", role_id: "" };

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteAdminModal({ isOpen, onClose }: InviteAdminModalProps) {
  const { isSuper } = usePermissions();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const inviteAdmin = useInviteAdmin();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<InviteAdminFormData>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // A non-Super-Admin with admin_access.manage still can't hand out the
  // Super Admin role (spec §4.6 rule 2).
  const roleOptions = useMemo(() => {
    const roles = rolesData?.roles ?? [];
    return roles
      .filter((role) => isSuper || !role.is_super)
      .map((role) => ({ value: role.id, label: role.name }));
  }, [rolesData, isSuper]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = (data: InviteAdminFormData) => {
    inviteAdmin.mutate(data, {
      onSuccess: () => {
        reset(DEFAULT_VALUES);
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md m-4">
      <div className="p-6">
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          Invite admin
        </h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div>
              <Label htmlFor="invite-email">
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@decanindia.com"
                {...register("email")}
                error={!!errors.email}
                hint={errors.email?.message}
                disabled={inviteAdmin.isPending}
              />
            </div>

            <div>
              <Label htmlFor="invite-full-name">
                Full name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="invite-full-name"
                type="text"
                placeholder="Priya Sharma"
                {...register("full_name")}
                error={!!errors.full_name}
                hint={errors.full_name?.message}
                disabled={inviteAdmin.isPending}
              />
            </div>

            <div>
              <Label htmlFor="invite-role">
                Role <span className="text-error-500">*</span>
              </Label>
              <Controller
                control={control}
                name="role_id"
                render={({ field }) => (
                  <Select
                    options={roleOptions}
                    value={field.value}
                    placeholder={isLoadingRoles ? "Loading roles..." : "Select a role"}
                    onChange={field.onChange}
                    className="w-full"
                  />
                )}
              />
              {errors.role_id && (
                <p className="mt-1.5 text-xs text-error-500">{errors.role_id.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={inviteAdmin.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteAdmin.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviteAdmin.isPending ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
