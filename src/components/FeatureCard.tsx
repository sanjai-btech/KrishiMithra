import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accentColor?: string;
  iconColor?: string;
  glowColor?: string;
  onClick?: () => void;
}

const FeatureCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  accentColor = "bg-primary/10",
  iconColor = "text-primary",
  glowColor,
  onClick,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.35, type: "spring", stiffness: 300, damping: 20 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30"
      style={{
        boxShadow: "0 2px 16px -4px hsl(var(--foreground) / 0.06), 0 1px 4px -1px hsl(var(--foreground) / 0.04)",
      }}
      onClick={onClick}
    >
      {/* Decorative gradient strip on left */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${accentColor} opacity-60 transition-opacity group-hover:opacity-100`}
      />

      {/* Subtle background glow on hover */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${glowColor || accentColor} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`}
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.5 }}
            className={`relative rounded-xl p-2.5 ${accentColor} transition-all duration-300 group-hover:shadow-md`}
          >
            <Icon className={`h-5 w-5 ${iconColor} transition-transform duration-300 group-hover:scale-110`} />
            {/* Pulse ring */}
            <span className={`absolute inset-0 rounded-xl ${accentColor} animate-ping opacity-0 group-hover:opacity-20`} style={{ animationDuration: "2s" }} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          {/* Hover arrow indicator */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-primary/10">
            <svg className={`h-3.5 w-3.5 ${iconColor} transition-transform duration-300 group-hover:translate-x-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div className="pl-[3.25rem]">{children}</div>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
