import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Rerokart Admin",
  description: "Sign in to the Rerokart admin panel",
};

export default function SignIn() {
  return <SignInForm />;
}
