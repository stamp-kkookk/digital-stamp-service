import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface EntryURLPanelProps {
  storeId: string;
}

const EntryURLPanel: React.FC<EntryURLPanelProps> = ({ storeId }) => {
  const [copied, setCopied] = useState(false);
  const entryUrl = `https://kkookk.com/c/store/${storeId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(entryUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!storeId) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 border border-gray-200 rounded-lg">
      <p className="text-sm font-medium text-gray-600 mb-2">고객 진입 URL (정적)</p>
      <div className="flex items-center space-x-4">
        <div className="flex-grow bg-gray-50 text-gray-700 rounded-lg px-4 py-3 text-sm truncate">
          {entryUrl}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 w-32"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5 text-green-500 mr-2" />
              복사 완료!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5 text-gray-500 mr-2" />
              URL 복사
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EntryURLPanel;
