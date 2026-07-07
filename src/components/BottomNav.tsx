import { Home, ShieldAlert, Calendar, MessageCircle, Landmark, TrendingUp } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/pesticides", icon: ShieldAlert, label: "Pesticide" },
  { to: "/chatbot", icon: MessageCircle, label: "Chat" },
  { to: "/market", icon: TrendingUp, label: "Market" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/schemes", icon: Landmark, label: "Schemes" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`rounded-xl p-1.5 transition-all ${isActive ? "gradient-hero" : ""}`}>
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : ""}`} />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
