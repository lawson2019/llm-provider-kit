import { Composition } from 'remotion';
import { Intro } from './Intro';

export const RemotionRoot = () => (
  <Composition
    id="Intro"
    component={Intro}
    durationInFrames={255}
    fps={30}
    width={960}
    height={540}
  />
);
