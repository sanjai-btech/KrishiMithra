import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "./contexts/LangContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SoilAnalysis from "./pages/SoilAnalysis";
import PesticidePrediction from "./pages/PesticidePrediction";
import Chatbot from "./pages/Chatbot";
import MarketPrices from "./pages/MarketPrices";
import CropCalendar from "./pages/CropCalendar";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import SmartIrrigation from "./pages/SmartIrrigation";
import PestDiseaseDoctor from "./pages/PestDiseaseDoctor";
import FertilizerOptimization from "./pages/FertilizerOptimization";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LangProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/soil" element={<SoilAnalysis />} />
              <Route path="/pesticides" element={<PesticidePrediction />} />
              <Route path="/irrigation" element={<SmartIrrigation />} />
              <Route path="/pest-doctor" element={<PestDiseaseDoctor />} />
              <Route path="/fertilizer" element={<FertilizerOptimization />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/market" element={<MarketPrices />} />
              <Route path="/calendar" element={<CropCalendar />} />
              <Route path="/schemes" element={<GovernmentSchemes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
