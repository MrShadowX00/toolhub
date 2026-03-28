import Link from "next/link";
import { Zap, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-500" />
            <span className="text-lg font-bold text-white">ToolHub</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              Terms
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" />
          <p>All tools run client-side. Your files never leave your device.</p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} ToolHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
