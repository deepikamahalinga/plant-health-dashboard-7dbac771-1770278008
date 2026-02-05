import { FC } from 'react';
import { Link } from 'react-router-dom';

const NotFound: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-lg text-center">
        
        {/* 404 Icon/Illustration */}
        <div className="mb-8">
          <svg
            className="w-40 h-40 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          Oops! Page Not Found
        </h2>

        {/* Helpful Message */}
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. The page might have been removed,
          renamed, or is temporarily unavailable.
        </p>

        {/* Navigation Suggestions */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-700 font-medium">You might want to:</p>
          <ul className="text-gray-600">
            <li>• Double check the URL for typos</li>
            <li>• Go back to the previous page</li>
            <li>• Visit our homepage</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg 
                     hover:bg-blue-700 transition duration-200"
          >
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg
                     hover:bg-gray-300 transition duration-200"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;