export const US_EASTERN_TZ = 'America/New_York';

export const getEasternTime = (): Date => {
  const now = new Date();
  const easternTimeString = now.toLocaleString('en-US', { timeZone: US_EASTERN_TZ });
  return new Date(easternTimeString);
};

export const getLocalTime = (): Date => {
  return new Date();
};

export const getEasternDateString = (): string => {
  const easternDate = getEasternTime();
  return easternDate.toISOString().split('T')[0];
};

export const getLocalDateString = (): string => {
  const localDate = getLocalTime();
  return localDate.toISOString().split('T')[0];
};

export const getEasternDay = (): number => {
  return getEasternTime().getDay();
};

export const getLocalDay = (): number => {
  return getLocalTime().getDay();
};

export const getEasternHour = (): number => {
  return getEasternTime().getHours();
};

export const getLocalHour = (): number => {
  return getLocalTime().getHours();
};

export const getEasternMinute = (): number => {
  return getEasternTime().getMinutes();
};

export const getLocalMinute = (): number => {
  return getLocalTime().getMinutes();
};

export const formatEasternDate = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    timeZone: US_EASTERN_TZ,
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatLocalDate = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatEasternTime = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { 
    timeZone: US_EASTERN_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatLocalTime = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatLocalDateTime = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const isMonday = (): boolean => {
  return getEasternDay() === 1;
};

export const getStartOfWeek = (): string => {
  const easternDate = getEasternTime();
  const day = easternDate.getDay();
  const diff = easternDate.getDate() - day + (day === 0 ? -6 : 1);
  easternDate.setDate(diff);
  return easternDate.toISOString().split('T')[0];
};
