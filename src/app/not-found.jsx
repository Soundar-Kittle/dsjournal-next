import React from "react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary/5 text-center px-6">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-2">
        Page Not Found
      </h2>
      <p className="mb-6">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition-all duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
