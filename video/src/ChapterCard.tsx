import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { T } from './theme';
import type { ChapterDef } from './chapters';

export const CHAPTER_CARD_FRAMES = 96; // 3.2秒

export const ChapterCard: React.FC<{ def: ChapterDef }> = ({ def }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 16, mass: 0.7 } });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const accent = def.highlight ? T.red : T.blue;

  return (
    <AbsoluteFill
      style={{
        background: T.bg,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: T.font,
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: T.radius,
          border: `1px solid ${T.line}`,
          boxShadow: '0 24px 60px rgba(15,23,42,0.10)',
          padding: '64px 96px',
          minWidth: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - rise) * 46}px)`,
          opacity: rise,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: accent,
              color: '#fff',
              fontSize: 40,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {def.no}
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: T.t1, letterSpacing: 1 }}>{def.title}</div>
        </div>
        <div style={{ marginTop: 26, fontSize: 29, fontWeight: 500, color: T.t2 }}>{def.sub}</div>
        <div style={{ marginTop: 34, display: 'flex', gap: 12 }}>
          {def.pills.map((p) => (
            <span
              key={p}
              style={{
                background: def.highlight ? T.redL : T.blueL,
                color: accent,
                borderRadius: 999,
                padding: '10px 24px',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 44, fontSize: 19, color: T.t3, fontWeight: 500 }}>
        工場コックピット Powered by Lark ｜ ※デモ用サンプルデータ
      </div>
    </AbsoluteFill>
  );
};
