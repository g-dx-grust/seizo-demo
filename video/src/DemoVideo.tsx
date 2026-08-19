import { AbsoluteFill, Series } from 'remotion';
import { loadFont } from '@remotion/google-fonts/NotoSansJP';
import demoData from './generated/demoData.json';
import { CHAPTER_DEFS } from './chapters';
import { Opening, OPENING_FRAMES } from './Opening';
import { ChapterCard, CHAPTER_CARD_FRAMES } from './ChapterCard';
import { ClipScene, ClipData } from './ClipScene';
import { Ending, ENDING_FRAMES } from './Ending';
import { T } from './theme';

loadFont('normal', { weights: ['400', '500', '700', '900'], subsets: ['japanese', 'latin'] });

export const FPS = 30;

export const clipFrames = (c: { contentDurSec: number }) => Math.round(c.contentDurSec * FPS);

export const totalFrames = () =>
  OPENING_FRAMES +
  (demoData.chapters as ClipData[]).reduce((s, c) => s + CHAPTER_CARD_FRAMES + clipFrames(c), 0) +
  ENDING_FRAMES;

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Series>
        <Series.Sequence durationInFrames={OPENING_FRAMES} name="オープニング">
          <Opening />
        </Series.Sequence>
        {(demoData.chapters as ClipData[]).map((clip) => {
          const def = CHAPTER_DEFS.find((d) => d.num === clip.chapter)!;
          return [
            <Series.Sequence key={`card-${clip.chapter}`} durationInFrames={CHAPTER_CARD_FRAMES} name={`${def.no} カード`}>
              <ChapterCard def={def} />
            </Series.Sequence>,
            <Series.Sequence key={`clip-${clip.chapter}`} durationInFrames={clipFrames(clip)} name={`${def.no} ${def.title}`}>
              <ClipScene clip={clip} />
            </Series.Sequence>,
          ];
        })}
        <Series.Sequence durationInFrames={ENDING_FRAMES} name="エンディング">
          <Ending />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
