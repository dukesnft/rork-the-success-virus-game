export interface DailyManifestation {
  id: string;
  text: string;
  category: string;
  date: string;
  used: boolean;
}

export interface DailyManifestationState {
  manifestations: DailyManifestation[];
  lastGeneratedDate: string;
  extraSlots: number;
}

export type WeeklyManifestation = DailyManifestation;
export type WeeklyManifestationState = DailyManifestationState;
