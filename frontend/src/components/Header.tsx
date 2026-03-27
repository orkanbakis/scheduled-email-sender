import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-gray-100 font-semibold text-lg">
          <span>&#x2709;&#xFE0F;</span>
          <span>Future Email</span>
        </Link>
      </div>
    </header>
  );
}
