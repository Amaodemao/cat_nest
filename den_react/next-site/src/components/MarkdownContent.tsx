import 'katex/dist/katex.min.css'

import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

export function MarkdownContent({ content }: { content: string }) {
  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
    },
  }
  return (
    <article className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
