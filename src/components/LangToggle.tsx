import { Globe } from "lucide-react";
import { useLang } from "@/contexts/LangContext";

const LangToggle = () => {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:scale-105"
    >
      <Globe className="h-3.5 w-3.5" />
      {lang === "en" ? "മലയാളം" : "English"}
    </button>
  );
};

export default LangToggle;
