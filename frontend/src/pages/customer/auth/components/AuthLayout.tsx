/**
 * AuthLayout - Shared layout component for auth flow
 * Provides consistent header with back button
 */

import { ArrowLeft } from 'lucide-react';
import type { AuthLayoutProps } from '../types';

const AuthLayout = ({ children, onBack }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">{children}</main>
    </div>
  );
};

export default AuthLayout;
