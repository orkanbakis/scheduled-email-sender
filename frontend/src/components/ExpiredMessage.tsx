export default function ExpiredMessage() {
  return (
    <div className="text-center">
      <div className="text-5xl mb-4">&#x2709;&#xFE0F;</div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
        The email has been sent!
      </h2>
      <p className="text-gray-400">
        Check your inbox &mdash; it should have arrived by now.
      </p>
    </div>
  );
}
