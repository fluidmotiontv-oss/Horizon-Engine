export interface TideData {
  heightM: number;
  meanLevelM: number;
  direction: 'flooding' | 'ebbing';
  velocityKnots: number;
  barCrossingSafe: boolean;
  locationName: string;
  nextHighAt: string;
  nextLowAt: string;
  phaseOffsetMins: number;
}

export interface D9TimeState {
  hour: string;
  minute: string;
  second: string;
  progress: number;
  label: string;
  cycleNumber: number;
}

export interface TeleprompterCue {
  id: string;
  timestamp: string;
  speaker: 'Kimi' | 'Timi' | 'Fluid Motion';
  line: string;
  actionHint?: string;
}

export type SectionId = 'hero' | 'clock' | 'tide' | 'sovereign' | 'teleprompter' | 'cta';
