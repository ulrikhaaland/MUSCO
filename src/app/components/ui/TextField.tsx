'use client';

import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  errorText?: string;
};

export function TextField({ label, errorText, className = '', ...rest }: Props) {
  const base = 'w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={rest.id} className="block text-sm text-gray-300">
          {label}
        </label>
      )}
      <input {...rest} className={`${base} ${className}`} />
      {errorText && <div className="text-red-500 text-xs">{errorText}</div>}
    </div>
  );
}

export default TextField;


