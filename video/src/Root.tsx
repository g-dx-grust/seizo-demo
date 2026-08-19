import { Composition } from 'remotion';
import { DemoVideo, FPS, totalFrames } from './DemoVideo';

export const Root: React.FC = () => {
  return (
    <Composition
      id="demo"
      component={DemoVideo}
      durationInFrames={Math.max(totalFrames(), 30)}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
