import * as h3 from 'h3-js';

export interface StationData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'Terminal' | 'Interchange' | 'Normal';
  status: 'Operational' | 'Maintenance' | 'Closed';
  lines: ('Pink' | 'Blue')[];
  sequence: number;
  h3Index: string;
  congestionTier?: 'Normal Flow' | 'Moderate Transit' | 'Severe Congestion';
  hourlyEntries?: number;
}

export const METRO_STATIONS_DATA: StationData[] = [
  {
    id: 1,
    name: 'Mansarovar',
    lat: 26.8500,
    lng: 75.7600,
    type: 'Terminal',
    status: 'Operational',
    lines: ['Pink'],
    sequence: 1,
    h3Index: h3.latLngToCell(26.8500, 75.7600, 8),
  },
  {
    id: 2,
    name: 'New Atish Market',
    lat: 26.8620,
    lng: 75.7680,
    type: 'Normal',
    status: 'Operational',
    lines: ['Pink'],
    sequence: 2,
    h3Index: h3.latLngToCell(26.8620, 75.7680, 8),
  },
  {
    id: 3,
    name: 'Vivek Vihar',
    lat: 26.8750,
    lng: 75.7720,
    type: 'Normal',
    status: 'Operational',
    lines: ['Pink'],
    sequence: 3,
    h3Index: h3.latLngToCell(26.8750, 75.7720, 8),
  },
  {
    id: 4,
    name: 'Shyam Nagar',
    lat: 26.8900,
    lng: 75.7750,
    type: 'Normal',
    status: 'Operational',
    lines: ['Pink'],
    sequence: 4,
    h3Index: h3.latLngToCell(26.8900, 75.7750, 8),
  },
  {
    id: 5,
    name: 'Civil Lines',
    lat: 26.9050,
    lng: 75.7800,
    type: 'Normal',
    status: 'Operational',
    lines: ['Pink'],
    sequence: 5,
    h3Index: h3.latLngToCell(26.9050, 75.7800, 8),
  },
  {
    id: 6,
    name: 'Railway Station',
    lat: 26.9200,
    lng: 75.7870,
    type: 'Interchange',
    status: 'Operational',
    lines: ['Pink', 'Blue'],
    sequence: 6,
    h3Index: h3.latLngToCell(26.9200, 75.7870, 8),
  },
  {
    id: 7,
    name: 'Sindhi Camp',
    lat: 26.9240,
    lng: 75.7950,
    type: 'Interchange',
    status: 'Operational',
    lines: ['Pink', 'Blue'],
    sequence: 7,
    h3Index: h3.latLngToCell(26.9240, 75.7950, 8),
  },
  {
    id: 8,
    name: 'Chandpole',
    lat: 26.9270,
    lng: 75.8100,
    type: 'Interchange',
    status: 'Operational',
    lines: ['Pink', 'Blue'],
    sequence: 8,
    h3Index: h3.latLngToCell(26.9270, 75.8100, 8),
  },
  {
    id: 9,
    name: 'Chhoti Chaupar',
    lat: 26.9250,
    lng: 75.8220,
    type: 'Normal',
    status: 'Operational',
    lines: ['Pink'],
    sequence: 9,
    h3Index: h3.latLngToCell(26.9250, 75.8220, 8),
  },
  {
    id: 10,
    name: 'Badi Chaupar',
    lat: 26.9230,
    lng: 75.8300,
    type: 'Terminal',
    status: 'Operational',
    lines: ['Pink'],
    sequence: 10,
    h3Index: h3.latLngToCell(26.9230, 75.8300, 8),
  },
];

// Jaipur Metro geographic boundaries with padding
const BOUNDS = {
  minLat: 26.835,
  maxLat: 26.940,
  minLng: 75.740,
  maxLng: 75.845,
};

/**
 * Projects a [lat, lng] into SVG canvas coordinates (x, y)
 */
export function projectCoordinates(
  lat: number,
  lng: number,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 70
): { x: number; y: number } {
  const innerW = canvasWidth - padding * 2;
  const innerH = canvasHeight - padding * 2;

  // Lng -> X (West to East)
  const normX = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);
  // Lat -> Y (North is top, so higher latitude gives smaller y)
  const normY = 1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat);

  return {
    x: padding + normX * innerW,
    y: padding + normY * innerH,
  };
}

/**
 * Computes SVG polygon points for an H3 cell at resolution 8
 */
export function getH3CellPolygonPoints(
  h3Index: string,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 70
): string {
  try {
    const boundary = h3.cellToBoundary(h3Index);
    return boundary
      .map(([lat, lng]) => {
        const pt = projectCoordinates(lat, lng, canvasWidth, canvasHeight, padding);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');
  } catch (err) {
    return '';
  }
}

/**
 * Generates all ambient honeycomb H3 cells around the corridor
 */
export function getAmbientCorridorCells(): string[] {
  const cellSet = new Set<string>();

  METRO_STATIONS_DATA.forEach((st) => {
    try {
      const disk = h3.gridDisk(st.h3Index, 2);
      disk.forEach((c) => cellSet.add(c));
    } catch (e) {
      cellSet.add(st.h3Index);
    }
  });

  return Array.from(cellSet);
}

/**
 * Interpolates point along a polyline given parametric t (0 to 1)
 */
export function getPointOnPath(points: { x: number; y: number }[], t: number): { x: number; y: number; angle: number } {
  if (points.length < 2) return { x: points[0]?.x || 0, y: points[0]?.y || 0, angle: 0 };

  // Calculate segment lengths
  const lengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.hypot(dx, dy);
    lengths.push(len);
    totalLength += len;
  }

  const targetDist = Math.max(0, Math.min(1, t)) * totalLength;
  let accumulated = 0;

  for (let i = 0; i < lengths.length; i++) {
    if (accumulated + lengths[i] >= targetDist || i === lengths.length - 1) {
      const segT = lengths[i] === 0 ? 0 : (targetDist - accumulated) / lengths[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const x = p1.x + (p2.x - p1.x) * segT;
      const y = p1.y + (p2.y - p1.y) * segT;
      const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
      return { x, y, angle };
    }
    accumulated += lengths[i];
  }

  const last = points[points.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
}
