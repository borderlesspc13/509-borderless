import { redirect } from "next/navigation";

export default function ProntuarioRedirectPage() {
  redirect("/dashboard/pacientes");
}
