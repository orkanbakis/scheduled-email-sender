'use client';

import { useCallback } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function getMinDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function DateTimePicker({ value, onChange, error }: Props) {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.min = getMinDateTime();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Send on
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        min={getMinDateTime()}
        className="bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full px-4 py-3"
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
