import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const THEMES = {
  dark: { name: "Dark", bg: "bg-[#2c2e31]", textDim: "text-[#646669]", textActive: "text-[#d1d0c5]", correct: "text-[#d1d0c5]", wrong: "text-[#ca4754]", cursor: "bg-[#e2b714]", stats: "text-[#e2b714]", border: "border-[#444]" },
  serika: { name: "Serika Blue", bg: "bg-[#323437]", textDim: "text-[#646669]", textActive: "text-[#e1e1e1]", correct: "text-[#e1e1e1]", wrong: "text-[#ca4754]", cursor: "bg-[#3297a8]", stats: "text-[#3297a8]", border: "border-[#444]" },
  neon: { name: "Neon Night", bg: "bg-[#000000]", textDim: "text-[#ffffff] opacity-40", textActive: "text-[#ffffff]", correct: "text-[#00ff95]", wrong: "text-[#ff0055]", cursor: "bg-[#00ff95]", stats: "text-[#ffffff]", border: "border-[#ffffff] opacity-20" }
};

const LANGUAGES = {
  uz: ["va", "u", "bu", "bilan", "uchun", "ham", "bor", "edi", "bo'ladi", "qilish", "shunday", "lekin", "o'z", "esa", "yana", "ish", "nima", "agar", "men", "keldi", "chiqish", "katta", "yangi", "haqida", "o'sha", "shuning", "kerak", "bo'lib", "faqat", "hamma", "uni", "biladi", "emas", "qayta", "hayot", "odam", "dunyo", "so'z", "yozish", "o'qish", "maktab", "dastur", "kod", "kompyuter", "bilim", "vaqt", "soat", "yil", "oy", "kun", "yaxshi", "yomon", "chiroyli", "tez", "asta", "oz", "ko'p", "barcha", "asosiy", "muhim", "qiziqarli", "qiyin", "oson"],
  en: ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"]
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(THEMES.dark);
  const [language, setLanguage] = useState<"uz" | "en">("en");
  const [testText, setTestText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeMode, setTimeMode] = useState(15);
  const [timeLeft, setTimeLeft] = useState(timeMode);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [chartData, setChartData] = useState<{ sec: number, wpm: number }[]>([]);
  const [isLofiOn, setIsLofiOn] = useState(false);
  const [isTypingSoundOn, setIsTypingSoundOn] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const lofiAudio = useRef<HTMLAudioElement | null>(null);
  const keySound = useRef<HTMLAudioElement | null>(null);
  const errorSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    lofiAudio.current = new Audio("/lofi-music.mp3");
    lofiAudio.current.loop = true;
    lofiAudio.current.volume = 0.15;
    keySound.current = new Audio("/click.mp3");
    errorSound.current = new Audio("/error.mp3");
  }, []);

  useEffect(() => {
    if (isLofiOn) lofiAudio.current?.play().catch(() => { });
    else lofiAudio.current?.pause();
  }, [isLofiOn]);

  const generateText = (lang: "uz" | "en") => {
    const db = LANGUAGES[lang];
    return Array.from({ length: 150 }, () => db[Math.floor(Math.random() * db.length)]).join(" ");
  };

  useEffect(() => { setTestText(generateText(language)); }, [language]);

  const resetTest = () => {
    setTestText(generateText(language));
    setUserInput("");
    setTimeLeft(timeMode);
    setIsTestRunning(false);
    setTestFinished(false);
    setChartData([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isTypingSoundOn && val.length > userInput.length) {
      const isError = val[val.length - 1] !== testText[val.length - 1];
      const audio = isError ? errorSound.current : keySound.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
    }
    if (!isTestRunning && !testFinished && val.length > 0) setIsTestRunning(true);
    setUserInput(val);
  };

  useEffect(() => {
    let timerId: any;
    if (isTestRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const timeElapsed = timeMode - newTime;
          let correctChars = 0;
          for (let i = 0; i < userInput.length; i++) if (userInput[i] === testText[i]) correctChars++;
          const currentWpm = Math.round((correctChars / 5) / (timeElapsed / 60)) || 0;
          setChartData(prevData => [...prevData, { sec: timeElapsed, wpm: currentWpm }]);
          if (newTime <= 0) { setIsTestRunning(false); setTestFinished(true); return 0; }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isTestRunning, timeMode]);

  const { wpm, accuracy } = (() => {
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) if (userInput[i] === testText[i]) correctChars++;
    const wpm = Math.round((correctChars / 5) / (timeMode / 60)) || 0;
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 0;
    return { wpm, accuracy };
  })();

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col items-center justify-center p-6 font-mono select-none transition-all duration-500`} onClick={() => inputRef.current?.focus()}>
      <div className="w-full max-w-6xl">

        {/* Yuqori Panel */}
        {!isTestRunning && !testFinished && (
          <div className="flex justify-between items-center mb-10 px-4 opacity-70 hover:opacity-100 transition-all">
            <div className={`flex items-center gap-8 text-sm uppercase tracking-[0.2em] ${currentTheme.textDim}`}>
              <div className="flex gap-6">
                {(["en", "uz"] as const).map(l => (
                  <button key={l} onClick={(e) => { e.stopPropagation(); setLanguage(l); resetTest(); }} className={language === l ? currentTheme.stats : ""}>{l === "en" ? "english" : "uzbek"}</button>
                ))}
              </div>
              <div className="flex gap-8 border-l border-white/10 pl-8">
                <button onClick={(e) => { e.stopPropagation(); setIsLofiOn(!isLofiOn); }} className={isLofiOn ? currentTheme.stats : ""}>{isLofiOn ? "🎵 Lofi On" : "🎵 Lofi Off"}</button>
                <button onClick={(e) => { e.stopPropagation(); setIsTypingSoundOn(!isTypingSoundOn); }} className={isTypingSoundOn ? currentTheme.stats : ""}>{isTypingSoundOn ? "⌨️ Click On" : "⌨️ Click Off"}</button>
              </div>
            </div>
            <div className="flex gap-4">
              {Object.entries(THEMES).map(([key, theme]) => (
                <button key={key} onClick={(e) => { e.stopPropagation(); setCurrentTheme(theme); }} className={`text-[13px] px-4 py-2 rounded border transition-all ${currentTheme === theme ? currentTheme.stats + " " + currentTheme.border : currentTheme.textDim + " " + currentTheme.border}`}>{theme.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Test Rejimi va Taymer */}
        {!testFinished && (
          <div className="flex justify-between items-end mb-12 px-4">
            <div className={`${currentTheme.stats} text-6xl font-black leading-none`}>{timeLeft}</div>
            <div className={`flex gap-8 text-2xl font-bold ${isTestRunning ? "opacity-0" : "opacity-100"} ${currentTheme.textDim}`}>
              {[15, 30, 60].map(t => (
                <button key={t} onClick={(e) => { e.stopPropagation(); setTimeMode(t); setTimeLeft(t); resetTest(); }} className={timeMode === t ? currentTheme.stats : "opacity-30"}>{t}</button>
              ))}
            </div>
          </div>
        )}


        {/* Matn Maydoni */}
        {!testFinished ? (
          <div className="relative leading-normal h-[240px] overflow-hidden px-4 no-scrollbar">
            <input ref={inputRef} type="text" value={userInput} onChange={handleInputChange} autoComplete="off" className="absolute opacity-0" autoFocus />
            <div className="flex flex-wrap content-start gap-y-10 gap-x-5 transition-all duration-300" style={{ transform: `translateY(-${Math.floor(userInput.length / 55) * 80}px)` }}>
              {testText.split(" ").map((word, wordIdx, wordsArr) => {
                let startIdx = wordsArr.slice(0, wordIdx).join(" ").length + (wordIdx === 0 ? 0 : 1);

                let wordHasError = false;
                for (let i = 0; i < word.length; i++) {
                  if (startIdx + i < userInput.length && userInput[startIdx + i] !== word[i]) {
                    wordHasError = true; break;
                  }
                }

                return (
                  <div key={wordIdx} className={`relative py-1 ${wordHasError ? 'wave-error' : ''}`}>
                    {word.split("").map((char, charIdx) => {
                      const globalIdx = startIdx + charIdx;
                      let color = currentTheme.textDim;
                      let glow = "";
                      if (globalIdx < userInput.length) {
                        if (userInput[globalIdx] === char) color = currentTheme.correct;
                        else { color = currentTheme.wrong; glow = "animate-error-glow"; }
                      }
                      return (
                        <span key={globalIdx} className={`${color} ${glow} relative tracking-widest text-4xl transition-all duration-150`}>
                          {globalIdx === userInput.length && <span className={`absolute left-0 top-1 bottom-1 w-[3px] ${currentTheme.cursor} animate-pulse shadow-[0_0_15px_#e2b714]`} />}
                          {char}
                        </span>
                      );
                    })}
                    <span className="relative">&nbsp;{startIdx + word.length === userInput.length && <span className={`absolute left-1 top-1 bottom-1 w-[3px] ${currentTheme.cursor} animate-pulse shadow-[0_0_15px_#e2b714]`} />}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Natijalar paneli */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4">
            <div className="flex gap-24 mb-10 items-baseline">
              <div>
                <div className={`${currentTheme.textDim} text-2xl uppercase tracking-tighter`}>wpm</div>
                <div className={`${currentTheme.stats} text-[10rem] font-black leading-none`}>{wpm}</div>
              </div>
              <div>
                <div className={`${currentTheme.textDim} text-2xl uppercase tracking-tighter`}>acc</div>
                <div className={`${currentTheme.stats} text-[10rem] font-black leading-none`}>{accuracy}%</div>
              </div>
            </div>

            {/* OQ GRAFIK */}
            <div className="w-full h-[340px] bg-white/5 rounded-[2rem] p-8 border border-white/10 shadow-2xl overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.03} />
                  <XAxis dataKey="sec" stroke={currentTheme.textDim} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke={currentTheme.textDim} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="wpm" stroke="#ffffff" strokeWidth={4} dot={{ fill: "#ffffff", r: 4 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-16">
          <button onClick={resetTest} className={`text-5xl p-4 hover:scale-110 hover:rotate-180 transition-all duration-500 active:scale-90 ${currentTheme.textDim}`}>↻</button>
        </div>
      </div>
    </div>
  );
}