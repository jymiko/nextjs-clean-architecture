'use client';

import { useEffect, useState } from 'react';

export default function DebugDocsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(spec => {
        setData(spec);
        console.log('Spec loaded successfully:', spec);
      })
      .catch(err => {
        setError(err.message);
        console.error('Error:', err);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Documentation Debug</h1>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">API Info:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data.info, null, 2)}
        </pre>
      </div>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Available Paths:</h2>
        <ul className="list-disc list-inside">
          {Object.keys(data.paths || {}).map(path => (
            <li key={path}>{path}</li>
          ))}
        </ul>
      </div>
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm">
          If you can see this page, the API endpoint is working correctly.
          The issue might be with Redoc initialization on the main docs page.
        </p>
      </div>
    </div>
  );
}