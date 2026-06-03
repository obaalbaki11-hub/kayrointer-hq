import { interpolate, useCurrentFrame } from 'remotion';

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  direction?: 'up' | 'fade';
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  style = {},
  direction = 'up',
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => t * t * (3 - 2 * t),
  });

  const translateY =
    direction === 'up'
      ? interpolate(localFrame, [0, 22], [24, 0], {
          extrapolateRight: 'clamp',
          easing: (t) => 1 - Math.pow(1 - t, 3),
        })
      : 0;

  const blur =
    direction === 'up'
      ? interpolate(localFrame, [0, 20], [6, 0], { extrapolateRight: 'clamp' })
      : 0;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        filter: blur > 0.05 ? `blur(${blur}px)` : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
