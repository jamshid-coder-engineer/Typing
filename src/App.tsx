import { useState, useEffect, useRef } from "react";

// 1. Mavzular bazasi
const THEMES = {
  dark: {
    name: "Dark (Default)",
    bg: "bg-[#2c2e31]",
    textDim: "text-[#646669]",
    textActive: "text-[#d1d0c5]",
    correct: "text-[#d1d0c5]",
    wrong: "text-[#ca4754]",
    cursor: "bg-[#e2b714]",
    stats: "text-[#e2b714]",
    border: "border-[#444]",
  },
  serika: {
    name: "Serika Blue",
    bg: "bg-[#323437]",
    textDim: "text-[#646669]",
    textActive: "text-[#e1e1e1]",
    correct: "text-[#e1e1e1]",
    wrong: "text-[#ca4754]",
    cursor: "bg-[#3297a8]",
    stats: "text-[#3297a8]",
    border: "border-[#444]",
  },
  neon: {
    name: "Neon Night",
    bg: "bg-[#000000]",
    textDim: "text-[#ffffff] opacity-40", 
    textActive: "text-[#ffffff]",         
    correct: "text-[#00ff95]",            
    wrong: "text-[#ff0055]",              
    cursor: "bg-[#00ff95]",
    stats: "text-[#ffffff]",              
    border: "border-[#ffffff] opacity-20",
  }
};

const WORDS_DATABASE = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(THEMES.dark);
  const [testText, setTestText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeMode, setTimeMode] = useState(60);
  const [timeLeft, setTimeLeft] = useState(timeMode);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testFinished, setTestFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const COLORS = currentTheme;

  const generateText = () => {
    return Array.from({ length: 100 }, () => WORDS_DATABASE[Math.floor(Math.random() * WORDS_DATABASE.length)]).join(" ");
  };

  useEffect(() => {
    setTestText(generateText());
  }, []);

  const resetTest = () => {
    setTestText(generateText());
    setUserInput("");
    setTimeLeft(timeMode);
    setIsTestRunning(false);
    setTestFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Vaqt rejimini o'zgartirish: Avtomatik reset bilan
  const handleTimeModeChange = (newTime: number) => {
    setTimeMode(newTime);
    setTimeLeft(newTime);
    resetTest(); 
  };

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetTest();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [timeMode]);

  useEffect(() => {
    let timerId: number;
    if (isTestRunning && timeLeft > 0) {
      timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTestRunning(false);
      setTestFinished(true);
    }
    return () => clearInterval(timerId);
  }, [isTestRunning, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTestRunning && !testFinished && e.target.value.length > 0) {
      setIsTestRunning(true);
    }
    setUserInput(e.target.value);
  };

  const calculateStats = () => {
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === testText[i]) correctChars++;
    }
    const timeSpent = timeMode - timeLeft || 1;
    const wpm = Math.round((correctChars / 5) / (timeSpent / 60));
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 0;
    return { wpm, accuracy };
  };

  const { wpm, accuracy } = calculateStats();

  return (
    <div 
      className={`min-h-screen ${COLORS.bg} flex flex-col items-center justify-center p-10 font-mono select-none transition-colors duration-500`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="w-full max-w-6xl">
        
        {/* Header: Mavzular va Vaqt boshqaruvi */}
        <div className="flex justify-between items-center mb-16 px-4">
          <div className="flex gap-4">
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={(e) => { e.stopPropagation(); setCurrentTheme(theme); }}
                className={`text-xs px-4 py-1.5 rounded-full border transition-all ${
                  currentTheme === theme 
                    ? (currentTheme === THEMES.neon ? "text-[#00ff95] border-[#00ff95]" : COLORS.stats + " " + COLORS.border)
                    : (currentTheme === THEMES.neon ? "text-white opacity-60 border-white/20" : COLORS.textDim + " " + COLORS.border)
                } hover:opacity-100`}
              >
                {theme.name}
              </button>
            ))}
          </div>

          {!testFinished && (
            <div className={`flex gap-8 text-2xl font-bold transition-all ${
              isTestRunning ? "opacity-0 pointer-events-none" : "opacity-100" 
            } ${currentTheme === THEMES.neon ? "text-white" : COLORS.textDim}`}>
              {[15, 30, 60].map(t => (
                <button 
                  key={t} 
                  onClick={(e) => { e.stopPropagation(); handleTimeModeChange(t); }}
                  className={`hover:scale-110 transition ${timeMode === t ? (currentTheme === THEMES.neon ? "text-[#00ff95]" : COLORS.stats) : "opacity-40"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {!testFinished ? (
          <>
            <div className={`${currentTheme === THEMES.neon ? "text-white" : COLORS.stats} text-7xl font-black mb-10 px-4 transition-colors`}>
              {timeLeft}
            </div>
            
            <div className="relative leading-relaxed text-4xl h-[280px] overflow-hidden">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className="absolute opacity-0 pointer-events-none"
                autoFocus
              />

              <div className="flex flex-wrap gap-y-4 transition-all duration-300"
                   style={{ transform: `translateY(-${Math.floor(userInput.length / 70) * 60}px)` }}>
                {testText.split(" ").map((word, wordIdx, wordsArr) => {
                  let startIdx = wordsArr.slice(0, wordIdx).join(" ").length + (wordIdx === 0 ? 0 : 1);
                  return (
                    <div key={wordIdx} className="inline-block mr-5 mb-2">
                      {(word + (wordIdx === wordsArr.length - 1 ? "" : " ")).split("").map((char, charIdx) => {
                        const globalIdx = startIdx + charIdx;
                        let color = COLORS.textDim;
                        if (globalIdx < userInput.length) {
                          color = userInput[globalIdx] === char ? COLORS.correct : COLORS.wrong;
                        }
                        return (
                          <span key={globalIdx} className={`${color} relative tracking-widest`}>
                            {globalIdx === userInput.length && (
                              <span className={`absolute left-0 top-1 bottom-1 w-[3px] ${COLORS.cursor} animate-pulse`} />
                            )}
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-left animate-in fade-in zoom-in duration-500">
            <div className="flex gap-24 mb-16">
              <div>
                <div className={`${COLORS.textDim} text-3xl mb-2`}>wpm</div>
                <div className={`${COLORS.stats} text-9xl font-black`}>{wpm}</div>
              </div>
              <div>
                <div className={`${COLORS.textDim} text-3xl mb-2`}>acc</div>
                <div className={`${COLORS.stats} text-9xl font-black`}>{accuracy}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Restart tugmasi: Kattaroq va markazda */}
        <div className="flex justify-center mt-20">
          <button 
            onClick={(e) => { e.stopPropagation(); resetTest(); }} 
            className={`transition-all text-6xl p-4 hover:scale-125 active:rotate-180 duration-500 ${
              currentTheme === THEMES.neon ? "text-white opacity-80" : COLORS.textDim
            }`}
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
}