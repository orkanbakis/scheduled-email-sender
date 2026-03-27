'use client';

import { useEffect, useState } from 'react';

interface Props {
  targetDate: Date;
  onExpire: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer({ targetDate, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => {
      const tl = calcTimeLeft(targetDate);
      if (!tl) {
        clearInterval(id);
        onExpire();
        return;
      }
      setTimeLeft(tl);
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate, onExpire]);

  if (!timeLeft) return null;

  const units = [
    { value: timeLeft.days, label: 'days' },
    { value: timeLeft.hours, label: 'hrs' },
    { value: timeLeft.minutes, label: 'min' },
    { value: timeLeft.seconds, label: 'sec' },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="bg-gray-900 rounded-xl p-4 text-center min-w-[72px]"
        >
          <div className="text-4xl sm:text-5xl font-bold text-indigo-400">
            {pad(unit.value)}
          </div>
          <div className="text-xs text-gray-500 uppercase mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
