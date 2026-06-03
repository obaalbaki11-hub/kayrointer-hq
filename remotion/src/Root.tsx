import { Composition } from 'remotion';
import { KayroCarousel } from './KayroCarousel';
import { KayroReel } from './KayroReel';
import { KayroBrandSpot } from './KayroBrandSpot';
import type { CarouselProps, ReelProps, BrandSpotProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComp = React.ComponentType<any>;

const CAROUSEL_DEFAULTS: CarouselProps = {
  topic: 'Why AI is the future of business',
  accentColor: '#0071e3',
  company: 'Kayro Interactive',
  slides: [
    { slide: 1, type: 'hook', headline: 'AI is eating business.', body: 'Every industry. Every function. Every team.', visual: '' },
    { slide: 2, type: 'content', headline: 'Your competitors are already using it.', body: "While you're reading this, they're automating what took days into minutes.", visual: '' },
    { slide: 3, type: 'content', headline: 'The cost of inaction?', body: 'Market share, team bandwidth, and the speed to ship what matters.', visual: '' },
    { slide: 4, type: 'content', headline: 'The tools exist. Right now.', body: 'AI employees that handle sales, marketing, ops, and more — 24/7.', visual: '' },
    { slide: 5, type: 'content', headline: 'What changes when you deploy them?', body: 'Your team focuses on strategy. AI handles execution.', visual: '' },
    { slide: 6, type: 'cta', headline: 'Ready to build your AI workforce?', body: 'Join companies already running on Kayro Interactive.', visual: '', cta: 'Get Started Free →' },
  ],
};

const REEL_DEFAULTS: ReelProps = {
  topic: 'AI Workforce for Modern Teams',
  accentColor: '#0071e3',
  company: 'Kayro Interactive',
  scenes: [
    { scene: 1, timestamp: '0:00', onscreen: 'What if your team never slept?', voiceover: 'Imagine a workforce that works 24 hours a day, 7 days a week, without burnout.', visual: 'Clock spinning rapidly' },
    { scene: 2, timestamp: '0:05', onscreen: 'AI Employees. Real Results.', voiceover: 'AI that handles sales outreach, marketing content, and customer support — all at once.', visual: 'Dashboard with metrics' },
    { scene: 3, timestamp: '0:10', onscreen: '10x your output.', voiceover: 'Teams using Kayro ship 10x more in the same hours. No extra headcount needed.', visual: 'Growth chart' },
    { scene: 4, timestamp: '0:15', onscreen: 'Set it. Run it. Scale it.', voiceover: 'Deploy specialized AI agents in minutes. Watch them work while you focus on strategy.', visual: 'Agent grid' },
    { scene: 5, timestamp: '0:20', onscreen: 'Every role. Covered.', voiceover: 'From legal to marketing to investor relations — Kayro has a specialist for every function.', visual: 'Role icons' },
    { scene: 6, timestamp: '0:25', onscreen: 'Start your AI workforce today.', voiceover: 'Join the future of work. Your competitors already have.', visual: '' },
  ],
};

const BRAND_SPOT_DEFAULTS: BrandSpotProps = {
  company: 'Kayro Interactive',
  tagline: 'Your AI Workforce, On Demand.',
  accentColor: '#0071e3',
  cta: 'The future of work is here.',
  url: 'kayrointer.com',
  stats: [
    { num: '10x', label: 'Faster Execution' },
    { num: '24/7', label: 'Always On' },
    { num: '50+', label: 'AI Roles' },
  ],
  features: [
    { icon: '🤖', name: 'AI Employees', desc: 'Specialized AI agents for every business function — from sales to legal to marketing.' },
    { icon: '⚡', name: 'Instant Deploy', desc: 'Set up your AI workforce in minutes. No training, no onboarding, no waiting.' },
    { icon: '🧠', name: 'Company Brain', desc: 'A persistent memory layer that keeps your AI team aligned with your brand and goals.' },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KayroCarousel"
        component={KayroCarousel as AnyComp}
        durationInFrames={555}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={CAROUSEL_DEFAULTS}
      />

      <Composition
        id="KayroReel"
        component={KayroReel as AnyComp}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={REEL_DEFAULTS}
      />

      <Composition
        id="KayroBrandSpot"
        component={KayroBrandSpot as AnyComp}
        durationInFrames={990}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={BRAND_SPOT_DEFAULTS}
      />
    </>
  );
};
