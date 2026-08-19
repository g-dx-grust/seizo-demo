import { AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { T } from './theme';

export interface ZoomEvent {
  start: number; // 秒（クリップ内）
  dur: number;
  scale: number;
  box: { x: number; y: number; width: number; height: number };
}
export interface CueEvent {
  start: number;
  dur: number;
  text: string;
}
export interface ClipData {
  chapter: number;
  src: string; // public/ 内のファイル名
  trimStartSec: number;
  contentDurSec: number;
  cues: CueEvent[];
  zooms: ZoomEvent[];
}

const W = 1920;
const H = 1080;
const RAMP = 0.55; // ズームイン/アウトの秒数

const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);

export const ClipScene: React.FC<{ clip: ClipData }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // アクティブなズームを探して進行度を計算
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let hlBox: ZoomEvent['box'] | null = null;
  let hlOpacity = 0;
  for (const z of clip.zooms) {
    if (t < z.start || t > z.start + z.dur) continue;
    const p = t - z.start;
    const ramp = Math.min(1, p / RAMP, (z.dur - p) / RAMP);
    const eased = easeInOut(Math.max(0, Math.min(1, ramp)));
    scale = 1 + (z.scale - 1) * eased;
    const cx = z.box.x + z.box.width / 2;
    const cy = z.box.y + z.box.height / 2;
    // 対象の中心を画面中央へ。画面端がはみ出さない範囲にクランプ
    tx = Math.max(W - W * scale, Math.min(0, W / 2 - scale * cx));
    ty = Math.max(H - H * scale, Math.min(0, H / 2 - scale * cy));
    hlBox = z.box;
    hlOpacity = eased;
    break;
  }

  // アクティブな字幕
  const cue = clip.cues.find((c) => t >= c.start && t <= c.start + c.dur + 0.15);
  let cueOpacity = 0;
  if (cue) {
    const p = t - cue.start;
    cueOpacity = Math.min(1, p / 0.22, Math.max(0, (cue.dur + 0.15 - p) / 0.22));
  }

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily: T.font }}>
      <div
        style={{
          position: 'absolute',
          width: W,
          height: H,
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <OffthreadVideo
          src={staticFile(clip.src)}
          trimBefore={Math.round(clip.trimStartSec * fps)}
          style={{ width: W, height: H }}
          muted
        />
        {hlBox && (
          <div
            style={{
              position: 'absolute',
              left: hlBox.x,
              top: hlBox.y,
              width: hlBox.width,
              height: hlBox.height,
              border: `3px solid rgba(37,99,235,${0.9 * hlOpacity})`,
              borderRadius: 12,
              boxShadow: `0 0 0 6px rgba(37,99,235,${0.14 * hlOpacity}), 0 12px 40px rgba(37,99,235,${0.18 * hlOpacity})`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {cue && (
        <div
          style={{
            position: 'absolute',
            bottom: 42,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: cueOpacity,
          }}
        >
          <div
            style={{
              maxWidth: 1560,
              background: 'rgba(16,24,40,0.88)',
              color: '#fff',
              borderRadius: 14,
              padding: '16px 34px',
              fontSize: 31,
              fontWeight: 500,
              lineHeight: 1.55,
              textAlign: 'center',
              boxShadow: '0 12px 32px rgba(15,23,42,0.35)',
            }}
          >
            {cue.text}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
