import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark, ArrowLeft, Shield, Tractor, HeartPulse, Leaf,
  GraduationCap, BadgeIndianRupee, Clock, CheckCircle2,
  AlertCircle, Volume2, ChevronRight, Bell, ExternalLink,
} from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import LangToggle from "@/components/LangToggle";
import { speak } from "@/hooks/useSpeech";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Scheme {
  id: string;
  name: string;
  nameMl: string;
  description: string;
  descriptionMl: string;
  category: "subsidy" | "insurance" | "training" | "equipment";
  benefits: string;
  benefitsMl: string;
  eligibility: string;
  eligibilityMl: string;
  amount: string;
  deadline?: string;
  isNew?: boolean;
  matchScore: number; // 0-100 personalization match
}

const schemes: Scheme[] = [
  {
    id: "pmkisan",
    name: "PM-KISAN Scheme",
    nameMl: "PM-കിസാൻ പദ്ധതി",
    description: "Direct income support of ₹6,000/year to farmer families in three equal installments.",
    descriptionMl: "കർഷക കുടുംബങ്ങൾക്ക് വർഷം ₹6,000 നേരിട്ട് വരുമാന സഹായം മൂന്ന് തുല്യ ഗഡുക്കളായി.",
    category: "subsidy",
    benefits: "₹6,000/year direct transfer",
    benefitsMl: "₹6,000/വർഷം നേരിട്ട് കൈമാറ്റം",
    eligibility: "All land-holding farmer families",
    eligibilityMl: "ഭൂമി ഉള്ള എല്ലാ കർഷക കുടുംബങ്ങൾ",
    amount: "₹6,000/yr",
    deadline: "2026-06-30",
    matchScore: 95,
  },
  {
    id: "mechanization",
    name: "Kerala Agri Mechanization",
    nameMl: "കേരള കാർഷിക യന്ത്രവൽക്കരണം",
    description: "50-80% subsidy on farm machinery including tillers, sprayers, and harvesters for Kerala farmers.",
    descriptionMl: "ടില്ലറുകൾ, സ്‌പ്രേയറുകൾ, ഹാർവെസ്റ്ററുകൾ എന്നിവയ്ക്ക് 50-80% സബ്‌സിഡി.",
    category: "equipment",
    benefits: "50-80% subsidy on machinery",
    benefitsMl: "യന്ത്രങ്ങൾക്ക് 50-80% സബ്‌സിഡി",
    eligibility: "Small & marginal farmers in Kerala",
    eligibilityMl: "കേരളത്തിലെ ചെറുകിട കർഷകർ",
    amount: "Up to ₹1.5L",
    isNew: true,
    matchScore: 88,
  },
  {
    id: "soilhealth",
    name: "Soil Health Card Scheme",
    nameMl: "സോയിൽ ഹെൽത്ത് കാർഡ് പദ്ധതി",
    description: "Free soil testing and nutrient-based fertilizer recommendations for every farm plot.",
    descriptionMl: "എല്ലാ കൃഷിഭൂമിക്കും സൗജന്യ മണ്ണ് പരിശോധനയും വളം ശുപാർശയും.",
    category: "training",
    benefits: "Free soil testing & report",
    benefitsMl: "സൗജന്യ മണ്ണ് പരിശോധന & റിപ്പോർട്ട്",
    eligibility: "All farmers",
    eligibilityMl: "എല്ലാ കർഷകരും",
    amount: "Free",
    matchScore: 92,
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana",
    nameMl: "PM ഫസൽ ബീമ യോജന",
    description: "Comprehensive crop insurance covering natural calamities, pests, and diseases at minimal premium.",
    descriptionMl: "പ്രകൃതി ദുരന്തങ്ങൾ, കീടങ്ങൾ, രോഗങ്ങൾ എന്നിവയ്ക്ക് സമഗ്ര വിള ഇൻഷുറൻസ്.",
    category: "insurance",
    benefits: "Crop loss coverage up to full sum insured",
    benefitsMl: "മുഴുവൻ ഇൻഷുർ തുക വരെ വിള നഷ്ട പരിരക്ഷ",
    eligibility: "All farmers growing notified crops",
    eligibilityMl: "അറിയിച്ച വിളകൾ കൃഷി ചെയ്യുന്ന എല്ലാ കർഷകരും",
    amount: "2% premium",
    deadline: "2026-07-15",
    matchScore: 85,
  },
  {
    id: "nmsa",
    name: "National Mission Sustainable Agri",
    nameMl: "ദേശീയ സുസ്ഥിര കൃഷി ദൗത്യം",
    description: "Support for climate-resilient farming practices including water harvesting and organic inputs.",
    descriptionMl: "ജല സംഭരണവും ജൈവ ഇൻപുട്ടുകളും ഉൾപ്പെടെ കാലാവസ്ഥാ പ്രതിരോധ കൃഷി.",
    category: "subsidy",
    benefits: "Up to ₹50,000 for sustainable practices",
    benefitsMl: "സുസ്ഥിര രീതികൾക്ക് ₹50,000 വരെ",
    eligibility: "Farmers adopting sustainable methods",
    eligibilityMl: "സുസ്ഥിര രീതികൾ സ്വീകരിക്കുന്ന കർഷകർ",
    amount: "Up to ₹50K",
    matchScore: 78,
  },
  {
    id: "organic",
    name: "Kerala Organic Farming Support",
    nameMl: "കേരള ജൈവ കൃഷി സഹായ പദ്ധതി",
    description: "Financial assistance and training for transitioning to organic farming with certification support.",
    descriptionMl: "ജൈവ കൃഷിയിലേക്ക് മാറുന്നതിനുള്ള സാമ്പത്തിക സഹായവും പരിശീലനവും.",
    category: "training",
    benefits: "₹20,000/ha + free certification",
    benefitsMl: "₹20,000/ഹെ + സൗജന്യ സർട്ടിഫിക്കേഷൻ",
    eligibility: "Farmers in Kerala with min 0.5 ha",
    eligibilityMl: "0.5 ഹെ. കുറഞ്ഞ ഭൂമി ഉള്ള കേരള കർഷകർ",
    amount: "₹20K/ha",
    isNew: true,
    deadline: "2026-09-30",
    matchScore: 90,
  },
];

const categoryConfig = {
  subsidy: { icon: BadgeIndianRupee, label: "Subsidy", labelMl: "സബ്‌സിഡി", color: "bg-success/15 text-success" },
  insurance: { icon: Shield, label: "Insurance", labelMl: "ഇൻഷുറൻസ്", color: "bg-info/15 text-info" },
  training: { icon: GraduationCap, label: "Training", labelMl: "പരിശീലനം", color: "bg-accent/20 text-accent-foreground" },
  equipment: { icon: Tractor, label: "Equipment", labelMl: "ഉപകരണം", color: "bg-secondary/15 text-secondary" },
};

const GovernmentSchemes = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? schemes : schemes.filter((s) => s.category === filter);
  const sorted = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
  const newCount = schemes.filter((s) => s.isNew).length;

  const speakScheme = (scheme: Scheme) => {
    const text = lang === "en"
      ? `${scheme.name}. ${scheme.description}. Benefits: ${scheme.benefits}. Eligibility: ${scheme.eligibility}.`
      : `${scheme.nameMl}. ${scheme.descriptionMl}. ആനുകൂല്യങ്ങൾ: ${scheme.benefitsMl}. യോഗ്യത: ${scheme.eligibilityMl}.`;
    speak(text, lang === "en" ? "en-US" : "ml-IN");
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-info";
    return "text-warning";
  };

  const getMatchBg = (score: number) => {
    if (score >= 90) return "bg-success/15";
    if (score >= 75) return "bg-info/15";
    return "bg-warning/15";
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-card p-2 border border-border">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-foreground">
                {t("Govt Schemes for You", "നിങ്ങൾക്കുള്ള സർക്കാർ പദ്ധതികൾ")}
              </h1>
              {newCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {newCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t("Personalized for your farm", "നിങ്ങളുടെ കൃഷിക്ക് അനുയോജ്യം")}</p>
          </div>
        </div>
        <LangToggle />
      </div>

      {/* Filter Chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: t("All", "എല്ലാം") },
          { key: "subsidy", label: t("Subsidy", "സബ്‌സിഡി") },
          { key: "insurance", label: t("Insurance", "ഇൻഷുറൻസ്") },
          { key: "training", label: t("Training", "പരിശീലനം") },
          { key: "equipment", label: t("Equipment", "ഉപകരണം") },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Scheme Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sorted.map((scheme, i) => {
            const cat = categoryConfig[scheme.category];
            const CatIcon = cat.icon;
            return (
              <motion.div
                key={scheme.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="card-farm-elevated cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => setSelectedScheme(scheme)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-xl p-2 ${cat.color}`}>
                      <CatIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-foreground">
                          {t(scheme.name, scheme.nameMl)}
                        </h3>
                        {scheme.isNew && (
                          <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive flex items-center gap-0.5">
                            <Bell className="h-2.5 w-2.5" /> {t("NEW", "പുതിയത്")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {t(scheme.description, scheme.descriptionMl).slice(0, 80)}…
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); speakScheme(scheme); }}
                    className="rounded-lg bg-muted p-1.5 hover:bg-primary/10 transition-colors"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${getMatchBg(scheme.matchScore)} ${getMatchColor(scheme.matchScore)}`}>
                      <CheckCircle2 className="mr-0.5 inline h-3 w-3" />
                      {scheme.matchScore}% {t("match", "പൊരുത്തം")}
                    </span>
                    <span className="text-xs font-bold text-foreground">{scheme.amount}</span>
                  </div>
                  {scheme.deadline && (
                    <span className="flex items-center gap-1 text-[10px] text-warning font-semibold">
                      <Clock className="h-3 w-3" />
                      {t("Deadline:", "അവസാന തീയതി:")} {new Date(scheme.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
            onClick={() => setSelectedScheme(null)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-lg rounded-t-3xl bg-card p-5 pb-8 border-t border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />

              {(() => {
                const cat = categoryConfig[selectedScheme.category];
                const CatIcon = cat.icon;
                return (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`rounded-xl p-2.5 ${cat.color}`}>
                        <CatIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-foreground">
                          {t(selectedScheme.name, selectedScheme.nameMl)}
                        </h2>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {t(cat.label, cat.labelMl)}
                        </Badge>
                      </div>
                      <button
                        onClick={() => speakScheme(selectedScheme)}
                        className="ml-auto rounded-xl bg-primary/10 p-2 hover:bg-primary/20 transition-colors"
                      >
                        <Volume2 className="h-4 w-4 text-primary" />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {t(selectedScheme.description, selectedScheme.descriptionMl)}
                    </p>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-start gap-2.5 rounded-xl bg-success/10 p-3">
                        <BadgeIndianRupee className="h-4 w-4 text-success mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-success">{t("Benefits", "ആനുകൂല്യങ്ങൾ")}</p>
                          <p className="text-xs text-foreground">{t(selectedScheme.benefits, selectedScheme.benefitsMl)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 rounded-xl bg-info/10 p-3">
                        <CheckCircle2 className="h-4 w-4 text-info mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-info">{t("Eligibility", "യോഗ്യത")}</p>
                          <p className="text-xs text-foreground">{t(selectedScheme.eligibility, selectedScheme.eligibilityMl)}</p>
                        </div>
                      </div>

                      {selectedScheme.deadline && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-warning/10 p-3">
                          <Clock className="h-4 w-4 text-warning mt-0.5" />
                          <div>
                            <p className="text-[11px] font-bold text-warning">{t("Deadline", "അവസാന തീയതി")}</p>
                            <p className="text-xs text-foreground">{new Date(selectedScheme.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 rounded-xl p-3" style={{ background: `hsl(var(--primary) / 0.08)` }}>
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <p className="text-xs text-foreground">
                          <span className="font-bold">{selectedScheme.matchScore}%</span> {t("personalized match based on your farm profile", "നിങ്ങളുടെ കൃഷി പ്രൊഫൈൽ അടിസ്ഥാനത്തിൽ പൊരുത്തം")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 rounded-xl font-bold"
                        onClick={() => setSelectedScheme(null)}
                        variant="outline"
                      >
                        {t("Close", "അടയ്ക്കുക")}
                      </Button>
                      <Button className="flex-1 rounded-xl font-bold gap-1.5">
                        <ExternalLink className="h-4 w-4" />
                        {t("Apply Now", "ഇപ്പോൾ അപേക്ഷിക്കുക")}
                      </Button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GovernmentSchemes;
