'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { getEmail } from '@/lib/api';
import CountdownTimer from '@/components/CountdownTimer';
import ExpiredMessage from '@/components/ExpiredMessage';

export default function CountdownPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [senderName, setSenderName] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEmail(id)
      .then((data) => {
        setSenderName(data.senderName);
        setScheduledAt(data.scheduledAt);
        setExpired(data.expired);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExpire = useCallback(() => {
    getEmail(id)
      .then((data) => setExpired(data.expired))
      .catch(() => setExpired(true));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-10 w-full max-w-xl shadow-2xl text-center">
          <p className="text-gray-400">This countdown link is invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-10 w-full max-w-xl shadow-2xl text-center">
        {expired ? (
          <ExpiredMessage />
        ) : (
          <>
            <div className="text-5xl mb-4">&#x1F4EC;</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-1">
              {senderName} has sent you
            </h1>
            <p className="text-xl text-gray-400 mb-8">a future message</p>
            <div className="mb-8">
              <CountdownTimer
                targetDate={new Date(scheduledAt)}
                onExpire={handleExpire}
              />
            </div>
            <p className="text-gray-500 text-sm">
              Check your email at the scheduled time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
