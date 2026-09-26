import { z } from "zod";

// =============================================================================
// ADMIN PASSWORD POLICY
// =============================================================================
// Mirrors the backend admin password policy (dacan-ecom-be):
// minimum 10 characters, at least one letter, at least one digit, and must
// not equal the account email. Applied to invitation acceptance and
// forgot-password reset.

export const ADMIN_PASSWORD_MIN_LENGTH = 10;

/**
 * Single password field schema. `email` is passed in per-call since it is
 * only known once the email step (forgot-password) or invitation
 * (accept-invite) has loaded — callers should rebuild the schema (e.g. via
 * `useMemo`) when the email becomes available.
 */
export const adminPasswordFieldSchema = (email?: string) =>
  z
    .string()
    .min(1, "Password is required")
    .min(
      ADMIN_PASSWORD_MIN_LENGTH,
      `Password must be at least ${ADMIN_PASSWORD_MIN_LENGTH} characters`
    )
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/\d/, "Password must include at least one digit")
    .refine(
      (value) => !email || value.trim().toLowerCase() !== email.trim().toLowerCase(),
      "Password must not be the same as your email"
    );

/**
 * password + confirmPassword pair with a match check. Used by both the
 * forgot-password reset step and accept-invitation.
 */
export const adminPasswordSchema = (email?: string) =>
  z
    .object({
      password: adminPasswordFieldSchema(email),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

export type AdminPasswordFormData = z.infer<ReturnType<typeof adminPasswordSchema>>;

// =============================================================================
// OTP SCHEMA
// =============================================================================

export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type OtpFormData = z.infer<typeof otpSchema>;
