export type Attendance = boolean | null;
export type KeyAttendance = "yes" | "no" | "maybe" | null;
export type DirectionsProvider = "google" | "waze" | "custom";
export type ImageSlotKey = "nahuel" | "fernet" | "kevin";

export interface Guest {
  id: string;
  guestNumber: number;
  fullName: string;
  attendingPeatonal: Attendance;
  attendingKey: KeyAttendance;
  hasPlusOne: boolean;
  plusOneName: string;
  comment: string;
  respondedAt: string | null;
}

export interface EventStopContent {
  title: string;
  copy: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  timeLabel: string;
  venue: string;
  address: string;
  showMap: boolean;
  directionsLabel: string;
  visible: boolean;
}

export interface EventContent {
  heroLabel: string;
  heroTitle: string;
  heroBody: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  peatonal: EventStopContent;
  key: EventStopContent;
  rsvpTitle: string;
  rsvpHelper: string;
  rsvpSubmitLabel: string;
  rsvpSuccessTitle: string;
  rsvpSuccessBody: string;
}

export interface LocationSettings {
  venue: string;
  address: string;
  latitude: string;
  longitude: string;
  showMap: boolean;
  directionsLabel: string;
  directionsProvider: DirectionsProvider;
  customDirectionsUrl: string;
}

export interface EventSettings {
  eventName: string;
  eventDate: string;
  cityLabel: string;
  timezone: string;
  peatonal: LocationSettings;
  key: LocationSettings;
  qrEnabled: boolean;
}

export interface ImageSlot {
  id: ImageSlotKey;
  title: string;
  caption: string;
  src: string;
  visible: boolean;
  aspectRatio: "portrait" | "landscape";
}

export interface CustomContentBlock {
  id: string;
  title: string;
  content: string;
  visible: boolean;
  ctaLabel: string;
  ctaUrl: string;
}

export interface EventState {
  guests: Guest[];
  content: EventContent;
  settings: EventSettings;
  images: ImageSlot[];
  customBlocks: CustomContentBlock[];
}
