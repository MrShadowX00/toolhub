import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-extrabold text-gray-800">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-white">Page Not Found</h2>
      <p className="mt-2 text-gray-400">
        The tool or page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
