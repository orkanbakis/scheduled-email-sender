'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { getEmail } from '@/lib/api';

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [scheduledAt, setScheduledAt] = useState('');
  const [countdownUrl, setCountdownUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const url = `${window.location.origin}/countdown/${id}`;
    setCountdownUrl(url);

    getEmail(id)
      .then((data) => setScheduledAt(data.scheduledAt))
      .catch((err) => setError(err.message));
  }, [id]);

  function handleCopy() {
    navigator.clipboard.writeText(countdownUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!id) {
    return (
      <p className="text-gray-400 text-center">No email ID provided.</p>
    );
  }

  const formattedDate = scheduledAt
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(scheduledAt))
    : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <div className="bg-gray-900 rounded-2xl p-6 sm:p-10 w-full max-w-xl shadow-2xl text-center">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            <div className="text-5xl mb-4">&#x2705;</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
              Your email has been scheduled!
            </h1>
            {formattedDate && (
              <p className="text-gray-400 mb-8">
                It will be delivered on{' '}
                <span className="text-indigo-400 font-medium">{formattedDate}</span>
              </p>
            )}

            <div className="mb-8">
              <p className="text-sm text-gray-400 mb-3">Share the countdown link:</p>
              <div className="flex items-stretch gap-2">
                <input
                  readOnly
                  value={countdownUrl}
                  className="bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm px-4 py-3 flex-1 min-w-0"
                />
                <button
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-4 py-3 text-sm transition-colors whitespace-nowrap"
                >
                  {copied ? 'Copied! \u2713' : 'Copy'}
                </button>
              </div>
            </div>

            <Link
              href="/"
              className="inline-block bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold rounded-full px-8 py-3 transition-colors"
            >
              Schedule another &rarr;
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
