import { useEffect, useState, useMemo, useRef } from 'react';
import { Layers, ZoomIn, ZoomOut, RotateCcw, MapPin, Users, Train, ArrowRight, ShieldCheck, Zap, Navigation } from 'lucide-react';
import { METRO_STATIONS_DATA, projectCoordinates, getH3CellPolygonPoints, getAmbientCorridorCells, getPointOnPath, type StationData } from '../../utils/h3MapUtils';

interface TopologyTabProps {
  onNavigateToSimulator?: () => void;
}

export default function TopologyTab({ onNavigateToSimulator }: TopologyTabProps) {
  const [stations, setStations] = useState<StationData[]>(METRO_STATIONS_DATA);
  const [selectedStation, setSelectedStation] = useState<StationData>(METRO_STATIONS_DATA[6]); // Sindhi Camp default
  const [selectedLineFilter, setSelectedLineFilter] = useState<'All' | 'Pink' | 'Blue'>('All');
  
  // Layer Toggles
  const [showHexMesh, setShowHexMesh] = useState<boolean>(true);
  const [showCongestionHeat, setShowCongestionHeat] = useState<boolean>(true);
  const [showAnimatedTrains, setShowAnimatedTrains] = useState<boolean>(true);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Train animation timer (t goes from 0 to 1)
  const [trainProgressPink, setTrainProgressPink] = useState<number>(0.35);
  const [trainProgressBlue, setTrainProgressBlue] = useState<number>(0.65);

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 600;

  // Fetch live congestion data from backend
  useEffect(() => {
    fetch('/api/v1/analytics/congestion-heatmap')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setStations((prev) =>
            prev.map((st) => {
              const match = data.data.find(
                (d: any) =>
                  d.Station_ID === st.id ||
                  d.Station_Name?.toLowerCase() === st.name.toLowerCase()
              );
              if (match) {
                return {
                  ...st,
                  congestionTier: match.Congestion_Tier || 'Normal Flow',
                  hourlyEntries: match.Entries_Count || 12,
                };
              }
              return st;
            })
          );
        }
      })
      .catch((err) => console.error('Error fetching congestion data:', err));
  }, []);

  // Train animation loop
  useEffect(() => {
    if (!showAnimatedTrains) return;
    const interval = setInterval(() => {
      setTrainProgressPink((p) => (p + 0.003) % 1);
      setTrainProgressBlue((p) => (p + 0.005) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, [showAnimatedTrains]);

  // Ambient corridor H3 cells
  const ambientH3Cells = useMemo(() => getAmbientCorridorCells(), []);

  // Projected station screen points
  const stationProjectedPoints = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    stations.forEach((st) => {
      map.set(st.id, projectCoordinates(st.lat, st.lng, CANVAS_WIDTH, CANVAS_HEIGHT, 80));
    });
    return map;
  }, [stations]);

  // Pink Line ordered points (Station 1 to 10)
  const pinkLinePoints = useMemo(() => {
    return stations
      .filter((s) => s.lines.includes('Pink'))
      .sort((a, b) => a.sequence - b.sequence)
      .map((s) => stationProjectedPoints.get(s.id)!)
      .filter(Boolean);
  }, [stations, stationProjectedPoints]);

  // Blue Line ordered points (Railway Station, Sindhi Camp, Chandpole)
  const blueLinePoints = useMemo(() => {
    const blueIds = [6, 7, 8];
    return blueIds
      .map((id) => stationProjectedPoints.get(id)!)
      .filter(Boolean);
  }, [stationProjectedPoints]);

  // Animated train positions
  const pinkTrainPos = useMemo(() => {
    return getPointOnPath(pinkLinePoints, trainProgressPink);
  }, [pinkLinePoints, trainProgressPink]);

  const blueTrainPos = useMemo(() => {
    return getPointOnPath(blueLinePoints, trainProgressBlue);
  }, [blueLinePoints, trainProgressBlue]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // SVG path generator for smooth lines
  const pinkLineSvgPath = useMemo(() => {
    if (pinkLinePoints.length < 2) return '';
    return pinkLinePoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [pinkLinePoints]);

  const blueLineSvgPath = useMemo(() => {
    if (blueLinePoints.length < 2) return '';
    return blueLinePoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [blueLinePoints]);

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-sans text-white select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#27272A] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            2D Metro Network &amp; Route Topology
          </h1>
        </div>

        {/* Corridor Filters & Layer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Corridor Selection Chips */}
          <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] p-1 rounded-sm">
            {(['All', 'Pink', 'Blue'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedLineFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                  selectedLineFilter === filter
                    ? 'bg-[#27272A] text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {filter === 'All' ? 'All Corridors' : `${filter} Line`}
              </button>
            ))}
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] p-1 rounded-sm text-xs font-mono">
            <button
              onClick={() => setShowHexMesh(!showHexMesh)}
              className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                showHexMesh ? 'bg-[#27272A] text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Toggle Uber H3 Ambient Honeycomb Grid"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>H3 Mesh</span>
            </button>

            <button
              onClick={() => setShowCongestionHeat(!showCongestionHeat)}
              className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                showCongestionHeat ? 'bg-[#27272A] text-[#C5A880]' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Toggle Live Congestion Heat Glow"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Heat</span>
            </button>

            <button
              onClick={() => setShowAnimatedTrains(!showAnimatedTrains)}
              className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                showAnimatedTrains ? 'bg-[#27272A] text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Toggle Live Animated Train Positions"
            >
              <Train className="w-3.5 h-3.5" />
              <span>Rakes</span>
            </button>
          </div>

          {/* Zoom / Pan Controls */}
          <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] p-1 rounded-sm">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#202024] rounded-xs cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-neutral-400 px-1 min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#202024] rounded-xs cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#202024] rounded-xs cursor-pointer transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Geospatial H3 Canvas */}
        <div
          className="lg:col-span-8 bg-[#18181B] border border-[#27272A] rounded-sm p-4 relative overflow-hidden shadow-2xl min-h-[580px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Compass & Scale Hud Overlay */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 font-mono text-[10px] text-neutral-400 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-[#141416]/90 border border-[#27272A] px-2.5 py-1 rounded">
              <Navigation className="w-3 h-3 text-[#C5A880] -rotate-45" />
              <span>JAIPUR METRO &bull; 26.9124° N, 75.7873° E</span>
            </div>
            <div className="bg-[#141416]/90 border border-[#27272A] px-2.5 py-1 rounded flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> Pink Line
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span> Blue Line
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Transfer Hub
              </span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="w-full h-full max-h-[620px] transition-transform duration-75 select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <defs>
              {/* Pink Line Neon Glow */}
              <filter id="pinkGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Blue Line Neon Glow */}
              <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* LAYER 1: AMBIENT UBER H3 HONEYCOMB GRID */}
            {showHexMesh && (
              <g className="opacity-40">
                {ambientH3Cells.map((h3Idx) => {
                  const pts = getH3CellPolygonPoints(h3Idx, CANVAS_WIDTH, CANVAS_HEIGHT, 80);
                  if (!pts) return null;
                  return (
                    <polygon
                      key={h3Idx}
                      points={pts}
                      fill="none"
                      stroke="#27272A"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                    />
                  );
                })}
              </g>
            )}

            {/* LAYER 2: STATION CATCHMENT H3 HEXAGONS (HEAT MAP) */}
            {showCongestionHeat && (
              <g>
                {stations.map((st) => {
                  const pts = getH3CellPolygonPoints(st.h3Index, CANVAS_WIDTH, CANVAS_HEIGHT, 80);
                  if (!pts) return null;

                  const isSelected = selectedStation?.id === st.id;
                  let fillColor = 'rgba(24, 24, 27, 0.4)';
                  let strokeColor = '#27272A';

                  if (st.congestionTier === 'Severe Congestion') {
                    fillColor = 'rgba(244, 63, 94, 0.25)';
                    strokeColor = '#F43F5E';
                  } else if (st.congestionTier === 'Moderate Transit') {
                    fillColor = 'rgba(197, 168, 128, 0.25)';
                    strokeColor = '#C5A880';
                  } else {
                    fillColor = 'rgba(16, 185, 129, 0.12)';
                    strokeColor = '#10B981';
                  }

                  return (
                    <polygon
                      key={`station-hex-${st.id}`}
                      points={pts}
                      fill={fillColor}
                      stroke={isSelected ? '#FFFFFF' : strokeColor}
                      strokeWidth={isSelected ? 2 : 1.2}
                      className="transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedStation(st)}
                    />
                  );
                })}
              </g>
            )}

            {/* LAYER 3: 2D TRANSIT TRACKS */}
            {/* Pink Line Corridor Track */}
            {(selectedLineFilter === 'All' || selectedLineFilter === 'Pink') && (
              <g>
                {/* Glow Shadow Track */}
                <path
                  d={pinkLineSvgPath}
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="8"
                  opacity="0.3"
                  filter="url(#pinkGlow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Solid Core Track */}
                <path
                  d={pinkLineSvgPath}
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* Blue Line Corridor Track */}
            {(selectedLineFilter === 'All' || selectedLineFilter === 'Blue') && (
              <g>
                {/* Glow Shadow Track */}
                <path
                  d={blueLineSvgPath}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="8"
                  opacity="0.3"
                  filter="url(#blueGlow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Solid Core Track */}
                <path
                  d={blueLineSvgPath}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* LAYER 4: ANIMATED LIVE TRAIN RAKES */}
            {showAnimatedTrains && (
              <g>
                {/* Pink Line Train Rake */}
                {(selectedLineFilter === 'All' || selectedLineFilter === 'Pink') && (
                  <g
                    transform={`translate(${pinkTrainPos.x}, ${pinkTrainPos.y}) rotate(${pinkTrainPos.angle})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x="-14"
                      y="-5"
                      width="28"
                      height="10"
                      rx="3"
                      fill="#FFFFFF"
                      stroke="#EC4899"
                      strokeWidth="2"
                      className="shadow-lg"
                    />
                    <circle cx="10" cy="0" r="2" fill="#EC4899" />
                  </g>
                )}

                {/* Blue Line Train Rake */}
                {(selectedLineFilter === 'All' || selectedLineFilter === 'Blue') && (
                  <g
                    transform={`translate(${blueTrainPos.x}, ${blueTrainPos.y}) rotate(${blueTrainPos.angle})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x="-14"
                      y="-5"
                      width="28"
                      height="10"
                      rx="3"
                      fill="#FFFFFF"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      className="shadow-lg"
                    />
                    <circle cx="10" cy="0" r="2" fill="#38BDF8" />
                  </g>
                )}
              </g>
            )}

            {/* LAYER 5: INTERACTIVE STATION NODES & LABELS */}
            {stations.map((st) => {
              const pt = stationProjectedPoints.get(st.id);
              if (!pt) return null;

              const isSelected = selectedStation?.id === st.id;
              const isInterchange = st.type === 'Interchange';
              const isTerminal = st.type === 'Terminal';

              return (
                <g
                  key={st.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedStation(st)}
                >
                  {/* Concentric Pulse for Selected / Interchange */}
                  {isSelected && (
                    <circle
                      r="16"
                      fill="none"
                      stroke="#C5A880"
                      strokeWidth="1.5"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {isTerminal && (
                    <rect
                      x="-10"
                      y="-10"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.6"
                    />
                  )}

                  {isInterchange && (
                    <circle
                      r="12"
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={isSelected ? 9 : isInterchange ? 8 : 6}
                    fill={isSelected ? '#FFFFFF' : isInterchange ? '#FBBF24' : '#18181B'}
                    stroke={isSelected ? '#C5A880' : isInterchange ? '#18181B' : '#FFFFFF'}
                    strokeWidth="2.5"
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* Station Label */}
                  <g transform="translate(0, 18)">
                    <rect
                      x="-45"
                      y="-8"
                      width="90"
                      height="16"
                      rx="2"
                      fill="#141416"
                      opacity="0.85"
                    />
                    <text
                      textAnchor="middle"
                      y="4"
                      fill={isSelected ? '#FFFFFF' : '#D4D4D8'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="select-none tracking-tight"
                    >
                      {st.name}
                    </text>
                  </g>

                  {/* Transfer Tag if Interchange */}
                  {isInterchange && (
                    <g transform="translate(0, 32)">
                      <rect
                        x="-24"
                        y="-6"
                        width="48"
                        height="12"
                        rx="2"
                        fill="#F59E0B"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        fill="#000000"
                        fontSize="7"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        TRANSFER
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Station Telemetry & Live Inspector */}
        <div className="lg:col-span-4 bg-[#18181B] border border-[#27272A] rounded-sm p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Selected Station Title */}
            <div className="space-y-2 pb-4 border-b border-[#27272A]">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 rounded-xs">
                  STATION TELEMETRY
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  ID: #{selectedStation.id}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C5A880]" />
                {selectedStation.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2 py-0.5 text-[10px] font-mono bg-neutral-800 text-neutral-300 rounded-xs">
                  {selectedStation.type} Station
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {selectedStation.status}
                </span>
              </div>
            </div>

            {/* Geospatial & H3 Indices */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] tracking-wider text-neutral-400 uppercase">
                // GEOSPATIAL &amp; H3 SPATIAL INDEX
              </span>
              <div className="p-3 bg-[#141416] border border-[#27272A] rounded-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">GPS Latitude:</span>
                  <span className="text-neutral-200">{selectedStation.lat.toFixed(4)}° N</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">GPS Longitude:</span>
                  <span className="text-neutral-200">{selectedStation.lng.toFixed(4)}° E</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#222226]">
                  <span className="text-neutral-400">H3 Cell (Res 8):</span>
                  <span className="text-[#C5A880] font-bold">{selectedStation.h3Index}</span>
                </div>
              </div>
            </div>

            {/* Live Passenger Congestion Matrix */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] tracking-wider text-neutral-400 uppercase">
                // PASSENGER RUSH &amp; CONGESTION MATRIX
              </span>
              <div className="p-3 bg-[#141416] border border-[#27272A] rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Current Flow:</span>
                  <span
                    className={`font-bold ${
                      selectedStation.congestionTier === 'Severe Congestion'
                        ? 'text-rose-400'
                        : selectedStation.congestionTier === 'Moderate Transit'
                        ? 'text-[#C5A880]'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedStation.congestionTier || 'Normal Flow'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Estimated Flow:</span>
                  <span className="text-neutral-200">
                    {selectedStation.hourlyEntries || 18} Commuters / hr
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Train Departures */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] tracking-wider text-neutral-400 uppercase">
                // UPCOMING TRAIN DEPARTURES
              </span>
              <div className="p-3 bg-[#141416] border border-[#27272A] rounded-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    <span className="text-neutral-200">Rake #01 (Pink Line)</span>
                  </div>
                  <span className="text-emerald-400 font-bold">In 2 mins</span>
                </div>
                {selectedStation.lines.includes('Blue') && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#222226]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
                      <span className="text-neutral-200">Rake #03 (Blue Line)</span>
                    </div>
                    <span className="text-[#C5A880] font-bold">At Platform</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Trigger */}
          <div className="pt-4 border-t border-[#27272A]">
            <button
              onClick={onNavigateToSimulator}
              className="w-full py-2.5 px-4 bg-[#C5A880] hover:bg-[#d6bc96] text-black font-semibold text-xs tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Turnstile Entry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
