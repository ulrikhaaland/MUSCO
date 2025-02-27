/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        'app-title': ['1.5rem', { lineHeight: '2rem', fontWeight: '500' }],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            maxWidth: 'none',
            strong: {
              color: '#fff',
              fontWeight: '600',
            },
            h1: {
              color: '#fff',
            },
            h2: {
              color: '#fff',
            },
            h3: {
              color: '#fff',
            },
            h4: {
              color: '#fff',
            },
            p: {
              color: '#fff',
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            li: {
              color: '#fff',
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            'ul > li': {
              paddingLeft: '1.5em',
              position: 'relative',
              '&::before': {
                content: '"•"',
                position: 'absolute',
                left: '0.25em',
                color: '#fff',
              },
            },
            'ol > li': {
              paddingLeft: '1.5em',
              position: 'relative',
              '&::before': {
                color: '#fff',
              },
            },
            hr: {
              borderColor: '#374151',
              marginTop: '2em',
              marginBottom: '2em',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#fff',
              padding: '1em',
              borderRadius: '0.375rem',
            },
            code: {
              color: '#fff',
              backgroundColor: '#374151',
              padding: '0.25em 0.5em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 