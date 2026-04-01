import { redirect } from "next/navigation";

export default function TargetsPage() {
  redirect("/tasks?tab=targets");
}
