import { useState } from 'react';

interface ExampleBlockProps {
  example: unknown;
}

export function ExampleBlock({ example }: ExampleBlockProps) {
  const [copied, setCopied] = useState(false);

  const txt = typeof example === 'string' ? example : JSON.stringify(example, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="code-wrap">
      <pre>{txt}</pre>
      <div className={`copy-icon ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}
