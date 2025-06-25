declare global {
  interface Window {
    addDest: (latlng: [number, number]) => void;
    delDest: (index: number) => void;
    delClick: (lat: number, lon: number) => void;
  }
}