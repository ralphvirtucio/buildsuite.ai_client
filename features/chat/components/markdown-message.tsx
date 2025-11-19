'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-semibold mb-1" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-semibold mt-2 mb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-semibold mt-2 mb-1" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-4 my-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-4 my-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="underline text-blue-600 hover:text-blue-800 dark:text-blue-400"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

