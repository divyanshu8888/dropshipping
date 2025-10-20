import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const SetupPage: React.FC = () => {
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: false,
    supabaseAnonKey: false,
    serviceRoleKey: false
  });

  useEffect(() => {
    // Check environment variables
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
  }, []);

  const allConfigured = envStatus.supabaseUrl && envStatus.supabaseAnonKey && envStatus.serviceRoleKey;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Head>
        <title>Setup - Platform Configuration</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🚀 Platform Setup</h1>
          
          {/* Environment Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Configuration</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${envStatus.supabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={envStatus.supabaseUrl ? 'text-green-700' : 'text-red-700'}>
                  NEXT_PUBLIC_SUPABASE_URL
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${envStatus.supabaseAnonKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={envStatus.supabaseAnonKey ? 'text-green-700' : 'text-red-700'}>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${envStatus.serviceRoleKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={envStatus.serviceRoleKey ? 'text-green-700' : 'text-red-700'}>
                  SUPABASE_SERVICE_ROLE_KEY
                </span>
              </div>
            </div>
          </div>

          {!allConfigured && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-4">⚠️ Missing Environment Variables</h3>
              <p className="text-red-700 mb-4">
                You need to set up your environment variables to use the platform. Create a <code className="bg-red-100 px-2 py-1 rounded">.env.local</code> file in your project root.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Create .env.local file:</h4>
                <pre className="text-sm text-gray-800">
{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}
                </pre>
              </div>

              <div className="text-sm text-red-600">
                <p className="mb-2"><strong>How to get these values:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to Settings → API</li>
                  <li>Copy the URL and keys</li>
                  <li>Paste them into your .env.local file</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            </div>
          )}

          {allConfigured && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Environment Configured</h3>
              <p className="text-green-700">All environment variables are set up correctly!</p>
            </div>
          )}

          {/* Database Setup */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Setup</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Set up your database schema</h3>
              <p className="text-blue-700 mb-4">
                Run one of these commands to set up your database with the admin user:
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Option 1: Advanced Schema (Recommended)</h4>
                <pre className="text-sm text-gray-800">
{`psql -h db.your-project-id.supabase.co -U postgres -d postgres -f supabase/advanced-schema.sql`}
                </pre>
                <p className="text-sm text-gray-600 mt-2">
                  This includes the admin user (credentials will be shown after setup)
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Option 2: Existing Schema</h4>
                <pre className="text-sm text-gray-800">
{`psql -h db.your-project-id.supabase.co -U postgres -d postgres -f supabase/complete-setup.sql`}
                </pre>
                <p className="text-sm text-gray-600 mt-2">
                  Then manually create an admin user
                </p>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">🔐 Admin Login</h3>
              <p className="text-indigo-700 mb-4">Access the admin portal</p>
              <div className="text-sm text-indigo-600">
                <p><strong>Email:</strong> admin@platform.com</p>
                <p><strong>Password:</strong> [Generated during setup - check console output]</p>
              </div>
              <a
                href="/login"
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Login
              </a>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">📊 Admin Dashboard</h3>
              <p className="text-purple-700 mb-4">Manage the platform</p>
              <a
                href="/admin"
                className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Admin
              </a>
            </div>
          </div>

          {/* Status */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status:</h3>
            <p className="text-sm text-gray-600">
              Server running on: <strong>http://localhost:3001</strong><br/>
              Environment: {allConfigured ? '✅ Configured' : '❌ Needs Setup'}<br/>
              Database: Needs manual setup
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
