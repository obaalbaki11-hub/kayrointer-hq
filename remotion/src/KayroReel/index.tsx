import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/DMSans';
import { AnimatedText } from '../components/AnimatedText';
import type { ReelProps, ReelScene } from '../types';

const { fontFamily } = loadFont();

// 30 seconds at 30fps = 900 frames total
// 6 scenes × 150 frames each = 900 frames
const SCENE_FRAMES = 150;
const TRANSITION_FRAMES = 20;

const SceneCard: React.FC<{
  scene: ReelScene;
  accent: string;
  company: string;
  totalScenes: number;
}> = ({ scene, accent, company, totalScenes }) => {
  const frame = useCurrentFrame();

  const isFirst = scene.scene === 1;
  const isLast = scene.scene === totalScenes;

  // Gradient direction alternates per scene for visual variety
  const gradients = [
    `linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 100%)`,
    `linear-gradient(160deg, #0f0f1a 0%, #1e1e3f 100%)`,
    `linear-gradient(160deg, #0a1628 0%, #0d2137 100%)`,
    `linear-gradient(160deg, #0a0a0a 0%, #2a1a0e 100%)`,
    `linear-gradient(160deg, #0d1a0d 0%, #1a2e1a 100%)`,
    `linear-gradient(160deg, #1a0a1a 0%, #2e1a2e 100%)`,
  ];
  const bg = gradients[(scene.scene - 1) % gradients.length];

  // Accent stripe that animates in
  const stripeScale = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });

  // Progress bar
  const progressWidth = interpolate(
    frame,
    [0, SCENE_FRAMES - TRANSITION_FRAMES],
    [0, 100],
    { extrapolateRight: 'clamp' }
  );

  // Subtle background pulse
  const bgOpacity = interpolate(
    frame,
    [0, SCENE_FRAMES / 2, SCENE_FRAMES],
    [0.04, 0.08, 0.04],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 80px',
        fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* Accent background circle */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: accent,
          opacity: bgOpacity,
          filter: 'blur(120px)',
        }}
      />

      {/* Top bar: scene counter + company */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 80,
          right: 80,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {String(scene.scene).padStart(2, '0')} / {String(totalScenes).padStart(2, '0')}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: accent,
            letterSpacing: 0.5,
          }}
        >
          {company}
        </div>
      </div>

      {/* Accent stripe */}
      <div
        style={{
          width: 64,
          height: 4,
          borderRadius: 2,
          background: accent,
          marginBottom: 48,
          transformOrigin: 'left center',
          transform: `scaleX(${stripeScale})`,
        }}
      />

      {/* Scene label */}
      <AnimatedText delay={4} style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {scene.timestamp}
        </div>
      </AnimatedText>

      {/* On-screen text (headline) */}
      <AnimatedText delay={10}>
        <div
          style={{
            fontSize: isFirst ? 96 : 80,
            fontWeight: 900,
            letterSpacing: -3,
            lineHeight: 1.05,
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          {scene.onscreen}
        </div>
      </AnimatedText>

      {/* Voiceover / body copy */}
      <AnimatedText delay={20} direction="fade">
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.65)',
            textAlign: 'center',
            maxWidth: 840,
          }}
        >
          {scene.voiceover}
        </div>
      </AnimatedText>

      {/* Visual tag */}
      {scene.visual && (
        <AnimatedText delay={30} direction="fade">
          <div
            style={{
              marginTop: 60,
              padding: '14px 32px',
              borderRadius: 980,
              border: `1.5px solid ${accent}55`,
              fontSize: 20,
              fontWeight: 500,
              color: accent,
              letterSpacing: 0.5,
            }}
          >
            {scene.visual}
          </div>
        </AnimatedText>
      )}

      {/* CTA on last scene */}
      {isLast && (
        <AnimatedText delay={40}>
          <div
            style={{
              marginTop: 80,
              background: accent,
              color: '#fff',
              padding: '28px 72px',
              borderRadius: 980,
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -0.5,
              boxShadow: `0 20px 60px ${accent}55`,
            }}
          >
            Get Started →
          </div>
        </AnimatedText>
      )}

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressWidth}%`,
            background: accent,
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const KayroReel: React.FC<ReelProps> = ({
  topic,
  scenes,
  accentColor,
  company,
}) => {
  const accent = accentColor || '#0071e3';

  return (
    <AbsoluteFill style={{ background: '#000', fontFamily }}>
      {scenes.map((scene, i) => {
        const start = i * SCENE_FRAMES;
        const duration = SCENE_FRAMES + TRANSITION_FRAMES;
        return (
          <Sequence key={scene.scene} from={start} durationInFrames={duration}>
            <SceneCard
              scene={scene}
              accent={accent}
              company={company}
              totalScenes={scenes.length}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
