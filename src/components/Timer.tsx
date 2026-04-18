import { useEffect, useState } from "react";

interface TimerProps {
  start: boolean;
  onTimeUp: () => void;
}

const Timer = ({ start, onTimeUp }: TimerProps) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    let interval: number;
    if (start && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      onTimeUp();
    }
    return () => clearInterval(interval);
  }, [start, seconds, onTimeUp]);

  return (
    <div className="text-2xl font-mono text-yellow-500">
      {seconds}s
    </div>
  );
};

export default Timer;