'use client';

import Script from 'next/script';

export default function DocsPage() {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/redoc@2.1.3/bundles/redoc.standalone.js" strategy="afterInteractive" />

      <div style={{ minHeight: '100vh' }}>
        <redoc
          spec-url="/api/docs"
          expand-responses="200,201"
          hide-download-button="false"
          show-extensions="true"
          theme='{"colors":{"primary":{"main":"#3b82f6"}},"typography":{"fontFamily":"system-ui, -apple-system, sans-serif"},"sidebar":{"width":"300px"}}'
        />
      </div>

      <Script id="redoc-init" strategy="afterInteractive">
        {`
          // Redoc will automatically initialize when the spec-url is provided
        `}
      </Script>
    </>
  );
}