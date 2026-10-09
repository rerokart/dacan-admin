"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/validations/auth.schema";
import {
  adminPasswordSchema,
  AdminPasswordFormData,
  otpSchema,
  OtpFormData,
} from "@/validations/adminPassword";
import { useForgotPassword, useVerifyOtp, useResetPassword } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/constants/NavigationRoutes";

type Step = "email" | "otp" | "password";

const RESEND_COOLDOWN_SECONDS = 60;

/** Errors that mean the OTP/session is dead and the admin must restart from step 1. */
function isRestartError(message: string | undefined | null): boolean {
  if (!message) return false;
  return /code expired|too many attempts|reset link expired/i.test(message);
}

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

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const forgotPassword = useForgotPassword();
  const verifyOtp = useVerifyOtp();
  const resetPassword = useResetPassword();

  // Resend-code countdown.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // -- Step 1: email --------------------------------------------------------
  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmitEmail = (data: ForgotPasswordFormData) => {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        setEmail(data.email);
        setStep("otp");
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      },
    });
  };

  // -- Step 2: OTP ------------------------------------------------------------
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const otpFieldProps = otpForm.register("otp");

  const onSubmitOtp = (data: OtpFormData) => {
    verifyOtp.mutate(
      { email, otp: data.otp },
      {
        onSuccess: (response) => {
          setResetToken(response.reset_token);
          setStep("password");
        },
      }
    );
  };

  const handleResend = () => {
    if (resendCooldown > 0 || forgotPassword.isPending) return;
    forgotPassword.mutate(
      { email },
      {
        onSuccess: () => setResendCooldown(RESEND_COOLDOWN_SECONDS),
      }
    );
  };

  const otpErrorMessage = verifyOtp.error?.message;
  const otpNeedsRestart = isRestartError(otpErrorMessage);

  const restartFromEmail = () => {
    setStep("email");
    setResetToken(null);
    setResendCooldown(0);
    verifyOtp.reset();
    resetPassword.reset();
    otpForm.reset({ otp: "" });
  };

  // -- Step 3: new password -----------------------------------------------
  const passwordSchema = useMemo(() => adminPasswordSchema(email), [email]);
  const passwordForm = useForm<AdminPasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmitPassword = (data: AdminPasswordFormData) => {
    if (!resetToken) return;
    resetPassword.mutate({ reset_token: resetToken, password: data.password });
  };

  const resetErrorMessage = resetPassword.error?.message;
  const resetNeedsRestart = isRestartError(resetErrorMessage);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <BrandLogo width={180} className="mb-8" priority />
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === "email" &&
                "Enter your admin email and we'll send you a code to reset your password."}
              {step === "otp" && (
                <>
                  Enter the 6-digit code sent to <span className="font-medium">{email}</span>.
                </>
              )}
              {step === "password" && "Choose a new password for your account."}
            </p>
          </div>

          {/* Step 1: email */}
          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...emailForm.register("email")}
                    placeholder="info@gmail.com"
                    type="email"
                    error={!!emailForm.formState.errors.email}
                    hint={emailForm.formState.errors.email?.message}
                    disabled={forgotPassword.isPending}
                  />
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={forgotPassword.isPending}>
                    {forgotPassword.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner />
                        Sending code...
                      </span>
                    ) : (
                      "Send reset code"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && otpNeedsRestart && (
            // Terminal state (code expired / too many attempts) — rendered
            // outside a <form> on purpose so the restart button can't also
            // trigger a submit of stale OTP input.
            <div className="space-y-6">
              <p className="text-sm text-error-500" role="alert">
                {otpErrorMessage}
              </p>
              <Button className="w-full" size="sm" variant="outline" onClick={restartFromEmail}>
                Start again
              </Button>
            </div>
          )}

          {step === "otp" && !otpNeedsRestart && (
            <form onSubmit={otpForm.handleSubmit(onSubmitOtp)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    6-digit code <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    {...otpFieldProps}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      otpFieldProps.onChange(e);
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    error={!!otpForm.formState.errors.otp}
                    hint={otpForm.formState.errors.otp?.message}
                    disabled={verifyOtp.isPending}
                  />
                </div>

                {otpErrorMessage && (
                  <p className="text-sm text-error-500" role="alert">
                    {otpErrorMessage}
                  </p>
                )}

                <div>
                  <Button className="w-full" size="sm" disabled={verifyOtp.isPending}>
                    {verifyOtp.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner />
                        Verifying...
                      </span>
                    ) : (
                      "Verify code"
                    )}
                  </Button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || forgotPassword.isPending}
                    className="text-sm text-brand-500 hover:text-brand-600 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-brand-400 dark:disabled:text-gray-600"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: new password */}
          {step === "password" && resetNeedsRestart && (
            // Terminal state (single-use reset token expired) — rendered
            // outside a <form> so the restart button can't also submit.
            <div className="space-y-6">
              <p className="text-sm text-error-500" role="alert">
                {resetErrorMessage}
              </p>
              <Button className="w-full" size="sm" variant="outline" onClick={restartFromEmail}>
                Start again
              </Button>
            </div>
          )}

          {step === "password" && !resetNeedsRestart && (
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    New password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...passwordForm.register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      error={!!passwordForm.formState.errors.password}
                      hint={passwordForm.formState.errors.password?.message}
                      disabled={resetPassword.isPending}
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
                    {...passwordForm.register("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    error={!!passwordForm.formState.errors.confirmPassword}
                    hint={passwordForm.formState.errors.confirmPassword?.message}
                    disabled={resetPassword.isPending}
                  />
                </div>

                {resetErrorMessage && (
                  <p className="text-sm text-error-500" role="alert">
                    {resetErrorMessage}
                  </p>
                )}

                <div>
                  <Button className="w-full" size="sm" disabled={resetPassword.isPending}>
                    {resetPassword.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner />
                        Resetting...
                      </span>
                    ) : (
                      "Reset password"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Remembered your password?{" "}
              <Link
                href={ROUTES.SIGN_IN}
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
