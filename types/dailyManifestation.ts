export interface WeeklyManifestation {
  id: string;
  text: string;
  category: string;
  weekStart: string;
  used: boolean;
}

export interface WeeklyManifestationState {
  manifestations: WeeklyManifestation[];
  lastGeneratedWeek: string;
  extraSlots: number;
}

export type DailyManifestation = WeeklyManifestation;
export type DailyManifestationState = WeeklyManifestationState;
