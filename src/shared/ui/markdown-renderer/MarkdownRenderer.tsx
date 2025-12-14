import { useMemo } from 'react';
import { marked } from 'marked';
import styles from './MarkdownRenderer.module.scss';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Configure marked options
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => {
    if (!content) return '';
    return marked.parse(content) as string;
  }, [content]);

  return (
    <div
      className={`${styles.root} ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
