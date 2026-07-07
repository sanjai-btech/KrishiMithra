import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Sprout, Mail, Lock, Eye, EyeOff, User, Phone, Ruler, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LangContext";
import heroImg from "@/assets/hero-farm.jpg";

const farmSizes = [
  { en: "Less than 1 acre", ml: "1 ഏക്കറിൽ താഴെ" },
  { en: "1-3 acres", ml: "1-3 ഏക്കർ" },
  { en: "3-5 acres", ml: "3-5 ഏക്കർ" },
  { en: "5-10 acres", ml: "5-10 ഏക്കർ" },
  { en: "More than 10 acres", ml: "10 ഏക്കറിൽ കൂടുതൽ" },
];

const cropTypes = [
  { en: "Rice", ml: "നെല്ല്" },
  { en: "Coconut", ml: "തെങ്ങ്" },
  { en: "Rubber", ml: "റബ്ബർ" },
  { en: "Banana", ml: "വാഴ" },
  { en: "Black Pepper", ml: "കുരുമുളക്" },
  { en: "Tapioca", ml: "മരച്ചീനി" },
  { en: "Ginger", ml: "ഇഞ്ചി" },
  { en: "Vegetables", ml: "പച്ചക്കറികൾ" },
  { en: "Cardamom", ml: "ഏലക്ക" },
  { en: "Coffee", ml: "കാപ്പി" },
];

const irrigationTypes = [
  { en: "Rainfed", ml: "മഴയെ ആശ്രയിച്ച്" },
  { en: "Drip Irrigation", ml: "തുള്ളി നന" },
  { en: "Sprinkler", ml: "സ്പ്രിംഗ്ലർ" },
  { en: "Canal/River", ml: "കനാൽ/നദി" },
  { en: "Well/Borewell", ml: "കിണർ/ബോർവെൽ" },
];

interface DropdownFieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  options: { en: string; ml: string }[];
  lang: string;
  onSelect: (val: string) => void;
}

const DropdownField = ({ icon, placeholder, value, options, lang, onSelect }: DropdownFieldProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left"
      >
        {icon}
        <span className={`flex-1 text-sm font-medium ${value ? "text-foreground" : "text-muted-foreground"}`}>
          {value ? (lang === "ml" ? options.find(o => o.en === value)?.ml || value : value) : placeholder}
        </span>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {options.map((o) => (
            <button key={o.en} type="button" onClick={() => { onSelect(o.en); setOpen(false); }}
              className={`block w-full px-4 py-3 text-left text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-primary/10 ${o.en === value ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}>
              {lang === "ml" ? o.ml : o.en}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [cropType, setCropType] = useState("");
  const [irrigation, setIrrigation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Hero */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src={heroImg} alt="Kerala farmland" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <button
          onClick={toggleLang}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-primary-foreground/30 bg-primary/80 px-3 py-1.5 text-xs font-bold text-primary-foreground backdrop-blur-sm"
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === "en" ? "മലയാളം" : "English"}
        </button>
      </div>

      {/* Content */}
      <div className="relative -mt-10 flex flex-1 flex-col items-center px-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-5 flex flex-col items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero">
              <Sprout className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">{t("KrishiMitra", "കൃഷിമിത്ര")}</h1>
            <p className="text-sm text-muted-foreground">{t("AI-Powered Farming Assistant", "AI കൃഷി സഹായി")}</p>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex rounded-xl bg-muted p-1">
            <button onClick={() => setIsRegister(false)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${!isRegister ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t("Login", "ലോഗിൻ")}
            </button>
            <button onClick={() => setIsRegister(true)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${isRegister ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t("Register", "രജിസ്റ്റർ")}
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {isRegister && (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder={t("Full Name", "പേര്")}
                    className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel"
                    placeholder={t("Phone Number", "ഫോൺ നമ്പർ")}
                    className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
              </>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                placeholder={t("Email address", "ഇമെയിൽ വിലാസം")}
                className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <input value={password} onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder={t("Password", "പാസ്‌വേഡ്")}
                className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" />
              <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {isRegister && (
              <>
                <DropdownField
                  icon={<Ruler className="h-5 w-5 text-muted-foreground" />}
                  placeholder={t("Farm Size", "കൃഷിയിടത്തിന്റെ വലിപ്പം")}
                  value={farmSize} options={farmSizes} lang={lang}
                  onSelect={setFarmSize}
                />
                <DropdownField
                  icon={<Leaf className="h-5 w-5 text-muted-foreground" />}
                  placeholder={t("Primary Crop", "പ്രധാന വിള")}
                  value={cropType} options={cropTypes} lang={lang}
                  onSelect={setCropType}
                />
                <DropdownField
                  icon={<Sprout className="h-5 w-5 text-muted-foreground" />}
                  placeholder={t("Irrigation Type", "ജലസേചന രീതി")}
                  value={irrigation} options={irrigationTypes} lang={lang}
                  onSelect={setIrrigation}
                />
              </>
            )}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} className="btn-farm-primary mt-5 w-full text-center">
            {isRegister ? t("Create Account", "അക്കൗണ്ട് സൃഷ്ടിക്കുക") : t("Login", "ലോഗിൻ")}
          </button>

          <button onClick={() => setIsRegister(!isRegister)} className="mt-4 w-full text-center text-xs text-muted-foreground">
            {isRegister
              ? t("Already registered? Login", "ഇതിനകം രജിസ്റ്റർ ചെയ്തോ? ലോഗിൻ ചെയ്യുക")
              : t("New farmer? Register here", "പുതിയ കർഷകൻ? ഇവിടെ രജിസ്റ്റർ ചെയ്യുക")}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
