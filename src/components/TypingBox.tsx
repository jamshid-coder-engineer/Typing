import { useState, useEffect } from "react";

const SAMPLE_TEXT = "react is a popular javascript library for building user interfaces";

const TypingBox = ({ onFinish }: { onFinish: (stats: any) => void }) => {
  const [userInput, setUserInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted) setIsStarted(true);
    setUserInput(e.target.value);
  };

  // Har bir harfni tekshirish uchun render funksiyasi
  const renderText = () => {
    return SAMPLE_TEXT.split("").map((char, index) => {
      let color = "text-gray-400"; // hali yetib kelinmagan
      if (index < userInput.length) {
        color = userInput[index] === char ? "text-white" : "text-red-500";
      }
      return <span key={index} className={`${color} font-mono text-xl`}>{char}</span>;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-gray-800 rounded-lg leading-relaxed tracking-widest">
        {renderText()}
      </div>
      <input
        type="text"
        autoFocus
        className="opacity-0 absolute" // Inputni yashirib, matnga fokus qilamiz
        onChange={handleInput}
        value={userInput}
      />
      <p className="text-gray-500 text-sm">Yozishni boshlang...</p>
    </div>
  );
};

export default TypingBox;