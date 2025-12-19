"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestAIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-ai");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to connect to test endpoint",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test OpenAI Connection</h1>
          <p className="text-gray-600">Verify your API key is working correctly</p>
        </div>
        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Connection Test</h2>
          <p className="text-gray-600 mb-4">
            This will test your OpenAI API key by analyzing a sample journal entry.
            Check your terminal/console for the full result.
          </p>

          <button
            onClick={testConnection}
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${
                result.success ? "text-green-900" : "text-red-900"
              }`}
            >
              {result.success ? "✅ Success!" : "❌ Error"}
            </h3>
            <p className={result.success ? "text-green-800" : "text-red-800"}>
              {result.message || result.error}
            </p>
            {result.note && (
              <p className="text-green-700 text-sm mt-2">{result.note}</p>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Make sure you created <code className="bg-gray-200 px-1 rounded">.env.local</code> file</li>
            <li>• Verify your API key starts with <code className="bg-gray-200 px-1 rounded">sk-proj-</code></li>
            <li>• Check that you restarted the dev server after adding the key</li>
            <li>• Ensure you have credits in your OpenAI account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

