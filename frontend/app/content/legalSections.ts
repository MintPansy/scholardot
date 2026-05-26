import type { LegalBlock } from "./legalTypes";

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

/** h2 기준으로 조항 단위 섹션 분리 */
export function splitBlocksIntoSections(blocks: LegalBlock[]): LegalSection[] {
  const sections: LegalSection[] = [];
  let sectionIndex = 0;
  let current: LegalSection | null = null;

  for (const block of blocks) {
    if (block.type === "h2") {
      sectionIndex += 1;
      current = {
        id: `section-${sectionIndex}`,
        title: block.text,
        blocks: [block],
      };
      sections.push(current);
      continue;
    }

    if (current) {
      current.blocks.push(block);
    } else {
      sectionIndex += 1;
      current = {
        id: `section-${sectionIndex}`,
        title: "안내",
        blocks: [block],
      };
      sections.push(current);
    }
  }

  return sections;
}

export function getSectionAnchors(blocks: LegalBlock[]): { id: string; title: string }[] {
  return splitBlocksIntoSections(blocks).map(({ id, title }) => ({ id, title }));
}
