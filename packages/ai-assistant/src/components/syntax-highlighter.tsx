// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface SyntaxHighlighterWrapperProps {
  code: string;
  language: string;
  showLineNumbers: boolean;
}

export function SyntaxHighlighterWrapper({
  code,
  language,
  showLineNumbers,
}: SyntaxHighlighterWrapperProps) {
  return (
    <>
      <SyntaxHighlighter
        className="overflow-hidden dark:hidden"
        codeTagProps={{
          className: 'font-mono text-sm',
        }}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
        }}
        language={language}
        lineNumberStyle={{
          paddingRight: '1rem',
          minWidth: '2.5rem',
        }}
        showLineNumbers={showLineNumbers}
        style={oneLight}
      >
        {code}
      </SyntaxHighlighter>
      <SyntaxHighlighter
        className="hidden overflow-hidden dark:block"
        codeTagProps={{
          className: 'font-mono text-sm',
        }}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          color: 'var(--foreground)',
        }}
        language={language}
        lineNumberStyle={{
          paddingRight: '1rem',
          minWidth: '2.5rem',
        }}
        showLineNumbers={showLineNumbers}
        style={oneDark}
      >
        {code}
      </SyntaxHighlighter>
    </>
  );
}
