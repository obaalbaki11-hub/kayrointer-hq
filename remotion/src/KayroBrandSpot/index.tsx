import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/DMSans';
import { AnimatedText } from '../components/AnimatedText';
import { Logo } from '../components/Logo';
import type { BrandSpotProps } from '../types';

const { fontFamily } = loadFont();

// 33 seconds at 30fps = 990 frames
// Scene plan:
//   0–150   Hero opener (company name + tagline)
//   150–330 Stat showcase (3 stats)
//   330–510 Feature 1
//   510–690 Feature 2
//   690–870 Feature 3
//   870–990 CTA + URL

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// --- HERO SCENE ---
const HeroScene: React.FC<{ company: string; tagline: string; accent: string }> = ({
  company, tagline, accent,
}) => {
  const frame = useCurrentFrame();

  const logoY = interpolate(frame, [0, 40], [60, 0], { extrapolateRight: 'clamp', easing: easeOut });
  const logoOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  const bgScale = interpolate(frame, [0, 150], [1.05, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0a0a0f 0%, #12121f 60%, #0a0a0f 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily,
        transform: `scale(${bgScale})`,
      }}
    >
      {/* Accent glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: accent,
        opacity: 0.07,
        filter: 'blur(150px)',
      }} />

      <div style={{ opacity: logoOpacity, transform: `translateY(${logoY}px)`, marginBottom: 48 }}>
        <Logo size={120} color={accent} />
      </div>

      <AnimatedText delay={20}>
        <div style={{
          fontSize: 120,
          fontWeight: 900,
          letterSpacing: -4,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1,
          marginBottom: 32,
        }}>
          {company}
        </div>
      </AnimatedText>

      <AnimatedText delay={34} direction="fade">
        <div style={{
          fontSize: 36,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          textAlign: 'center',
          letterSpacing: 0.5,
          maxWidth: 800,
          lineHeight: 1.5,
        }}>
          {tagline}
        </div>
      </AnimatedText>
    </AbsoluteFill>
  );
};

// --- STATS SCENE ---
const StatsScene: React.FC<{ stats: { num: string; label: string }[]; accent: string; company: string }> = ({
  stats, accent, company,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      padding: '80px 120px',
    }}>
      <AnimatedText delay={0} style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: accent,
        }}>
          By the numbers
        </div>
      </AnimatedText>

      <AnimatedText delay={8}>
        <div style={{
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: -2,
          color: '#1d1d1f',
          marginBottom: 72,
          textAlign: 'center',
        }}>
          Results that speak for themselves
        </div>
      </AnimatedText>

      <div style={{ display: 'flex', gap: 80, justifyContent: 'center', flexWrap: 'wrap' }}>
        {stats.map((stat, i) => {
          const statOpacity = interpolate(frame, [16 + i * 12, 36 + i * 12], [0, 1], {
            extrapolateRight: 'clamp',
            easing: easeOut,
          });
          const statY = interpolate(frame, [16 + i * 12, 36 + i * 12], [32, 0], {
            extrapolateRight: 'clamp',
            easing: easeOut,
          });
          return (
            <div
              key={i}
              style={{
                opacity: statOpacity,
                transform: `translateY(${statY}px)`,
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 96,
                fontWeight: 900,
                letterSpacing: -4,
                color: accent,
                lineHeight: 1,
                marginBottom: 12,
              }}>
                {stat.num}
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 500,
                color: '#6e6e73',
                letterSpacing: 0.3,
              }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 48,
        right: 72,
        fontSize: 15,
        color: '#aeaeb2',
        fontWeight: 500,
      }}>
        {company}
      </div>
    </AbsoluteFill>
  );
};

// --- FEATURE SCENE ---
const FeatureScene: React.FC<{
  feature: { icon: string; name: string; desc: string };
  accent: string;
  company: string;
  index: number;
}> = ({ feature, accent, company, index }) => {
  const frame = useCurrentFrame();

  const isEven = index % 2 === 0;
  const bg = isEven ? `#0a0a0f` : accent;
  const textColor = '#fff';
  const subColor = isEven ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.8)';

  const iconScale = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 4),
  });

  return (
    <AbsoluteFill style={{
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      padding: '80px 120px',
      overflow: 'hidden',
    }}>
      {/* Background accent circle */}
      {!isEven && (
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          filter: 'blur(60px)',
        }} />
      )}

      {/* Icon */}
      <div style={{
        fontSize: 120,
        marginBottom: 48,
        transform: `scale(${iconScale})`,
        lineHeight: 1,
      }}>
        {feature.icon}
      </div>

      <AnimatedText delay={12}>
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          letterSpacing: -3,
          color: textColor,
          textAlign: 'center',
          lineHeight: 1.05,
          marginBottom: 32,
        }}>
          {feature.name}
        </div>
      </AnimatedText>

      <AnimatedText delay={22} direction="fade">
        <div style={{
          fontSize: 30,
          fontWeight: 400,
          color: subColor,
          textAlign: 'center',
          maxWidth: 820,
          lineHeight: 1.65,
        }}>
          {feature.desc}
        </div>
      </AnimatedText>

      <div style={{
        position: 'absolute',
        bottom: 48,
        left: 72,
        fontSize: 15,
        color: isEven ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)',
        fontWeight: 500,
      }}>
        {company}
      </div>
    </AbsoluteFill>
  );
};

// --- CTA SCENE ---
const CTAScene: React.FC<{ cta: string; url: string; accent: string; company: string }> = ({
  cta, url, accent, company,
}) => {
  const frame = useCurrentFrame();

  const ringScale = interpolate(frame, [0, 60], [0.8, 1.4], { extrapolateRight: 'clamp' });
  const ringOpacity = interpolate(frame, [0, 60], [0.3, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: accent,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      padding: '80px 120px',
    }}>
      {/* Pulsing ring */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.4)',
        transform: `scale(${ringScale})`,
        opacity: ringOpacity,
      }} />

      <AnimatedText delay={0} style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 5,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
        }}>
          {company}
        </div>
      </AnimatedText>

      <AnimatedText delay={8}>
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          letterSpacing: -3,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.08,
          marginBottom: 56,
        }}>
          {cta}
        </div>
      </AnimatedText>

      <AnimatedText delay={20}>
        <div style={{
          background: '#fff',
          color: accent,
          padding: '28px 80px',
          borderRadius: 980,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: -0.5,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}>
          {url}
        </div>
      </AnimatedText>
    </AbsoluteFill>
  );
};

// --- ROOT COMPOSITION ---
export const KayroBrandSpot: React.FC<BrandSpotProps> = ({
  company,
  tagline,
  accentColor,
  stats,
  features,
  cta,
  url,
}) => {
  const accent = accentColor || '#0071e3';
  const featuresToShow = features.slice(0, 3);

  // Scene durations (frames at 30fps)
  const HERO_DUR = 150;        // 5s
  const STATS_DUR = 180;       // 6s
  const FEATURE_DUR = 180;     // 6s each (3 features = 18s)
  const CTA_DUR = 120;         // 4s
  const OVERLAP = 15;

  const heroStart = 0;
  const statsStart = HERO_DUR - OVERLAP;
  const feat0Start = statsStart + STATS_DUR - OVERLAP;
  const feat1Start = feat0Start + FEATURE_DUR - OVERLAP;
  const feat2Start = feat1Start + FEATURE_DUR - OVERLAP;
  const ctaStart = feat2Start + FEATURE_DUR - OVERLAP;

  return (
    <AbsoluteFill style={{ background: '#000', fontFamily }}>
      <Sequence from={heroStart} durationInFrames={HERO_DUR + OVERLAP}>
        <HeroScene company={company} tagline={tagline} accent={accent} />
      </Sequence>

      <Sequence from={statsStart} durationInFrames={STATS_DUR + OVERLAP}>
        <StatsScene stats={stats} accent={accent} company={company} />
      </Sequence>

      {featuresToShow.map((feat, i) => {
        const starts = [feat0Start, feat1Start, feat2Start];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={FEATURE_DUR + OVERLAP}>
            <FeatureScene feature={feat} accent={accent} company={company} index={i} />
          </Sequence>
        );
      })}

      <Sequence from={ctaStart} durationInFrames={CTA_DUR}>
        <CTAScene cta={cta} url={url} accent={accent} company={company} />
      </Sequence>
    </AbsoluteFill>
  );
};
