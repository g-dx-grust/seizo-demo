import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { T } from './theme';
import { CUSTOMER_NAME, VENDOR_NAME } from './chapters';

export const ENDING_FRAMES = 240; // 8秒

export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const t1 = interpolate(frame, [6, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const t2 = interpolate(frame, [26, 46], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const t3 = interpolate(frame, [56, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 800px at 50% 40%, ${T.navy2} 0%, ${T.navy} 70%)`,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: T.font,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.6,
            textAlign: 'center',
            opacity: t1,
            transform: `translateY(${(1 - t1) * 22}px)`,
          }}
        >
          単位・表示形式は、
          <br />
          御社の業務に合わせて<span style={{ color: '#6CA1FF' }}>ゼロから</span>作ります。
        </div>
        <div style={{ marginTop: 30, fontSize: 26, fontWeight: 500, color: T.side, opacity: t2 }}>
          今日の画面は、その第一案です。（課題10）
        </div>

        <div
          style={{
            marginTop: 78,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            opacity: t3,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: T.blue,
              color: '#fff',
              fontSize: 28,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            工
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>工場コックピット</div>
            <div style={{ fontSize: 17, fontWeight: 500, color: T.sideDim, letterSpacing: 2 }}>Powered by Lark</div>
          </div>
        </div>
        <div style={{ marginTop: 34, fontSize: 21, fontWeight: 500, color: T.side, opacity: t3 }}>
          {CUSTOMER_NAME}様{VENDOR_NAME ? ` ｜ ${VENDOR_NAME}` : ''}
        </div>
        <div style={{ marginTop: 14, fontSize: 16, color: T.sideDim, opacity: t3 }}>※デモ用サンプルデータ（実在の取引先名は含まれません）</div>
      </div>
    </AbsoluteFill>
  );
};
