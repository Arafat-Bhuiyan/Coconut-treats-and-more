import React, { useState, useEffect } from "react";

const CountdownTimer = ({ className = "" }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Countdown to midnight of the current day
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
      const diff = midnight.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { hours: 23, minutes: 59, seconds: 59 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, "0");

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
        <span className="inline-block animate-pulse">⏳</span>
        <span>Limited Offer Ends In:</span>
      </div>
      <div className="flex items-center gap-1 text-sm sm:text-base font-black">
        <span className="bg-primary text-white px-2.5 py-1 rounded-lg shadow-sm font-mono border border-primary/20 min-w-[34px] text-center">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="text-primary">:</span>
        <span className="bg-primary text-white px-2.5 py-1 rounded-lg shadow-sm font-mono border border-primary/20 min-w-[34px] text-center">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="text-primary">:</span>
        <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg shadow-sm font-mono border border-red-600/20 min-w-[34px] text-center">
          {formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
