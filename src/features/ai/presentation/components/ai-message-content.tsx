"use client";

function renderInlineMarkdown(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const withCode = line.replace(
        /`([^`]+)`/g,
        '<code class="rounded bg-muted px-1 py-0.5 text-[0.8em]">$1</code>'
      );
      const withBold = withCode.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
      );
      const withItalic = withBold.replace(/\*([^*]+)\*/g, "<em>$1</em>");

      if (line.startsWith("> ")) {
        return `<blockquote class="border-l-2 border-primary/30 pl-3 text-muted-foreground">${withItalic.slice(2)}</blockquote>`;
      }

      return withItalic;
    })
    .join("<br />");
}

type AiMessageContentProps = {
  content: string;
};

export function AiMessageContent({ content }: AiMessageContentProps) {
  return (
    <div
      className="space-y-2 text-sm leading-relaxed [&_blockquote]:my-2"
      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }}
    />
  );
}
