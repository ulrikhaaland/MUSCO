import React from 'react';
import { I18nWrapper } from './setup';

// This is an example of how to update your app's layout.tsx file
// You would typically place this in src/app/layout.tsx

export default function ExampleRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap your entire application with I18nWrapper to enable translations */}
        <I18nWrapper initialLocale="en">
          {children}
        </I18nWrapper>
      </body>
    </html>
  );
}

// NOTE: This is just an example file. 
// You should modify your actual layout.tsx file to include the I18nWrapper. 