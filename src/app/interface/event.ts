export interface MusicEvent {
  id: number;
  lat: number;
  lng: number;
  title: string;
  address: string;
  description: string;
  tags: string;
  locationType: string;
  extraInfo: string;
  hasAccessibility: boolean;
  createdBy: string;
  image?: string;
  date?: string; 
  isFavorite?: boolean;

}
