import { interpolate, useCurrentFrame } from 'remotion';

export const Logo: React.FC<{ size?: number; color?: string }> = ({
  size = 80,
  color = '#0071e3',
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 18], [0.7, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: `linear-gradient(150deg, ${color} 0%, ${color}cc 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.56,
        fontWeight: 700,
        color: '#fff',
        boxShadow: `0 ${size * 0.2}px ${size * 0.5}px ${color}44`,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      K
    </div>
  );
};
