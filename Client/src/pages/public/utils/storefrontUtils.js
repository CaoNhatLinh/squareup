import { BLOCK_TYPES } from "@/components/builder/blockTypes";

export function generateNavLinks(layout) {
  return layout
    .filter((block) => {
      const blockType = BLOCK_TYPES.find((bt) => bt.type === block.type);
      return !blockType?.hiddenFromNav;
    })
    .map((block) => {
      const blockType = BLOCK_TYPES.find((bt) => bt.type === block.type);
      const label = blockType ? blockType.label : block.type;
      const url = `#${block.id}`;
      return { label, url };
    });
}
