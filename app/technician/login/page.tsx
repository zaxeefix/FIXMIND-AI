import { Wrench } from "lucide-react";
import { RoleLogin } from "@/components/role-login";

export default function TechnicianLogin() {
  return <RoleLogin role="technician" eyebrow="Technician portal" title="Repair workspace" copy="Review assigned repairs, AI diagnosis context, customer-ready notes, and repair progress." icon={<Wrench size={22} />} />;
}
