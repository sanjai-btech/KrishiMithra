import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";

interface FarmingTask {
  icon: string;
  label: string;
  labelMl: string;
  months: string;
  monthsMl: string;
}

interface PesticideReminder {
  month: string;
  monthMl: string;
  item: string;
  itemMl: string;
}

interface CropEntry {
  name: string;
  nameMl: string;
  emoji: string;
  category: string;
  months: number[];
  color: string;
  tip: string;
  tipMl: string;
  tasks: FarmingTask[];
  reminders: PesticideReminder[];
}

const crops: CropEntry[] = [
  {
    name: "Rice (Virippu)", nameMl: "നെല്ല് (വിരിപ്പ്)", emoji: "🌾", category: "Cereal",
    months: [4, 5, 6, 7, 8], color: "bg-primary",
    tip: "Main season rice. Sow May, transplant June. Best in waterlogged paddies.",
    tipMl: "പ്രധാന സീസൺ നെല്ല്. മെയിൽ വിതയ്ക്കുക, ജൂണിൽ നടുക.",
    tasks: [
      { icon: "🌱", label: "Sowing", labelMl: "വിതയ്ക്കൽ", months: "May", monthsMl: "മെയ്" },
      { icon: "🌿", label: "Transplanting", labelMl: "നടീൽ", months: "Jun", monthsMl: "ജൂൺ" },
      { icon: "🧪", label: "Fertilizer (Basal)", labelMl: "അടിവളം", months: "Jun", monthsMl: "ജൂൺ" },
      { icon: "💧", label: "Irrigation", labelMl: "ജലസേചനം", months: "Jun–Aug", monthsMl: "ജൂൺ–ഓഗ" },
      { icon: "🐛", label: "Pest control", labelMl: "കീട നിയന്ത്രണം", months: "Jul–Aug", monthsMl: "ജൂലൈ–ഓഗ" },
      { icon: "🧪", label: "Top dressing", labelMl: "മേൽവളം", months: "Jul", monthsMl: "ജൂലൈ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Sep", monthsMl: "സെപ്" },
    ],
    reminders: [
      { month: "Apr", monthMl: "ഏപ്രി", item: "⚠️ Order 50kg Urea + 30kg MOP", itemMl: "⚠️ 50kg യൂറിയ + 30kg MOP ഓർഡർ ചെയ്യുക" },
      { month: "May", monthMl: "മെയ്", item: "⚠️ Order seeds (Jyothi/Uma variety)", itemMl: "⚠️ വിത്തുകൾ ഓർഡർ ചെയ്യുക (ജ്യോതി/ഉമ)" },
      { month: "Jun", monthMl: "ജൂൺ", item: "⚠️ Carbofuran 3G for stem borer", itemMl: "⚠️ തണ്ട് തുരപ്പനെതിരെ കാർബോഫ്യൂറാൻ" },
    ],
  },
  {
    name: "Rice (Mundakan)", nameMl: "നെല്ല് (മുണ്ടകൻ)", emoji: "🌾", category: "Cereal",
    months: [8, 9, 10, 11], color: "bg-primary",
    tip: "Second crop. Short duration varieties preferred.",
    tipMl: "രണ്ടാം വിള. ഹ്രസ്വകാല ഇനങ്ങൾ മികച്ചത്.",
    tasks: [
      { icon: "🌱", label: "Sowing", labelMl: "വിതയ്ക്കൽ", months: "Sep", monthsMl: "സെപ്" },
      { icon: "🌿", label: "Transplanting", labelMl: "നടീൽ", months: "Sep–Oct", monthsMl: "സെപ്–ഒക്ടോ" },
      { icon: "🧪", label: "Fertilizer", labelMl: "വളപ്രയോഗം", months: "Oct", monthsMl: "ഒക്ടോ" },
      { icon: "🐛", label: "Pest control", labelMl: "കീട നിയന്ത്രണം", months: "Oct–Nov", monthsMl: "ഒക്ടോ–നവ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Dec", monthsMl: "ഡിസ" },
    ],
    reminders: [
      { month: "Aug", monthMl: "ഓഗ", item: "⚠️ Order 40kg Urea + seeds", itemMl: "⚠️ 40kg യൂറിയ + വിത്ത് ഓർഡർ ചെയ്യുക" },
      { month: "Sep", monthMl: "സെപ്", item: "⚠️ Chlorpyrifos for BPH", itemMl: "⚠️ BPH-ക്ക് ക്ലോർപൈറിഫോസ്" },
    ],
  },
  {
    name: "Rice (Puncha)", nameMl: "നെല്ല് (പുഞ്ച)", emoji: "🌾", category: "Cereal",
    months: [11, 0, 1, 2], color: "bg-primary",
    tip: "Summer rice in Kuttanad & Palakkad.",
    tipMl: "കുട്ടനാട്ടിലും പാലക്കാട്ടും വേനൽ കൃഷി.",
    tasks: [
      { icon: "🌱", label: "Sowing", labelMl: "വിതയ്ക്കൽ", months: "Dec", monthsMl: "ഡിസ" },
      { icon: "🌿", label: "Transplanting", labelMl: "നടീൽ", months: "Jan", monthsMl: "ജനു" },
      { icon: "💧", label: "Irrigation", labelMl: "ജലസേചനം", months: "Jan–Mar", monthsMl: "ജനു–മാർ" },
      { icon: "🧪", label: "Fertilizer", labelMl: "വളപ്രയോഗം", months: "Jan", monthsMl: "ജനു" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Mar", monthsMl: "മാർ" },
    ],
    reminders: [
      { month: "Nov", monthMl: "നവ", item: "⚠️ Order seeds + DAP 25kg", itemMl: "⚠️ വിത്ത് + DAP 25kg ഓർഡർ ചെയ്യുക" },
      { month: "Dec", monthMl: "ഡിസ", item: "⚠️ Pseudomonas for blast prevention", itemMl: "⚠️ ബ്ലാസ്റ്റ് തടയാൻ സ്യൂഡോമോണസ്" },
    ],
  },
  {
    name: "Coconut", nameMl: "തെങ്ങ്", emoji: "🥥", category: "Plantation",
    months: [0,1,2,3,4,5,6,7,8,9,10,11], color: "bg-success",
    tip: "Year-round. Harvest every 45 days. Apply fertilizer before monsoon.",
    tipMl: "വർഷം മുഴുവൻ. 45 ദിവസം കൂടുമ്പോൾ വിളവെടുക്കുക.",
    tasks: [
      { icon: "🧪", label: "Fertilizer (Organic)", labelMl: "ജൈവ വളം", months: "May–Jun", monthsMl: "മെയ്–ജൂൺ" },
      { icon: "🧪", label: "Fertilizer (Chemical)", labelMl: "രാസ വളം", months: "Sep–Oct", monthsMl: "സെപ്–ഒക്ടോ" },
      { icon: "🐛", label: "Rhinoceros beetle trap", labelMl: "കാണ്ടാമൃഗ വണ്ട് കെണി", months: "Mar–May", monthsMl: "മാർ–മെയ്" },
      { icon: "💧", label: "Irrigation (Summer)", labelMl: "വേനൽ ജലസേചനം", months: "Feb–May", monthsMl: "ഫെബ്–മെയ്" },
      { icon: "🍂", label: "Mulching", labelMl: "പുതയിടൽ", months: "Dec–Feb", monthsMl: "ഡിസ–ഫെബ്" },
      { icon: "🌾", label: "Harvest (every 45 days)", labelMl: "വിളവെടുപ്പ് (45 ദിവസം)", months: "Year-round", monthsMl: "വർഷം മുഴുവൻ" },
    ],
    reminders: [
      { month: "Apr", monthMl: "ഏപ്രി", item: "⚠️ Order Neem cake 10kg/tree", itemMl: "⚠️ വേപ്പിൻ പിണ്ണാക്ക് 10kg/മരം ഓർഡർ ചെയ്യുക" },
      { month: "Feb", monthMl: "ഫെബ്", item: "⚠️ Metarhizium for rhinoceros beetle", itemMl: "⚠️ കാണ്ടാമൃഗ വണ്ടിനെതിരെ മെറ്റാറൈസിയം" },
      { month: "Aug", monthMl: "ഓഗ", item: "⚠️ Bordeaux mixture for bud rot", itemMl: "⚠️ മുകുള ചീയലിന് ബോർഡോ മിശ്രിതം" },
    ],
  },
  {
    name: "Rubber", nameMl: "റബ്ബർ", emoji: "🌳", category: "Plantation",
    months: [0,1,2,3,4,5,6,7,8,9,10,11], color: "bg-success",
    tip: "Tapping: Feb–May & Sep–Dec. Rain guard needed in monsoon.",
    tipMl: "ടാപ്പിംഗ്: ഫെബ്–മെയ് & സെപ്–ഡിസ. മഴക്കാലത്ത് റെയിൻ ഗാർഡ് ആവശ്യം.",
    tasks: [
      { icon: "🌱", label: "New planting", labelMl: "പുതിയ നടീൽ", months: "Jun–Jul", monthsMl: "ജൂൺ–ജൂലൈ" },
      { icon: "🧪", label: "Fertilizer", labelMl: "വളപ്രയോഗം", months: "Jun & Oct", monthsMl: "ജൂൺ & ഒക്ടോ" },
      { icon: "🐛", label: "Abnormal leaf fall spray", labelMl: "അസാധാരണ ഇലപൊഴിച്ചിൽ സ്പ്രേ", months: "Jun–Jul", monthsMl: "ജൂൺ–ജൂലൈ" },
      { icon: "🌾", label: "Tapping season 1", labelMl: "ടാപ്പിംഗ് സീസൺ 1", months: "Feb–May", monthsMl: "ഫെബ്–മെയ്" },
      { icon: "🌾", label: "Tapping season 2", labelMl: "ടാപ്പിംഗ് സീസൺ 2", months: "Sep–Dec", monthsMl: "സെപ്–ഡിസ" },
    ],
    reminders: [
      { month: "Jan", monthMl: "ജനു", item: "⚠️ Order 10:10:10 NPK 1kg/tree", itemMl: "⚠️ 10:10:10 NPK 1kg/മരം ഓർഡർ ചെയ്യുക" },
      { month: "May", monthMl: "മെയ്", item: "⚠️ Mancozeb for leaf disease", itemMl: "⚠️ ഇല രോഗത്തിന് മാൻകോസെബ്" },
    ],
  },
  {
    name: "Black Pepper", nameMl: "കുരുമുളക്", emoji: "🫚", category: "Spice",
    months: [5, 6, 7, 8, 9, 10, 11], color: "bg-secondary",
    tip: "Flowers Jun–Jul. Harvest Dec–Jan. Needs support trees.",
    tipMl: "പൂക്കൾ ജൂൺ–ജൂലൈ. വിളവെടുപ്പ് ഡിസ–ജനു. താങ്ങു മരം ആവശ്യം.",
    tasks: [
      { icon: "🌱", label: "New planting", labelMl: "പുതിയ നടീൽ", months: "Jun–Jul", monthsMl: "ജൂൺ–ജൂലൈ" },
      { icon: "🧪", label: "Fertilizer (Organic)", labelMl: "ജൈവ വളം", months: "May–Jun", monthsMl: "മെയ്–ജൂൺ" },
      { icon: "🧪", label: "Fertilizer (Chemical)", labelMl: "രാസ വളം", months: "Sep", monthsMl: "സെപ്" },
      { icon: "🐛", label: "Quick wilt prevention", labelMl: "വേഗ വാട്ടം തടയൽ", months: "Jun–Aug", monthsMl: "ജൂൺ–ഓഗ" },
      { icon: "🍂", label: "Mulching", labelMl: "പുതയിടൽ", months: "Oct–Nov", monthsMl: "ഒക്ടോ–നവ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Dec–Jan", monthsMl: "ഡിസ–ജനു" },
    ],
    reminders: [
      { month: "May", monthMl: "മെയ്", item: "⚠️ Order Bordeaux paste + Trichoderma", itemMl: "⚠️ ബോർഡോ പേസ്റ്റ് + ട്രൈക്കോഡെർമ ഓർഡർ ചെയ്യുക" },
      { month: "Jun", monthMl: "ജൂൺ", item: "⚠️ Copper hydroxide for Phytophthora", itemMl: "⚠️ ഫൈറ്റോഫ്ത്തോറയ്ക്ക് കോപ്പർ ഹൈഡ്രോക്സൈഡ്" },
      { month: "Nov", monthMl: "നവ", item: "⚠️ Quinalphos for pollu beetle", itemMl: "⚠️ പൊള്ളു വണ്ടിനെതിരെ ക്വിനാൽഫോസ്" },
    ],
  },
  {
    name: "Cardamom", nameMl: "ഏലം", emoji: "🌿", category: "Spice",
    months: [5, 6, 7, 8, 9], color: "bg-secondary",
    tip: "Thrives in Idukki hills. Shade-loving. Harvest Aug–Feb.",
    tipMl: "ഇടുക്കി കുന്നുകളിൽ വളരുന്നു. തണൽ ഇഷ്ടപ്പെടുന്നു.",
    tasks: [
      { icon: "🌱", label: "Planting", labelMl: "നടീൽ", months: "Jun–Jul", monthsMl: "ജൂൺ–ജൂലൈ" },
      { icon: "🧪", label: "Fertilizer", labelMl: "വളപ്രയോഗം", months: "Jun & Sep", monthsMl: "ജൂൺ & സെപ്" },
      { icon: "💧", label: "Irrigation", labelMl: "ജലസേചനം", months: "Jan–May", monthsMl: "ജനു–മെയ്" },
      { icon: "🐛", label: "Thrips control", labelMl: "ത്രിപ്‌സ് നിയന്ത്രണം", months: "Mar–May", monthsMl: "മാർ–മെയ്" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Aug–Feb", monthsMl: "ഓഗ–ഫെബ്" },
    ],
    reminders: [
      { month: "Feb", monthMl: "ഫെബ്", item: "⚠️ Order Dimethoate for thrips", itemMl: "⚠️ ത്രിപ്‌സിനെതിരെ ഡൈമെത്തോയേറ്റ്" },
      { month: "May", monthMl: "മെയ്", item: "⚠️ Order NPK 75:75:150 g/plant", itemMl: "⚠️ NPK 75:75:150 g/ചെടി ഓർഡർ ചെയ്യുക" },
    ],
  },
  {
    name: "Turmeric", nameMl: "മഞ്ഞൾ", emoji: "🟡", category: "Spice",
    months: [4, 5, 6, 7, 8, 9, 10, 11], color: "bg-secondary",
    tip: "Plant May. Harvest after 8–9 months. Wayanad & Ernakulam.",
    tipMl: "മെയിൽ നടുക. 8–9 മാസം. വയനാട്, എറണാകുളം.",
    tasks: [
      { icon: "🌱", label: "Sowing (rhizomes)", labelMl: "വിതയ്ക്കൽ (കിഴങ്ങ്)", months: "May", monthsMl: "മെയ്" },
      { icon: "🧪", label: "Basal fertilizer", labelMl: "അടിവളം", months: "May", monthsMl: "മെയ്" },
      { icon: "🧪", label: "Top dressing", labelMl: "മേൽവളം", months: "Jul & Sep", monthsMl: "ജൂലൈ & സെപ്" },
      { icon: "🍂", label: "Mulching", labelMl: "പുതയിടൽ", months: "May–Jun", monthsMl: "മെയ്–ജൂൺ" },
      { icon: "🐛", label: "Shoot borer control", labelMl: "തണ്ട് തുരപ്പൻ നിയന്ത്രണം", months: "Jul–Sep", monthsMl: "ജൂലൈ–സെപ്" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Jan–Feb", monthsMl: "ജനു–ഫെബ്" },
    ],
    reminders: [
      { month: "Apr", monthMl: "ഏപ്രി", item: "⚠️ Order seed rhizomes + FYM", itemMl: "⚠️ വിത്ത് കിഴങ്ങ് + കാലിവളം ഓർഡർ ചെയ്യുക" },
      { month: "Jun", monthMl: "ജൂൺ", item: "⚠️ Dithane M-45 for leaf blotch", itemMl: "⚠️ ഇല പുള്ളിക്ക് ഡൈതെയ്ൻ M-45" },
    ],
  },
  {
    name: "Banana", nameMl: "വാഴ", emoji: "🍌", category: "Fruit",
    months: [0,1,2,3,4,5,6,7,8,9,10,11], color: "bg-accent",
    tip: "Nendran: plant Jan–Feb. Harvest in 11–12 months.",
    tipMl: "നേന്ത്രൻ: ജനു–ഫെബ് നടുക. 11–12 മാസം വിളവെടുപ്പ്.",
    tasks: [
      { icon: "🌱", label: "Planting (Nendran)", labelMl: "നടീൽ (നേന്ത്രൻ)", months: "Jan–Feb", monthsMl: "ജനു–ഫെബ്" },
      { icon: "🧪", label: "Fertilizer (Split dose)", labelMl: "വളം (വിഭജിച്ച്)", months: "Feb, May, Aug", monthsMl: "ഫെബ്, മെയ്, ഓഗ" },
      { icon: "💧", label: "Irrigation", labelMl: "ജലസേചനം", months: "Feb–May", monthsMl: "ഫെബ്–മെയ്" },
      { icon: "🐛", label: "Pseudostem weevil trap", labelMl: "തണ്ട് തുരപ്പൻ കെണി", months: "Mar–Jun", monthsMl: "മാർ–ജൂൺ" },
      { icon: "🍂", label: "Propping & mulching", labelMl: "താങ്ങ് & പുതയിടൽ", months: "Aug–Oct", monthsMl: "ഓഗ–ഒക്ടോ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Nov–Jan", monthsMl: "നവ–ജനു" },
    ],
    reminders: [
      { month: "Dec", monthMl: "ഡിസ", item: "⚠️ Order tissue culture suckers", itemMl: "⚠️ ടിഷ്യൂ കൾച്ചർ കന്ന് ഓർഡർ ചെയ്യുക" },
      { month: "Feb", monthMl: "ഫെബ്", item: "⚠️ Beauveria bassiana for weevil", itemMl: "⚠️ വീവിലിനെതിരെ ബ്യൂവേറിയ" },
      { month: "Apr", monthMl: "ഏപ്രി", item: "⚠️ Carbendazim for Sigatoka leaf spot", itemMl: "⚠️ സിഗറ്റോക്ക ഇലപ്പുള്ളിക്ക് കാർബെൻഡാസിം" },
    ],
  },
  {
    name: "Pineapple", nameMl: "കൈതച്ചക്ക", emoji: "🍍", category: "Fruit",
    months: [4, 5, 6, 7, 8, 9], color: "bg-accent",
    tip: "Plant suckers May–June. Vazhakulam is the hub.",
    tipMl: "മെയ്–ജൂണിൽ നടുക. വാഴക്കുളം പ്രധാന കേന്ദ്രം.",
    tasks: [
      { icon: "🌱", label: "Planting suckers", labelMl: "കന്ന് നടീൽ", months: "May–Jun", monthsMl: "മെയ്–ജൂൺ" },
      { icon: "🧪", label: "Fertilizer", labelMl: "വളപ്രയോഗം", months: "Jun, Sep, Dec", monthsMl: "ജൂൺ, സെപ്, ഡിസ" },
      { icon: "💧", label: "Irrigation", labelMl: "ജലസേചനം", months: "Jan–Apr", monthsMl: "ജനു–ഏപ്രി" },
      { icon: "🐛", label: "Mealy bug control", labelMl: "മീലി ബഗ് നിയന്ത്രണം", months: "Aug–Oct", monthsMl: "ഓഗ–ഒക്ടോ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Apr–Jun (next year)", monthsMl: "ഏപ്രി–ജൂൺ (അടുത്ത വർഷം)" },
    ],
    reminders: [
      { month: "Apr", monthMl: "ഏപ്രി", item: "⚠️ Order suckers + Ethrel for flowering", itemMl: "⚠️ കന്ന് + പൂവിടലിന് എത്രൽ ഓർഡർ ചെയ്യുക" },
      { month: "Jul", monthMl: "ജൂലൈ", item: "⚠️ Dimethoate for mealy bug", itemMl: "⚠️ മീലി ബഗിനെതിരെ ഡൈമെത്തോയേറ്റ്" },
    ],
  },
  {
    name: "Tapioca", nameMl: "മരച്ചീനി", emoji: "🥔", category: "Tuber",
    months: [2, 3, 4, 5, 6, 7, 8, 9], color: "bg-warning",
    tip: "Plant March–April. Harvest 8–10 months. Thrissur & Thiruvananthapuram.",
    tipMl: "മാർച്ച്–ഏപ്രിൽ നടുക. 8–10 മാസം. തൃശൂർ, തിരുവനന്തപുരം.",
    tasks: [
      { icon: "🌱", label: "Planting (stem cuttings)", labelMl: "നടീൽ (തണ്ട് മുറിവ്)", months: "Mar–Apr", monthsMl: "മാർ–ഏപ്രി" },
      { icon: "🧪", label: "Basal fertilizer", labelMl: "അടിവളം", months: "Mar", monthsMl: "മാർ" },
      { icon: "🧪", label: "Top dressing", labelMl: "മേൽവളം", months: "Jun", monthsMl: "ജൂൺ" },
      { icon: "🐛", label: "Spiralling whitefly control", labelMl: "വെള്ളീച്ച നിയന്ത്രണം", months: "May–Jul", monthsMl: "മെയ്–ജൂലൈ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Nov–Jan", monthsMl: "നവ–ജനു" },
    ],
    reminders: [
      { month: "Feb", monthMl: "ഫെബ്", item: "⚠️ Order stem cuttings (Sree Vijaya)", itemMl: "⚠️ തണ്ട് മുറിവ് (ശ്രീ വിജയ) ഓർഡർ ചെയ്യുക" },
      { month: "Apr", monthMl: "ഏപ്രി", item: "⚠️ Neem oil for whitefly", itemMl: "⚠️ വെള്ളീച്ചയ്ക്ക് വേപ്പെണ്ണ" },
    ],
  },
  {
    name: "Vegetables", nameMl: "പച്ചക്കറികൾ", emoji: "🥬", category: "Vegetable",
    months: [9, 10, 11, 0, 1, 2], color: "bg-info",
    tip: "Best Oct–Feb. Amaranth, beans, gourds, spinach.",
    tipMl: "ഒക്ടോ–ഫെബ് മികച്ചത്. ചീര, പയർ, കുമ്പളം.",
    tasks: [
      { icon: "🌱", label: "Sowing / transplanting", labelMl: "വിതയ്ക്കൽ / നടീൽ", months: "Sep–Oct", monthsMl: "സെപ്–ഒക്ടോ" },
      { icon: "🧪", label: "Organic manure", labelMl: "ജൈവ വളം", months: "Sep", monthsMl: "സെപ്" },
      { icon: "💧", label: "Regular irrigation", labelMl: "സ്ഥിരം ജലസേചനം", months: "Oct–Feb", monthsMl: "ഒക്ടോ–ഫെബ്" },
      { icon: "🐛", label: "Fruit fly trap", labelMl: "പഴ ഈച്ച കെണി", months: "Nov–Jan", monthsMl: "നവ–ജനു" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Nov–Feb", monthsMl: "നവ–ഫെബ്" },
    ],
    reminders: [
      { month: "Aug", monthMl: "ഓഗ", item: "⚠️ Order seeds + vermicompost", itemMl: "⚠️ വിത്ത് + മണ്ണിര കമ്പോസ്റ്റ് ഓർഡർ ചെയ്യുക" },
      { month: "Oct", monthMl: "ഒക്ടോ", item: "⚠️ Neem oil for aphids", itemMl: "⚠️ മുഞ്ഞയ്ക്ക് വേപ്പെണ്ണ" },
      { month: "Nov", monthMl: "നവ", item: "⚠️ Pheromone traps for fruit fly", itemMl: "⚠️ പഴ ഈച്ചയ്ക്ക് ഫെറോമോൺ കെണി" },
    ],
  },
  {
    name: "Ginger", nameMl: "ഇഞ്ചി", emoji: "🫚", category: "Spice",
    months: [3, 4, 5, 6, 7, 8, 9, 10], color: "bg-secondary",
    tip: "Plant April–May. Needs partial shade. Wayanad specialty.",
    tipMl: "ഏപ്രിൽ–മെയ് നടുക. ഭാഗിക തണൽ ആവശ്യം. വയനാട് പ്രത്യേകത.",
    tasks: [
      { icon: "🌱", label: "Sowing (rhizomes)", labelMl: "വിതയ്ക്കൽ (കിഴങ്ങ്)", months: "Apr–May", monthsMl: "ഏപ്രി–മെയ്" },
      { icon: "🧪", label: "Basal fertilizer", labelMl: "അടിവളം", months: "Apr", monthsMl: "ഏപ്രി" },
      { icon: "🍂", label: "Mulching (thick)", labelMl: "പുതയിടൽ (കട്ടിയായി)", months: "May–Jun", monthsMl: "മെയ്–ജൂൺ" },
      { icon: "🧪", label: "Top dressing", labelMl: "മേൽവളം", months: "Jul & Sep", monthsMl: "ജൂലൈ & സെപ്" },
      { icon: "🐛", label: "Soft rot prevention", labelMl: "മൃദു ചീയൽ തടയൽ", months: "Jun–Aug", monthsMl: "ജൂൺ–ഓഗ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Dec–Jan", monthsMl: "ഡിസ–ജനു" },
    ],
    reminders: [
      { month: "Mar", monthMl: "മാർ", item: "⚠️ Order seed rhizomes (Maran/Himachal)", itemMl: "⚠️ വിത്ത് കിഴങ്ങ് (മാറൻ) ഓർഡർ ചെയ്യുക" },
      { month: "May", monthMl: "മെയ്", item: "⚠️ Trichoderma for soft rot", itemMl: "⚠️ മൃദു ചീയലിന് ട്രൈക്കോഡെർമ" },
    ],
  },
  {
    name: "Cashew", nameMl: "കശുമാവ്", emoji: "🥜", category: "Plantation",
    months: [0, 1, 2, 3, 11], color: "bg-success",
    tip: "Flowers Nov–Feb. Harvest March–May. Kannur & Kasaragod.",
    tipMl: "പൂക്കൾ നവ–ഫെബ്. വിളവെടുപ്പ് മാർ–മെയ്. കണ്ണൂർ, കാസർഗോഡ്.",
    tasks: [
      { icon: "🌱", label: "New planting", labelMl: "പുതിയ നടീൽ", months: "Jun–Jul", monthsMl: "ജൂൺ–ജൂലൈ" },
      { icon: "🧪", label: "Fertilizer", labelMl: "വളപ്രയോഗം", months: "Jun & Sep", monthsMl: "ജൂൺ & സെപ്" },
      { icon: "🐛", label: "Tea mosquito bug spray", labelMl: "ചായ കൊതുക് ബഗ് സ്പ്രേ", months: "Oct–Dec", monthsMl: "ഒക്ടോ–ഡിസ" },
      { icon: "🌾", label: "Harvest", labelMl: "വിളവെടുപ്പ്", months: "Mar–May", monthsMl: "മാർ–മെയ്" },
    ],
    reminders: [
      { month: "Sep", monthMl: "സെപ്", item: "⚠️ Lambda cyhalothrin for tea mosquito", itemMl: "⚠️ ചായ കൊതുക്കിനെതിരെ ലാംഡ സൈഹാലോത്രിൻ" },
      { month: "May", monthMl: "മെയ്", item: "⚠️ Order grafts (BPP-8/Madakkathara)", itemMl: "⚠️ ഗ്രാഫ്റ്റ് (BPP-8) ഓർഡർ ചെയ്യുക" },
    ],
  },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthNamesMl = ["ജനു", "ഫെബ്", "മാർ", "ഏപ്രി", "മെയ്", "ജൂൺ", "ജൂലൈ", "ഓഗ", "സെപ്", "ഒക്ടോ", "നവ", "ഡിസ"];
const categories = ["All", "Cereal", "Plantation", "Spice", "Fruit", "Tuber", "Vegetable"];
const categoriesMl: Record<string, string> = { All: "എല്ലാം", Cereal: "ധാന്യം", Plantation: "തോട്ടം", Spice: "സുഗന്ധവ്യഞ്ജനം", Fruit: "പഴം", Tuber: "കിഴങ്ങ്", Vegetable: "പച്ചക്കറി" };

const seasonBands = [
  { label: "☀️ Summer", labelMl: "☀️ വേനൽ", color: "bg-accent/20 text-accent-foreground" },
  { label: "🌧️ SW Monsoon", labelMl: "🌧️ തെക്കൻ മൺസൂൺ", color: "bg-info/20 text-info" },
  { label: "🍂 Post-Mon", labelMl: "🍂 മൺസൂണിന് ശേഷം", color: "bg-secondary/20 text-secondary" },
  { label: "❄️ Winter", labelMl: "❄️ ശൈത്യം", color: "bg-primary/20 text-primary" },
];

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  Cereal: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  Plantation: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  Spice: { bg: "bg-secondary/10", text: "text-secondary", dot: "bg-secondary" },
  Fruit: { bg: "bg-accent/20", text: "text-accent-foreground", dot: "bg-accent" },
  Tuber: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  Vegetable: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
};

const CropCalendar = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [filter, setFilter] = useState("All");
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const currentMonth = new Date().getMonth();

  const filtered = filter === "All" ? crops : crops.filter((c) => c.category === filter);
  const months = lang === "ml" ? monthNamesMl : monthNames;

  const toggleCrop = (name: string) => {
    setExpandedCrop((prev) => (prev === name ? null : name));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 transition-colors hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">{t("Crop Calendar 📅", "വിള കലണ്ടർ 📅")}</h1>
          <p className="text-xs text-muted-foreground">{t("Kerala yearly guide • Tap crop for details", "കേരള വാർഷിക ഗൈഡ് • വിശദാംശങ്ങൾക്ക് ടാപ്പ് ചെയ്യുക")}</p>
        </div>
        <LangToggle />
      </div>

      {/* Season bands */}
      <div className="mb-4 grid grid-cols-4 gap-1.5 rounded-xl p-1">
        {seasonBands.map((s) => (
          <div key={s.label} className={`rounded-xl py-2 text-center text-[11px] font-bold ${s.color}`}>
            {lang === "ml" ? s.labelMl : s.label}
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
        {categories.map((cat) => {
          const cc = categoryColors[cat];
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === cat
                  ? cat === "All" ? "bg-primary text-primary-foreground" : `${cc?.bg} ${cc?.text} ring-1 ring-current`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {lang === "ml" ? categoriesMl[cat] : cat}
            </button>
          );
        })}
      </div>

      {/* Calendar grid + expandable details */}
      <div className="space-y-2">
        {filtered.map((crop, i) => {
          const isExpanded = expandedCrop === crop.name;
          const cc = categoryColors[crop.category];

          return (
            <motion.div key={crop.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              
              {/* Crop row with calendar */}
              <button onClick={() => toggleCrop(crop.name)}
                className="flex w-full items-center border-b border-transparent transition-colors hover:bg-muted/30">
                {/* Crop name */}
                <div className="w-32 shrink-0 px-3 py-3 text-left">
                  <span className="text-xs font-bold text-foreground">{crop.emoji} {lang === "ml" ? crop.nameMl : crop.name}</span>
                </div>
                {/* Month cells */}
                <div className="flex flex-1 items-center">
                  {months.map((m, mi) => (
                    <div key={mi} className="flex w-[calc(100%/12)] items-center justify-center py-3">
                      {crop.months.includes(mi) ? (
                        <div className={`h-4 w-full max-w-[26px] rounded-md ${crop.color} ${mi === currentMonth ? "ring-2 ring-foreground/20" : ""} opacity-80`} />
                      ) : (
                        <div className="h-4 w-full max-w-[26px]" />
                      )}
                    </div>
                  ))}
                </div>
                {/* Expand indicator */}
                <div className="shrink-0 px-2">
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded detail section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border bg-muted/10 p-4 space-y-4">
                      {/* Header with badge */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{crop.emoji}</span>
                        <div>
                          <h3 className="text-sm font-extrabold text-foreground">{lang === "ml" ? crop.nameMl : crop.name}</h3>
                          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cc?.bg} ${cc?.text}`}>
                            {lang === "ml" ? categoriesMl[crop.category] : crop.category}
                          </span>
                        </div>
                      </div>

                      {/* Tip */}
                      <div className="rounded-xl bg-primary/5 p-3 flex items-start gap-2">
                        <span className="text-sm">💡</span>
                        <p className="text-xs leading-relaxed text-foreground">{lang === "ml" ? crop.tipMl : crop.tip}</p>
                      </div>

                      {/* Farming process tasks */}
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          {t("📋 Month-wise Tasks", "📋 മാസം തിരിച്ചുള്ള ജോലികൾ")}
                        </p>
                        <div className="space-y-1.5">
                          {crop.tasks.map((task, ti) => (
                            <motion.div key={ti} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: ti * 0.05 }}
                              className="flex items-center gap-2.5 rounded-xl bg-card p-2.5 border border-border/50 shadow-sm">
                              <span className="text-base shrink-0">{task.icon}</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-foreground">{lang === "ml" ? task.labelMl : task.label}</span>
                              </div>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${cc?.bg} ${cc?.text}`}>
                                {lang === "ml" ? task.monthsMl : task.months}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Pesticide / Fertilizer Reminders */}
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-destructive">
                          {t("🧴 Order Reminders (Pesticides & Fertilizers)", "🧴 ഓർഡർ ഓർമ്മപ്പെടുത്തലുകൾ")}
                        </p>
                        <div className="space-y-1.5">
                          {crop.reminders.map((rem, ri) => (
                            <motion.div key={ri} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: ri * 0.05 + 0.2 }}
                              className="flex items-start gap-2.5 rounded-xl bg-destructive/5 border border-destructive/15 p-2.5">
                              <span className="shrink-0 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                                {lang === "ml" ? rem.monthMl : rem.month}
                              </span>
                              <p className="text-xs font-medium text-foreground leading-relaxed">{lang === "ml" ? rem.itemMl : rem.item}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Growing months badges */}
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          {t("🌱 Growing Months", "🌱 വളരുന്ന മാസങ്ങൾ")}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {months.map((m, mi) => (
                            <span key={mi} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                              crop.months.includes(mi)
                                ? `${crop.color} text-primary-foreground shadow-sm`
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(categoryColors).map(([label, c]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-md ${c.dot} opacity-80`} />
            <span className="text-[11px] font-medium text-muted-foreground">{lang === "ml" ? categoriesMl[label] : label}</span>
          </div>
        ))}
      </div>

      {/* Month header legend */}
      <div className="mt-3 overflow-x-auto rounded-xl bg-muted/30 p-2">
        <div className="flex">
          {months.map((m, mi) => (
            <div key={mi} className={`w-[calc(100%/12)] text-center text-[10px] font-bold ${mi === currentMonth ? "text-primary" : "text-muted-foreground"}`}>
              {m}
              {mi === currentMonth && <div className="mx-auto mt-0.5 h-0.5 w-3 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      </div>

      {/* Process icon legend */}
      <div className="mt-3 rounded-xl border border-border bg-card p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Symbol Guide", "ചിഹ്ന ഗൈഡ്")}</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: "🌱", label: t("Sowing", "വിതയ്ക്കൽ") },
            { icon: "🌿", label: t("Transplant", "നടീൽ") },
            { icon: "🧪", label: t("Fertilizer", "വളം") },
            { icon: "🐛", label: t("Pest control", "കീടനിയന്ത്രണം") },
            { icon: "💧", label: t("Irrigation", "ജലസേചനം") },
            { icon: "🍂", label: t("Mulching", "പുതയിടൽ") },
            { icon: "🌾", label: t("Harvest", "വിളവെടുപ്പ്") },
            { icon: "⚠️", label: t("Reminder", "ഓർമ്മ") },
          ].map((s) => (
            <div key={s.icon} className="flex items-center gap-1">
              <span className="text-sm">{s.icon}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
};

export default CropCalendar;
