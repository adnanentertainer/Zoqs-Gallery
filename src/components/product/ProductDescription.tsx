import type { ReactNode } from "react";
import { Heading, Text } from "@/components/ui/Typography";

/**
 * Admin-authored product descriptions are written in a small Markdown
 * subset (## / ### headings, **bold**, "- " bullet lists -- confirmed
 * against the live catalog; no links/italics/numbered lists are actually
 * used) but were being rendered as plain text, so the raw "##"/"**"
 * syntax showed up literally on the product page. This renders just that
 * subset -- not a general Markdown parser -- as real elements.
 */
export function ProductDescription({ description }: { description: string }) {
  return <div className="flex flex-col gap-4">{parseBlocks(description)}</div>;
}

function renderInlineBold(text: string, keyPrefix: string): ReactNode {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((segment, index) =>
      index % 2 === 1 ? (
        <strong key={`${keyPrefix}-${index}`}>{segment}</strong>
      ) : (
        segment
      ),
    );
}

function parseBlocks(description: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) return;
    const key = `p-${blocks.length}`;
    blocks.push(
      <Text key={key} variant="body" className="text-muted">
        {paragraphLines.map((line, index) => (
          <span key={`${key}-${index}`}>
            {renderInlineBold(line, `${key}-${index}`)}
            {index < paragraphLines.length - 1 && <br />}
          </span>
        ))}
      </Text>,
    );
    paragraphLines = [];
  }

  function flushList() {
    if (listItems.length === 0) return;
    const key = `ul-${blocks.length}`;
    blocks.push(
      <ul key={key} className="flex flex-col gap-1.5">
        {listItems.map((item, index) => (
          <li key={`${key}-${index}`} className="flex gap-2 text-muted">
            <span
              className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold"
              aria-hidden="true"
            />
            <Text variant="body" as="span" className="text-muted">
              {renderInlineBold(item, `${key}-${index}`)}
            </Text>
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  }

  for (const rawLine of description.split("\n")) {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <Heading
          key={`h4-${blocks.length}`}
          variant="h3"
          as="h4"
          className="text-lg text-primary"
        >
          {renderInlineBold(line.slice(4), `h4-${blocks.length}`)}
        </Heading>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <Heading
          key={`h3-${blocks.length}`}
          variant="h3"
          className="text-primary"
        >
          {renderInlineBold(line.slice(3), `h3-${blocks.length}`)}
        </Heading>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2));
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
