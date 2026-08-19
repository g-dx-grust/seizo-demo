import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { T } from './theme';
import { CUSTOMER_NAME, DEMO_DATE_LABEL } from './chapters';

export const OPENING_FRAMES = 180; // 6秒

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const t1 = interpolate(frame, [8, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const t2 = interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const t3 = interpolate(frame, [32, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 800px at 50% 38%, ${T.navy2} 0%, ${T.navy} 70%)`,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: T.font,
        opacity: fadeOut,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: 26,
            background: T.blue,
            color: '#fff',
            fontSize: 56,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${pop})`,
            boxShadow: '0 24px 60px rgba(37,99,235,0.35)',
          }}
        >
          工
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 78,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 2,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 24}px)`,
          }}
        >
          工場コックピット
        </div>
        <div
          style={{ marginTop: 10, fontSize: 26, fontWeight: 500, color: T.sideDim, letterSpacing: 6, opacity: t1 }}
        >
          Powered by Lark
        </div>
        <div
          style={{
            marginTop: 56,
            height: 1,
            width: 560,
            background: 'rgba(255,255,255,0.14)',
            opacity: t2,
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontSize: 34,
            fontWeight: 700,
            color: T.side,
            opacity: t2,
            transform: `translateY(${(1 - t2) * 18}px)`,
          }}
        >
          {CUSTOMER_NAME}様 デモ
        </div>
        <div style={{ marginTop: 18, fontSize: 22, fontWeight: 400, color: T.sideDim, opacity: t3 }}>
          {DEMO_DATE_LABEL} ／ 提案書「お聞きした10の課題」対応デモ
        </div>
      </div>
    </AbsoluteFill>
  );
};
