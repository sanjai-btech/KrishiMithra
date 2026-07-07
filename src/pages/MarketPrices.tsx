import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, RefreshCw } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { supabase } from "@/integrations/supabase/client";

interface MarketPrice {
  crop: string;
  cropMl: string;
  unit: string;
  price: number;
  trend: string;
  changePercent: number;
  prediction: string;
  predictionMl: string;
}

interface MarketData {
  prices: MarketPrice[];
  advisory: string;
  advisoryMl: string;
}

const MarketPrices = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<MarketPrice | null>(null);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("market-prices", {
        body: { district: "Wayanad" },
      });
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("Market fetch error:", e);
      // Fallback
      setData({
        prices: [
          { crop: "Coconut", cropMl: "തേങ്ങ", unit: "per kg", price: 32, trend: "up", changePercent: 5, prediction: "Prices to rise 3-5%", predictionMl: "വില 3-5% ഉയരും" },
          { crop: "Rubber", cropMl: "റബ്ബർ", unit: "per kg", price: 185, trend: "down", changePercent: 2, prediction: "Stable next month", predictionMl: "അടുത്ത മാസം സ്ഥിരം" },
          { crop: "Black Pepper", cropMl: "കുരുമുളക്", unit: "per kg", price: 520, trend: "up", changePercent: 3, prediction: "Strong demand", predictionMl: "ശക്തമായ ഡിമാൻഡ്" },
          { crop: "Cardamom", cropMl: "ഏലം", unit: "per kg", price: 1450, trend: "up", changePercent: 8, prediction: "Festival demand rising", predictionMl: "ഉത്സവ ഡിമാൻഡ് ഉയരുന്നു" },
          { crop: "Ginger", cropMl: "ഇഞ്ചി", unit: "per kg", price: 95, trend: "up", changePercent: 12, prediction: "Hold for better prices", predictionMl: "നല്ല വിലയ്ക്ക് സൂക്ഷിക്കുക" },
        ],
        advisory: "Best to sell ginger and cardamom now",
        advisoryMl: "ഇഞ്ചിയും ഏലവും ഇപ്പോൾ വിൽക്കുന്നത് നല്ലത്",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrices(); }, []);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 transition-colors hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">{t("Market Prices & Predictions", "വിപണി വിലകളും പ്രവചനങ്ങളും")}</h1>
          <p className="text-xs text-muted-foreground">{t("AI-powered price analysis for Kerala crops", "കേരള വിളകൾക്കുള്ള AI വില വിശകലനം")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPrices} className="rounded-xl bg-muted p-2 hover:bg-primary/10 transition-colors">
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
          <LangToggle />
        </div>
      </div>

      {/* Advisory */}
      {data?.advisory && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-xl bg-primary/10 px-4 py-3">
          <p className="text-sm font-semibold text-primary">💡 {lang === "ml" ? data.advisoryMl : data.advisory}</p>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("Fetching market data...", "മാർക്കറ്റ് ഡാറ്റ ലഭിക്കുന്നു...")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.prices?.map((p, i) => (
            <motion.div
              key={p.crop}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-farm-elevated cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => setSelectedCrop(selectedCrop?.crop === p.crop ? null : p)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{lang === "ml" ? p.cropMl : p.crop}</h3>
                  <span className="text-xs text-muted-foreground">{p.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-foreground">₹{p.price}</span>
                  <span className={`flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold ${
                    p.trend === "up" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                  }`}>
                    {p.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {p.changePercent}%
                  </span>
                </div>
              </div>

              {selectedCrop?.crop === p.crop && p.prediction && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                  <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">{t("AI Prediction", "AI പ്രവചനം")}</p>
                    <p className="text-sm text-foreground">{lang === "ml" ? p.predictionMl : p.prediction}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
