'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleEmail } from '@/lib/api';
import DateTimePicker from './DateTimePicker';

interface FormErrors {
  senderName?: string;
  senderEmail?: string;
  recipientEmail?: string;
  subject?: string;
  body?: string;
  scheduledAt?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailForm() {
  const router = useRouter();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!senderName.trim()) errs.senderName = 'Name is required';
    if (!senderEmail.trim()) errs.senderEmail = 'Email is required';
    else if (!emailRegex.test(senderEmail)) errs.senderEmail = 'Invalid email format';
    if (!recipientEmail.trim()) errs.recipientEmail = 'Recipient email is required';
    else if (!emailRegex.test(recipientEmail)) errs.recipientEmail = 'Invalid email format';
    if (!subject.trim()) errs.subject = 'Subject is required';
    if (!body.trim()) errs.body = 'Message is required';
    if (!scheduledAt) {
      errs.scheduledAt = 'Scheduled date is required';
    } else {
      const scheduled = new Date(scheduledAt);
      const minTime = new Date();
      minTime.setMinutes(minTime.getMinutes() + 4);
      if (scheduled <= minTime) errs.scheduledAt = 'Must be at least 5 minutes in the future';
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const result = await scheduleEmail({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        recipientEmail: recipientEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      router.push(`/success?id=${result.id}`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full px-4 py-3';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {apiError && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-400 text-sm">
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="John Doe"
          className={inputClass}
        />
        {errors.senderName && <p className="text-red-400 text-sm mt-1">{errors.senderName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Your Email</label>
        <input
          type="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          placeholder="john@example.com"
          className={inputClass}
        />
        {errors.senderEmail && <p className="text-red-400 text-sm mt-1">{errors.senderEmail}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Email</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="friend@example.com"
          className={inputClass}
        />
        {errors.recipientEmail && <p className="text-red-400 text-sm mt-1">{errors.recipientEmail}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Happy Birthday!"
          className={inputClass}
        />
        {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          rows={5}
          className={inputClass + ' resize-none'}
        />
        {errors.body && <p className="text-red-400 text-sm mt-1">{errors.body}</p>}
      </div>

      <DateTimePicker value={scheduledAt} onChange={setScheduledAt} error={errors.scheduledAt} />

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full px-8 py-3 w-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Scheduling&hellip;
          </>
        ) : (
          'Schedule Email →'
        )}
      </button>
    </form>
  );
}
