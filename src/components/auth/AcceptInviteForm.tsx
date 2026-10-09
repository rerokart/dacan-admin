"use client";

import { Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { adminPasswordFieldSchema } from "@/validations/adminPassword";
import { useAcceptInvitation, useInvitation } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/constants/NavigationRoutes";

const buildAcceptInviteSchema = (email?: string) =>
  z
    .object({
      full_name: z
        .string()
        .min(1, "Full name is required")
        .max(120, "Full name is too long"),
      password: adminPasswordFieldSchema(email),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

type AcceptInviteFormData = z.infer<ReturnType<typeof buildAcceptInviteSchema>>;

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function AcceptInviteFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);

  const invitationQuery = useInvitation(token);
  const acceptInvitation = useAcceptInvitation();

  const invitation = invitationQuery.data;
  const invitationError = invitationQuery.error as (Error & { status?: number }) | null;
  const isExpiredOrUsed = invitationError?.status === 410;

  const schema = useMemo(() => buildAcceptInviteSchema(invitation?.email), [invitation?.email]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(schema),
    values: invitation
      ? { full_name: invitation.full_name, password: "", confirmPassword: "" }
      : undefined,
    defaultValues: { full_name: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: AcceptInviteFormData) => {
    if (!token || !invitation) return;
    acceptInvitation.mutate(
      { token, password: data.password, full_name: data.full_name },
      {
        onSuccess: () => {
          router.push(`${ROUTES.SIGN_IN}?email=${encodeURIComponent(invitation.email)}`);
        },
      }
    );
  };

  const heading = (
    <>
      <BrandLogo width={180} className="mb-8" priority />
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Accept Invitation
        </h1>
      </div>
    </>
  );

  // No token in the URL at all.
  if (!token) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          {heading}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This invitation link is missing its token. Ask your administrator for a new invite.
          </p>
          <div className="mt-5">
            <Link
              href={ROUTES.SIGN_IN}
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (invitationQuery.isLoading) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          {heading}
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Expired, used, or revoked — no form, per spec.
  if (isExpiredOrUsed) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          {heading}
          <p className="text-sm text-error-500" role="alert">
            This invitation has expired or was already used. Ask your administrator for a new
            invite.
          </p>
          <div className="mt-5">
            <Link
              href={ROUTES.SIGN_IN}
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Any other lookup failure (not found, network, etc).
  if (invitationQuery.isError || !invitation) {
    return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          {heading}
          <p className="text-sm text-error-500" role="alert">
            {invitationError?.message || "This invitation link could not be loaded."}
          </p>
          <div className="mt-5">
            <Link
              href={ROUTES.SIGN_IN}
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {heading}
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            You&apos;ve been invited as{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {invitation.role.name}
            </span>
            . Set your name and password to activate your account.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <Label>Email</Label>
                <Input value={invitation.email} type="email" disabled readOnly />
              </div>

              <div>
                <Label>Role</Label>
                <Input value={invitation.role.name} disabled readOnly />
              </div>

              <div>
                <Label>
                  Full name <span className="text-error-500">*</span>
                </Label>
                <Input
                  {...register("full_name")}
                  placeholder="Enter your full name"
                  error={!!errors.full_name}
                  hint={errors.full_name?.message}
                  disabled={acceptInvitation.isPending}
                />
              </div>

              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    error={!!errors.password}
                    hint={errors.password?.message}
                    disabled={acceptInvitation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label>
                  Confirm password <span className="text-error-500">*</span>
                </Label>
                <Input
                  {...register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  error={!!errors.confirmPassword}
                  hint={errors.confirmPassword?.message}
                  disabled={acceptInvitation.isPending}
                />
              </div>

              <div>
                <Button className="w-full" size="sm" disabled={acceptInvitation.isPending}>
                  {acceptInvitation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Activating...
                    </span>
                  ) : (
                    "Activate account"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInviteForm() {
  // useSearchParams() opts this subtree into client-side rendering, so Next
  // requires a Suspense boundary around it.
  return (
    <Suspense fallback={null}>
      <AcceptInviteFormInner />
    </Suspense>
  );
}
