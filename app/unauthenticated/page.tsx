// client/app/unauthenticated/page.tsx

export default function UnauthenticatedPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      role="main"
      aria-labelledby="access-denied-heading"
    >
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg mx-4">
        {/* Lock icon with animation */}
        <div className="mb-6" aria-hidden="true">
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Access denied icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h1
          id="access-denied-heading"
          className="text-3xl font-bold text-gray-900 mb-3"
        >
          Access Denied
        </h1>

        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          You need to access BuildSuite AI from your GoHighLevel dashboard.
        </p>

        {/* Clear, numbered instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 mb-6 text-left">
          <h2 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to access BuildSuite AI:
          </h2>
          <ol className="space-y-3" role="list">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                1
              </span>
              <span className="text-blue-900 font-medium pt-0.5">
                Log into your <strong>GoHighLevel</strong> account
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                2
              </span>
              <span className="text-blue-900 font-medium pt-0.5">
                Find <strong>"BuildSuite AI"</strong> in your sidebar menu
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-bold">
                3
              </span>
              <span className="text-blue-900 font-medium pt-0.5">
                Click the menu item to launch the chatbot
              </span>
            </li>
          </ol>
        </div>

        {/* CTA Button */}
        <a
          href="https://app.gohighlevel.com"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          aria-label="Open GoHighLevel dashboard"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open GoHighLevel Dashboard
        </a>

        {/* Support information */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-600 mb-2">
            Need help?{' '}
            <a
              href="mailto:support@buildsuite.ai"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              aria-label="Email support team"
            >
              Contact Support
            </a>
          </p>
          <p className="text-xs text-gray-400 font-mono">
            Error Code: AUTH_REQUIRED
          </p>
        </div>
      </div>
    </div>
  );
}
