import AcceptInviteForm from "@/components/auth/AcceptInviteForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invitation | Rerokart Admin",
  description: "Accept your Rerokart admin invitation",
};

export default function AcceptInvite() {
  return <AcceptInviteForm />;
}
