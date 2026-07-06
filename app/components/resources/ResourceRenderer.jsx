import HeroBlock from "./blocks/HeroBlock";
import TextBlock from "./blocks/TextBlock";
import VerseBlock from "./blocks/VerseBlock";
import TextImageBlock from "./blocks/TextImageBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import AudioBlock from "./blocks/AudioBlock";
import DividerBlock from "./blocks/DividerBlock";
import CalloutBlock from "./blocks/CalloutBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import ReflectionBlock from "./blocks/ReflectionBlock";
import TakeawayBlock from "./blocks/TakeawayBlock";
import AccordionBlock from "./blocks/AccordionBlock";

/* ================= BLOCK REGISTRY ================= */
const BLOCKS = {
  hero: HeroBlock,
  text: TextBlock,
  verse: VerseBlock,
  textImage: TextImageBlock,
  image: ImageBlock,
  video: VideoBlock,
  audio: AudioBlock,
  divider: DividerBlock,
  callout: CalloutBlock,
  quote: QuoteBlock,
  reflection: ReflectionBlock,
  takeaway: TakeawayBlock,
  accordion: AccordionBlock,
};

/* ================= RENDERER ================= */
export default function ResourceRenderer({ resource, withAnchors = false }) {
  const blocks = resource?.blocks ?? [];

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return (
      <p className="text-center text-gray-400 py-20">
        Aucun contenu disponible pour cette ressource.
      </p>
    );
  }

  return (
    <div className="w-full">
      {blocks.map((block, index) => {
        const BlockComponent = BLOCKS[block.type];
        if (!BlockComponent) return null;

        return (
          <BlockComponent
            key={`${block.type}-${index}`}
            {...block.data}
            withAnchors={withAnchors} // 👈 propagation
          />
        );
      })}
    </div>
  );
}
