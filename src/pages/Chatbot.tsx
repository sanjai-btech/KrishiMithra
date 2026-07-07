import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowLeft, Bot, User, Send, Sparkles, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/contexts/LangContext";
import { useSpeechRecognition, speak } from "@/hooks/useSpeech";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Chatbot = () => {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const speechLang = lang === "ml" ? "ml-IN" : "en-US";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t(
        "Hello! I'm KrishiMitra, your AI farming assistant. 🌿\n\nI can help with:\n- 🌤️ Weather advice\n- 💧 Irrigation guidance\n- 🐛 Pest & pesticide recommendations\n- 📈 Market prices\n- 🏛️ Government schemes\n- 🌾 Crop guidance\n\nType or use the mic to ask me anything!",
        "നമസ്കാരം! ഞാൻ കൃഷിമിത്ര, നിങ്ങളുടെ AI കൃഷി സഹായി. 🌿\n\nഞാൻ സഹായിക്കാം:\n- 🌤️ കാലാവസ്ഥ ഉപദേശം\n- 💧 ജലസേചന മാർഗ്ഗനിർദ്ദേശം\n- 🐛 കീടനാശിനി ശുപാർശ\n- 📈 വിപണി വിലകൾ\n- 🏛️ സർക്കാർ പദ്ധതികൾ\n- 🌾 വിള മാർഗ്ഗനിർദ്ദേശം\n\nടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്ക് ഉപയോഗിക്കുക!"
      ),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        context: { district: "Wayanad" },
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || `Error: ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantSoFar;
  };

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMsg: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputText("");
      setIsLoading(true);

      try {
        const reply = await streamChat(updatedMessages);
        // TTS for assistant reply
        if (reply) {
          const plainText = reply.replace(/[#*_`\[\]()>-]/g, "").replace(/\n+/g, ". ").slice(0, 500);
          speak(plainText, speechLang);
        }
      } catch (e) {
        console.error("Chat error:", e);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: t(
              "Sorry, I'm having trouble connecting. Please try again.",
              "ക്ഷമിക്കണം, കണക്ഷൻ പ്രശ്നമുണ്ട്. വീണ്ടും ശ്രമിക്കുക."
            ),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, speechLang, t]
  );

  const handleVoiceResult = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend]
  );

  const { listening, transcript, startListening, stopListening } = useSpeechRecognition({
    lang: speechLang,
    onResult: handleVoiceResult,
  });

  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  const speakMessage = (text: string) => {
    const plainText = text.replace(/[#*_`\[\]()>-]/g, "").replace(/\n+/g, ". ").slice(0, 500);
    speak(plainText, speechLang);
  };

  const quickActions =
    lang === "ml"
      ? ["🌤️ കാലാവസ്ഥ", "💧 നന", "🐛 കീടം", "📈 വില", "🏛️ പദ്ധതികൾ"]
      : ["🌤️ Weather", "💧 Irrigation", "🐛 Pest help", "📈 Market", "🏛️ Schemes"];

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate("/dashboard")} className="rounded-xl bg-muted p-2 transition-colors hover:bg-primary/10">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-hero">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">{t("KrishiMitra AI", "കൃഷിമിത്ര AI")}</h1>
            <p className="text-[11px] text-muted-foreground">{t("🟢 Online • Text & Voice", "🟢 ഓൺലൈൻ • ടെക്സ്റ്റ് & വോയ്‌സ്")}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">AI</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto border-b border-border bg-card/50 px-4 py-2">
        {quickActions.map((qa) => (
          <button
            key={qa}
            onClick={() => handleSend(qa.split(" ").slice(1).join(" "))}
            className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-primary/10"
          >
            {qa}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-lg space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "assistant" ? "gradient-hero" : "bg-secondary"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={`group relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content.split("\n").map((line, j) => (
                      <p key={j} className={j > 0 ? "mt-1" : ""}>
                        {line}
                      </p>
                    ))
                  )}
                  {msg.role === "assistant" && i > 0 && (
                    <button
                      onClick={() => speakMessage(msg.content)}
                      className="absolute -bottom-3 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary/20"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-hero">
                <Bot className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3 pb-24">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            value={listening ? transcript || inputText : inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
            placeholder={t("Type or use voice...", "ടൈപ്പ് ചെയ്യുക...")}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
          <button
            onClick={toggleListening}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
              listening ? "animate-pulse-soft gradient-warm shadow-lg" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {listening ? <MicOff className="h-5 w-5 text-primary-foreground" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>
        {listening && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center text-xs font-semibold text-primary">
            🎤 {t("Listening... speak now", "കേൾക്കുന്നു... ഇപ്പോൾ സംസാരിക്കുക")}
            {transcript && <span className="ml-1 text-foreground">"{transcript}"</span>}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
