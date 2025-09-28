// Export components
export { ImageUpload } from "./image-upload";
export { ClassificationResult } from "./classification-result";
export { FacilityMap } from "./facility-map";
export { LocationCard } from "./location-card";
export { EducationCard } from "./education-card";

// Export types
export interface ClassificationResultData {
  category: string;
  confidence: number;
  description?: string;
}

export interface FacilityLocation {
  id: string;
  name: string;
  type: "recycling" | "composting" | "hazardous" | "general";
  address: string;
  distance: number;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
