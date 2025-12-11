'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function DocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Fetch the OpenAPI specification
    fetch('/api/docs')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('API spec loaded:', data);
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching API specification:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Initialize Redoc only when both spec and script are loaded
    if (spec && scriptLoaded && window.Redoc) {
      console.log('Initializing Redoc...');
      try {
        // Clear any existing content
        const container = document.getElementById('redoc-container');
        if (container) {
          container.innerHTML = '';
        }

        window.Redoc.init(
          spec,
          {
            expandResponses: "200,201",
            hideDownloadButton: false,
            showExtensions: true,
            theme: {
              colors: {
                primary: {
                  main: "#3b82f6"
                },
                background: "#ffffff"
              },
              typography: {
                fontFamily: "system-ui, -apple-system, sans-serif"
              },
              sidebar: {
                width: "300px",
                backgroundColor: "#fafafa"
              },
              rightPanel: {
                backgroundColor: "#263238"
              }
            }
          },
          document.getElementById('redoc-container')
        );
        console.log('Redoc initialized successfully');
      } catch (err) {
        console.error('Error initializing Redoc:', err);
        setError('Failed to initialize documentation viewer');
      }
    }
  }, [spec, scriptLoaded]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Or <a href="/docs/debug" className="text-blue-500 hover:underline">view debug information</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Redoc script loaded');
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error('Failed to load Redoc script:', e);
          setError('Failed to load documentation viewer script');
        }}
      />
      <div id="redoc-container" style={{ minHeight: '100vh' }}></div>
    </>
  );
}

// Add type declaration for Redoc
declare global {
  interface Window {
    Redoc: any;
  }
}