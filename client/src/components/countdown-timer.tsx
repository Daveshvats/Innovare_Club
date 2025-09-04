import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

export function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`tech-gradient rounded-xl lg:rounded-2xl p-4 sm:p-6 text-white text-center hover-lift animate-bounce-in ${className}`}>
      <h4 className="font-tech text-base sm:text-lg font-semibold mb-3 sm:mb-4">Time Remaining</h4>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center" data-testid="countdown-timer">
        <div className="bg-white/20 rounded-lg p-2 sm:p-3">
          <div className="font-mono text-lg sm:text-xl lg:text-2xl font-bold" data-testid="countdown-days">
            {timeLeft.days.toString().padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm">Days</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2 sm:p-3">
          <div className="font-mono text-lg sm:text-xl lg:text-2xl font-bold" data-testid="countdown-hours">
            {timeLeft.hours.toString().padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm">Hours</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2 sm:p-3">
          <div className="font-mono text-lg sm:text-xl lg:text-2xl font-bold" data-testid="countdown-minutes">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm">Minutes</div>
        </div>
        <div className="bg-white/20 rounded-lg p-2 sm:p-3">
          <div className="font-mono text-lg sm:text-xl lg:text-2xl font-bold" data-testid="countdown-seconds">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </div>
          <div className="text-xs sm:text-sm">Seconds</div>
        </div>
      </div>
    </div>
  );
}
