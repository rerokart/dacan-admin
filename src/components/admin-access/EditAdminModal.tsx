"use client";

import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useRoles, useUpdateAdmin } from "@/hooks/useAdminAccess";
import { usePermissions } from "@/context/AuthContext";
import type { AdminListItem } from "@/services/admin-access.service";

const editAdminSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(120, "Full name is too long"),
  role_id: z.string().min(1, "Select a role"),
});

type EditAdminFormData = z.infer<typeof editAdminSchema>;

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminListItem | null;
}

export default function EditAdminModal({ isOpen, onClose, admin }: EditAdminModalProps) {
  const { isSuper, admin: currentAdmin } = usePermissions();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const updateAdmin = useUpdateAdmin();

  const isSelf = !!admin && admin.id === currentAdmin?.id;

  // The admin object only carries the role's key/name (§4.4 contract); the
  // roles list has the id the update endpoint needs, so match on key.
  const currentRoleId = useMemo(() => {
    if (!admin) return "";
    return rolesData?.roles.find((role) => role.key === admin.role.key)?.id ?? "";
  }, [rolesData, admin]);

  const roleOptions = useMemo(() => {
    const roles = rolesData?.roles ?? [];
    return roles
      .filter((role) => isSuper || !role.is_super || role.key === admin?.role.key)
      .map((role) => ({ value: role.id, label: role.name }));
  }, [rolesData, isSuper, admin]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditAdminFormData>({
    resolver: zodResolver(editAdminSchema),
    values: admin ? { full_name: admin.full_name, role_id: currentRoleId } : undefined,
    defaultValues: { full_name: "", role_id: "" },
  });

  if (!admin) return null;

  const onSubmit = (data: EditAdminFormData) => {
    updateAdmin.mutate(
      {
        id: admin.id,
        // §4.6 rule 1: no self role changes — only full_name goes through for
        // the current admin's own row (the Select is disabled below too).
        body: isSelf ? { full_name: data.full_name } : { full_name: data.full_name, role_id: data.role_id },
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md m-4">
      <div className="p-6">
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit admin
        </h4>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div>
              <Label>Email</Label>
              <Input value={admin.email} disabled readOnly />
            </div>

            <div>
              <Label htmlFor="edit-full-name">
                Full name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="edit-full-name"
                type="text"
                {...register("full_name")}
                error={!!errors.full_name}
                hint={errors.full_name?.message}
                disabled={updateAdmin.isPending}
              />
            </div>

            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Controller
                control={control}
                name="role_id"
                render={({ field }) => (
                  <Select
                    options={roleOptions}
                    value={field.value}
                    placeholder={isLoadingRoles ? "Loading roles..." : "Select a role"}
                    onChange={field.onChange}
                    className={`w-full ${isSelf ? "pointer-events-none opacity-50" : ""}`}
                  />
                )}
              />
              {isSelf ? (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  You can&apos;t change your own role.
                </p>
              ) : (
                errors.role_id && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.role_id.message}</p>
                )
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateAdmin.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateAdmin.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateAdmin.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
