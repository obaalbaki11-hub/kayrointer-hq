import {
  AbsoluteFill,
  Sequence,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/DMSans';
import { AnimatedText } from '../components/AnimatedText';
import type { CarouselProps, CarouselSlide } from '../types';

const { fontFamily } = loadFont();

const SLIDE_FRAMES = 90; // 3 seconds per slide at 30fps
const TRANSITION_FRAMES = 15;

const SlideCard: React.FC<{
  slide: CarouselSlide;
  accent: string;
  isFirst: boolean;
  isLast: boolean;
  company: string;
}> = ({ slide, accent, isFirst, isLast, company }) => {
  const bg = isLast ? accent : isFirst ? accent + '10' : '#fff';
  const textColor = isLast ? '#fff' : '#1d1d1f';
  const subtextColor = isLast ? 'rgba(255,255,255,0.8)' : '#6e6e73';

  return (
    <AbsoluteFill
      style={{
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 72px',
        fontFamily,
      }}
    >
      {/* Slide number */}
      <AnimatedText delay={0} style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: isLast ? 'rgba(255,255,255,0.6)' : accent,
            fontFamily: 'monospace',
          }}
        >
          {String(slide.slide).padStart(2, '0')} / {slide.type}
        </div>
      </AnimatedText>

      {/* Headline */}
      <AnimatedText delay={6}>
        <div
          style={{
            fontSize: isFirst ? 68 : 56,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.08,
            color: isFirst ? accent : textColor,
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          {slide.headline}
        </div>
      </AnimatedText>

      {/* Body */}
      <AnimatedText delay={14}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            lineHeight: 1.6,
            color: subtextColor,
            textAlign: 'center',
            maxWidth: 760,
          }}
        >
          {slide.body}
        </div>
      </AnimatedText>

      {/* CTA pill */}
      {slide.cta && (
        <AnimatedText delay={22}>
          <div
            style={{
              marginTop: 52,
              background: '#fff',
              color: accent,
              padding: '18px 48px',
              borderRadius: 980,
              fontSize: 22,
              fontWeight: 700,
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}
          >
            {slide.cta}
          </div>
        </AnimatedText>
      )}

      {/* Company watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 72,
          fontSize: 14,
          color: isLast ? 'rgba(255,255,255,0.5)' : '#aeaeb2',
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        {company}
      </div>

      {/* Progress dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          right: 72,
          display: 'flex',
          gap: 6,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slide.slide - 1 ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: isLast
                ? i === slide.slide - 1
                  ? '#fff'
                  : 'rgba(255,255,255,0.3)'
                : i === slide.slide - 1
                  ? accent
                  : '#e0e0e0',
              transition: 'width 0.3s',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const KayroCarousel: React.FC<CarouselProps> = ({
  topic,
  slides,
  accentColor,
  company,
}) => {
  const accent = accentColor || '#0071e3';

  return (
    <AbsoluteFill style={{ background: '#f5f5f7', fontFamily }}>
      {slides.map((slide, i) => {
        const start = i * SLIDE_FRAMES;
        const duration = SLIDE_FRAMES + TRANSITION_FRAMES;
        return (
          <Sequence key={slide.slide} from={start} durationInFrames={duration}>
            <SlideCard
              slide={slide}
              accent={accent}
              isFirst={i === 0}
              isLast={i === slides.length - 1}
              company={company}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
