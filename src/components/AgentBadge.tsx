import { type LucideIcon } from "lucide-react";

interface AgentBadgeProps {
  icon: LucideIcon;
  label: string;
}

const AgentBadge = ({ icon: Icon, label }: AgentBadgeProps) => (
  <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 transition-all hover:bg-primary/10 hover:border-primary/40 hover:scale-105 cursor-pointer">
    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
      <Icon className="h-2.5 w-2.5 text-primary" />
    </div>
    <span className="text-[11px] font-semibold text-primary">{label}</span>
    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
  </div>
);

export default AgentBadge;
