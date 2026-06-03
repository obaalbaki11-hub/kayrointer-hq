export interface CarouselSlide {
  slide: number;
  type: string;
  headline: string;
  body: string;
  visual: string;
  cta?: string;
}

export interface ReelScene {
  scene: number;
  timestamp: string;
  onscreen: string;
  voiceover: string;
  visual: string;
}

export interface CarouselProps {
  topic: string;
  slides: CarouselSlide[];
  accentColor: string;
  company: string;
}

export interface ReelProps {
  topic: string;
  scenes: ReelScene[];
  accentColor: string;
  company: string;
}

export interface BrandSpotProps {
  company: string;
  tagline: string;
  accentColor: string;
  stats: { num: string; label: string }[];
  features: { icon: string; name: string; desc: string }[];
  cta: string;
  url: string;
}
