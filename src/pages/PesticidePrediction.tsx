import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bug, Camera, ShieldAlert, Leaf, Sprout, AlertTriangle, CheckCircle2, ChevronDown, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { speak } from "@/hooks/useSpeech";
import { supabase } from "@/integrations/supabase/client";

const cropTypes = ["Rice", "Coconut", "Rubber", "Banana", "Black Pepper", "Tapioca", "Ginger", "Vegetables"];
const cropTypesMl: Record<string, string> = {
  Rice: "നെല്ല്", Coconut: "തെങ്ങ്", Rubber: "റബ്ബർ", Banana: "വാഴ",
  "Black Pepper": "കുരുമുളക്", Tapioca: "മരച്ചീനി", Ginger: "ഇഞ്ചി", Vegetables: "പച്ചക്കറികൾ",
};

interface Pesticide {
  name: string; nameMl: string;
  type: "organic" | "chemical" | "bio";
  target: string; targetMl: string;
  dosage: string; dosageMl: string;
  safety: string; safetyMl: string;
  risk: "low" | "medium" | "high";
}

// Keep the static dataset as fallback
const pesticideData: Record<string, { diseases: string; diseasesMl: string; pesticides: Pesticide[] }> = {
  Rice: {
    diseases: "Common: Blast, Brown spot, Sheath blight, Stem borer, Leaf folder",
    diseasesMl: "സാധാരണം: ബ്ലാസ്റ്റ്, ബ്രൗൺ സ്‌പോട്ട്, ഷീത്ത് ബ്ലൈറ്റ്, തണ്ട് തുരപ്പൻ",
    pesticides: [
      { name: "🌿 Pseudomonas fluorescens", nameMl: "🌿 സ്യൂഡോമോണാസ്", type: "bio", target: "Blast & Sheath blight", targetMl: "ബ്ലാസ്റ്റ് & ഷീത്ത് ബ്ലൈറ്റ്", dosage: "10g/L water, spray at tillering", dosageMl: "10g/L വെള്ളം, ടില്ലറിംഗ് സമയത്ത്", safety: "No waiting period needed", safetyMl: "കാത്തിരിപ്പ് കാലം വേണ്ട", risk: "low" },
      { name: "🧪 Tricyclazole 75% WP", nameMl: "🧪 ട്രൈസൈക്ലസോൾ", type: "chemical", target: "Rice Blast", targetMl: "നെല്ല് ബ്ലാസ്റ്റ്", dosage: "0.6g/L, 2 sprays at 15-day interval", dosageMl: "0.6g/L, 15 ദിവസ ഇടവേളയിൽ 2 സ്‌പ്രേ", safety: "21-day waiting period before harvest", safetyMl: "വിളവെടുപ്പിന് 21 ദിവസം മുമ്പ്", risk: "medium" },
      { name: "🌱 Neem Oil 1500ppm", nameMl: "🌱 വേപ്പെണ്ണ", type: "organic", target: "Leaf folder & Stem borer", targetMl: "ഇല ചുരുട്ടി & തണ്ട് തുരപ്പൻ", dosage: "5ml/L water", dosageMl: "5ml/L വെള്ളം", safety: "Safe for beneficial insects", safetyMl: "ഗുണകരമായ കീടങ്ങൾക്ക് സുരക്ഷിതം", risk: "low" },
    ],
  },
  Coconut: {
    diseases: "Common: Rhinoceros beetle, Red palm weevil, Bud rot, Root wilt",
    diseasesMl: "സാധാരണം: കാണ്ടാമൃഗ വണ്ട്, ചെമ്പൻ ചെല്ലി, കൂമ്പ് ചീയൽ",
    pesticides: [
      { name: "🌿 Metarhizium anisopliae", nameMl: "🌿 മെറ്റാറൈസിയം", type: "bio", target: "Rhinoceros beetle", targetMl: "കാണ്ടാമൃഗ വണ്ട്", dosage: "Apply in manure pits, 5kg/ha", dosageMl: "വളക്കുഴിയിൽ 5kg/ഹെ", safety: "Eco-friendly, no residue", safetyMl: "പാരിസ്ഥിതിക സൗഹൃദം", risk: "low" },
      { name: "🌱 Neem Cake", nameMl: "🌱 വേപ്പിൻ പിണ്ണാക്ക്", type: "organic", target: "Root grubs & Red palm weevil", targetMl: "വേര് പുഴു & ചെമ്പൻ ചെല്ലി", dosage: "5kg per palm per year", dosageMl: "ഒരു മരത്തിന് വർഷം 5kg", safety: "Also acts as fertilizer", safetyMl: "വളമായും പ്രവർത്തിക്കും", risk: "low" },
    ],
  },
  Rubber: {
    diseases: "Common: Abnormal leaf fall, Powdery mildew, Pink disease",
    diseasesMl: "സാധാരണം: അസാധാരണ ഇലപൊഴിച്ചിൽ, പൗഡറി മിൽഡ്യൂ",
    pesticides: [
      { name: "🧪 Mancozeb 75% WP", nameMl: "🧪 മാൻകോസെബ്", type: "chemical", target: "Abnormal leaf fall", targetMl: "അസാധാരണ ഇലപൊഴിച്ചിൽ", dosage: "3g/L, aerial spray", dosageMl: "3g/L, ആകാശ സ്‌പ്രേ", safety: "Spray during re-foliation", safetyMl: "പുതിയ ഇലകൾ വരുമ്പോൾ", risk: "medium" },
      { name: "🌿 Trichoderma viride", nameMl: "🌿 ട്രൈക്കോഡെർമ", type: "bio", target: "Root rot", targetMl: "വേര് ചീയൽ", dosage: "50g per tree in root zone", dosageMl: "ഒരു മരത്തിന് 50g", safety: "Safe biological control", safetyMl: "സുരക്ഷിത ജൈവ നിയന്ത്രണം", risk: "low" },
    ],
  },
  Banana: {
    diseases: "Common: Panama wilt, Sigatoka leaf spot, Pseudostem weevil",
    diseasesMl: "സാധാരണം: പനാമ വാട്ടം, സിഗറ്റോക, തണ്ട് തുരപ്പൻ",
    pesticides: [
      { name: "🌿 Pseudomonas fluorescens", nameMl: "🌿 സ്യൂഡോമോണാസ്", type: "bio", target: "Panama wilt", targetMl: "പനാമ വാട്ടം", dosage: "20g/L, soil drenching", dosageMl: "20g/L, മണ്ണിൽ ഒഴിക്കുക", safety: "No chemical residue", safetyMl: "രാസ അവശിഷ്ടം ഇല്ല", risk: "low" },
      { name: "🌱 Beauveria bassiana", nameMl: "🌱 ബ്യൂവേറിയ", type: "bio", target: "Pseudostem weevil", targetMl: "തണ്ട് തുരപ്പൻ", dosage: "5g/L, inject into pseudostem", dosageMl: "5g/L, തണ്ടിൽ കുത്തിവയ്ക്കുക", safety: "Eco-friendly", safetyMl: "പാരിസ്ഥിതിക സൗഹൃദം", risk: "low" },
    ],
  },
  "Black Pepper": {
    diseases: "Common: Quick wilt (Phytophthora), Slow decline, Pollu beetle",
    diseasesMl: "സാധാരണം: വേഗ വാട്ടം, സാവധാന ക്ഷയം, പൊള്ളു വണ്ട്",
    pesticides: [
      { name: "🧪 Potassium Phosphonate", nameMl: "🧪 പൊട്ടാസ്യം ഫോസ്ഫോണേറ്റ്", type: "chemical", target: "Quick wilt", targetMl: "വേഗ വാട്ടം", dosage: "3ml/L, soil drench + foliar", dosageMl: "3ml/L, മണ്ണിലും ഇലയിലും", safety: "Low toxicity", safetyMl: "കുറഞ്ഞ വിഷാംശം", risk: "low" },
      { name: "🌱 Neem Oil", nameMl: "🌱 വേപ്പെണ്ണ", type: "organic", target: "Pollu beetle", targetMl: "പൊള്ളു വണ്ട്", dosage: "5ml/L at berry formation", dosageMl: "5ml/L കുരു രൂപീകരണ സമയത്ത്", safety: "Safe for consumption", safetyMl: "ഭക്ഷ്യയോഗ്യം", risk: "low" },
    ],
  },
  Tapioca: {
    diseases: "Common: Mosaic virus, Tuber rot, Mealybug, Spider mites",
    diseasesMl: "സാധാരണം: മൊസൈക്ക് വൈറസ്, കിഴങ്ങ് ചീയൽ, മീലിബഗ്",
    pesticides: [
      { name: "🌱 Fish Oil Rosin Soap", nameMl: "🌱 ഫിഷ് ഓയിൽ സോപ്പ്", type: "organic", target: "Mealybug & Spider mites", targetMl: "മീലിബഗ് & ചിലന്തി", dosage: "25g/L water spray", dosageMl: "25g/L വെള്ളം സ്‌പ്രേ", safety: "Non-toxic, organic approved", safetyMl: "വിഷരഹിതം", risk: "low" },
      { name: "🌿 Verticillium lecanii", nameMl: "🌿 വെർട്ടിസിലിയം", type: "bio", target: "Mealybug", targetMl: "മീലിബഗ്", dosage: "5g/L, evening spray", dosageMl: "5g/L, വൈകുന്നേരം", safety: "Safe for environment", safetyMl: "പരിസ്ഥിതിക്ക് സുരക്ഷിതം", risk: "low" },
    ],
  },
  Ginger: {
    diseases: "Common: Soft rot (Pythium), Bacterial wilt, Shoot borer",
    diseasesMl: "സാധാരണം: മൃദു ചീയൽ, ബാക്ടീരിയൽ വാട്ടം, തണ്ട് തുരപ്പൻ",
    pesticides: [
      { name: "🌿 Trichoderma + Pseudomonas", nameMl: "🌿 ട്രൈക്കോ + സ്യൂഡോ", type: "bio", target: "Soft rot", targetMl: "മൃദു ചീയൽ", dosage: "Seed treatment 10g/kg + soil", dosageMl: "വിത്ത് ശുദ്ധീകരണം 10g/kg", safety: "Best preventive method", safetyMl: "മികച്ച പ്രതിരോധ രീതി", risk: "low" },
      { name: "🌱 Neem Cake", nameMl: "🌱 വേപ്പിൻ പിണ്ണാക്ക്", type: "organic", target: "Shoot borer & Nematodes", targetMl: "തണ്ട് തുരപ്പൻ", dosage: "1kg per bed at planting", dosageMl: "നടുമ്പോൾ ഒരു തടത്തിന് 1kg", safety: "Enriches soil", safetyMl: "മണ്ണിനെ സമ്പുഷ്ടമാക്കുന്നു", risk: "low" },
    ],
  },
  Vegetables: {
    diseases: "Common: Fruit borer, Aphids, Whitefly, Leaf curl, Damping off",
    diseasesMl: "സാധാരണം: കായ തുരപ്പൻ, മുഞ്ഞ, വെള്ളീച്ച, ഇല ചുരുളൽ",
    pesticides: [
      { name: "🌿 Bacillus thuringiensis (Bt)", nameMl: "🌿 ബാസിലസ് (Bt)", type: "bio", target: "Fruit borer & Caterpillars", targetMl: "കായ തുരപ്പൻ", dosage: "2g/L, spray on leaves", dosageMl: "2g/L, ഇലകളിൽ സ്‌പ്രേ", safety: "Safe, no waiting period", safetyMl: "സുരക്ഷിതം, കാത്തിരിപ്പ് വേണ്ട", risk: "low" },
      { name: "🌱 Yellow Sticky Traps", nameMl: "🌱 മഞ്ഞ കെണി", type: "organic", target: "Whitefly & Aphids", targetMl: "വെള്ളീച്ച & മുഞ്ഞ", dosage: "12 traps per acre", dosageMl: "ഒരു ഏക്കറിന് 12 കെണി", safety: "Chemical-free monitoring", safetyMl: "രാസവസ്തു രഹിത നിരീക്ഷണം", risk: "low" },
    ],
  },
};

const typeColors: Record<string, { bg: string; text: string; label: string; labelMl: string }> = {
  organic: { bg: "bg-success/15", text: "text-success", label: "Organic", labelMl: "ജൈവം" },
  bio: { bg: "bg-info/15", text: "text-info", label: "Bio-control", labelMl: "ജൈവ നിയന്ത്രണം" },
  chemical: { bg: "bg-warning/15", text: "text-warning", label: "Chemical", labelMl: "രാസം" },
};

const riskColors: Record<string, { bg: string; text: string; label: string; labelMl: string }> = {
  low: { bg: "bg-success/15", text: "text-success", label: "Low Risk", labelMl: "കുറഞ്ഞ റിസ്ക്" },
  medium: { bg: "bg-warning/15", text: "text-warning", label: "Medium Risk", labelMl: "ഇടത്തരം റിസ്ക്" },
  high: { bg: "bg-destructive/15", text: "text-destructive", label: "High Risk", labelMl: "ഉയർന്ന റിസ്ക്" },
};

const PesticidePrediction = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [expandedPesticide, setExpandedPesticide] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = (crop: string) => {
    setAnalyzing(true);
    setResult(null);
    setAiResult(null);
    setExpandedPesticide(null);
    setTimeout(() => { setResult(crop); setAnalyzing(false); }, 1200);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setAnalyzing(true);
    setResult(null);
    setAiResult(null);

    try {
      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("plant-images")
        .upload(fileName, file, { contentType: file.type });

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: urlData } = supabase.storage.from("plant-images").getPublicUrl(fileName);
      const imageUrl = urlData.publicUrl;
      setUploadedImage(imageUrl);

      // Call AI analysis
      const { data, error } = await supabase.functions.invoke("analyze-plant", {
        body: { imageUrl },
      });

      if (error) throw error;

      if (data && !data.error) {
        setAiResult(data);
      } else {
        // Fallback to static data
        setResult("Rice");
        setSelectedCrop("Rice");
      }
    } catch (err) {
      console.error("Upload/analysis error:", err);
      setUploadError(t("Analysis failed. Try selecting crop manually.", "വിശകലനം പരാജയപ്പെട്ടു. മാനുവലായി വിള തിരഞ്ഞെടുക്കുക."));
      setResult("Rice");
      setSelectedCrop("Rice");
    } finally {
      setAnalyzing(false);
    }
  };

  const data = result ? pesticideData[result] : null;
  const displayPesticides: Pesticide[] = aiResult?.pesticides || data?.pesticides || [];
  const displayDisease = aiResult
    ? (lang === "ml" ? aiResult.symptomsMl || aiResult.diseaseMl : aiResult.symptoms || aiResult.disease)
    : data ? (lang === "ml" ? data.diseasesMl : data.diseases) : "";
  const diseaseTitle = aiResult
    ? (lang === "ml" ? aiResult.diseaseMl : aiResult.disease)
    : null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 transition-colors hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">{t("Pesticide Predictor", "കീടനാശിനി പ്രവചനം")}</h1>
          <p className="text-xs text-muted-foreground">{t("AI-powered pest detection & recommendations", "AI കീട കണ്ടെത്തൽ & ശുപാർശ")}</p>
        </div>
        <LangToggle />
      </div>

      {/* Upload Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-farm-elevated mb-4">
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
        {!uploadedImage ? (
          <button onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-8 transition-all hover:border-warning hover:bg-warning/5">
            <div className="rounded-xl bg-warning/10 p-3"><Camera className="h-7 w-7 text-warning" /></div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">{t("Upload Plant/Leaf Image", "ചെടി/ഇല ചിത്രം അപ്‌ലോഡ്")}</p>
              <p className="text-xs text-muted-foreground">{t("Take a photo or choose from gallery", "ഫോട്ടോ എടുക്കുക അല്ലെങ്കിൽ ഗാലറിയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക")}</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                <Camera className="mr-1 inline h-3 w-3" />{t("Camera", "ക്യാമറ")}
              </span>
              <span className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                <Upload className="mr-1 inline h-3 w-3" />{t("Gallery", "ഗാലറി")}
              </span>
            </div>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-32 w-32 overflow-hidden rounded-2xl ring-2 ring-warning/30">
              <img src={uploadedImage} alt="Uploaded plant" className="h-full w-full object-cover" />
            </div>
            {aiResult && (
              <div className="text-center">
                <span className="text-xs font-semibold text-success">✅ {t("Disease detected by AI", "AI രോഗം കണ്ടെത്തി")}</span>
                {diseaseTitle && <p className="mt-1 text-sm font-bold text-foreground">{diseaseTitle}</p>}
                {aiResult.severity && (
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${riskColors[aiResult.severity]?.bg} ${riskColors[aiResult.severity]?.text}`}>
                    {lang === "ml" ? riskColors[aiResult.severity]?.labelMl : riskColors[aiResult.severity]?.label}
                  </span>
                )}
              </div>
            )}
            <button onClick={() => { setUploadedImage(null); setAiResult(null); setResult(null); fileInputRef.current?.click(); }}
              className="text-xs font-semibold text-warning hover:underline">
              {t("Upload another image", "മറ്റൊരു ചിത്രം അപ്‌ലോഡ്")}
            </button>
          </div>
        )}
        {uploadError && <p className="mt-2 text-center text-xs text-destructive">{uploadError}</p>}
      </motion.div>

      {/* Crop Selector */}
      <div className="card-farm mb-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("Or select crop type manually", "അല്ലെങ്കിൽ വിള തിരഞ്ഞെടുക്കുക")}</p>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-warning">
            {selectedCrop ? (lang === "ml" ? cropTypesMl[selectedCrop] : selectedCrop) : t("Choose crop type...", "വിളയുടെ തരം തിരഞ്ഞെടുക്കുക...")}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
              {cropTypes.map((c) => (
                <button key={c} onClick={() => { setSelectedCrop(c); setDropdownOpen(false); setAiResult(null); handleAnalyze(c); }}
                  className={`block w-full px-4 py-3 text-left text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-warning/10 ${selectedCrop === c ? "bg-warning/10 text-warning font-bold" : "text-foreground"}`}>
                  {lang === "ml" ? cropTypesMl[c] : c}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Loading */}
      {analyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-warning" />
          <p className="text-sm font-semibold text-muted-foreground">
            {uploadedImage ? t("AI analyzing plant image...", "AI ചെടി ചിത്രം വിശകലനം ചെയ്യുന്നു...") : t("Analyzing pest risks...", "കീട റിസ്ക് വിശകലനം...")}
          </p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {(result || aiResult) && !analyzing && displayPesticides.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pb-4">
            <div className="card-farm-elevated">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="text-sm font-bold text-foreground">{t("Diseases & Pests", "രോഗങ്ങളും കീടങ്ങളും")}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{displayDisease}</p>
            </div>

            <div className="card-farm-elevated">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <ShieldAlert className="h-4 w-4 text-warning" />
                {t(`Recommended Pesticides (${displayPesticides.length})`, `ശുപാർശ ചെയ്ത കീടനാശിനികൾ (${displayPesticides.length})`)}
              </h3>
              <div className="space-y-2">
                {displayPesticides.map((p, idx) => {
                  const tc = typeColors[p.type] || typeColors.organic;
                  const rc = riskColors[p.risk] || riskColors.low;
                  return (
                    <motion.div key={p.name + idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                      <button onClick={() => {
                        setExpandedPesticide(expandedPesticide === p.name ? null : p.name);
                        const text = lang === "ml" ? `${p.nameMl}. ${p.targetMl}. ${p.dosageMl}` : `${p.name}. ${p.target}. ${p.dosage}`;
                        speak(text, lang === "ml" ? "ml-IN" : "en-US");
                      }} className="w-full rounded-xl p-3 text-left transition-colors hover:bg-muted/60">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">{lang === "ml" ? p.nameMl : p.name}</span>
                          <div className="flex gap-1.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tc.bg} ${tc.text}`}>
                              {lang === "ml" ? tc.labelMl : tc.label}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rc.bg} ${rc.text}`}>
                              {lang === "ml" ? rc.labelMl : rc.label}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("Target", "ലക്ഷ്യം")}: {lang === "ml" ? p.targetMl : p.target}
                        </p>
                      </button>
                      <AnimatePresence>
                        {expandedPesticide === p.name && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mx-2 mb-2 space-y-1.5 rounded-lg bg-muted/40 px-3 py-2">
                              <div className="flex items-start gap-2">
                                <Sprout className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                <p className="text-xs text-foreground"><span className="font-semibold">{t("Dosage", "അളവ്")}:</span> {lang === "ml" ? p.dosageMl : p.dosage}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                                <p className="text-xs text-foreground"><span className="font-semibold">{t("Safety", "സുരക്ഷ")}:</span> {lang === "ml" ? p.safetyMl : p.safety}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PesticidePrediction;
