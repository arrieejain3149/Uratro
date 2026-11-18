import { useEffect, useState } from 'react';
import { Radio, MapPin, CheckCircle } from 'lucide-react';

interface StationNode {
  Station_ID: number;
  Name: string;
  Type: string;
  Status: string;
  GPS_Coordinates: string;
  Sequence_Number: number;
}

interface RouteData {
  Route_ID: number;
  Route_Name: string;
  Start_Station: string;
  End_Station: string;
  stations: StationNode[];
}

export default function TopologyTab() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/stations/routes')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setRoutes(data.data);
          if (data.data[0]?.stations[0]) {
            setSelectedStation(data.data[0].stations[0]);
          }
        }
      })
      .catch(err => console.error("Error fetching routes:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-sans">
      {/* Header telemetry tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#27272A] gap-2">
        <div>
          <div className="flex items-center gap-2 text-[#C5A880] text-xs font-bold tracking-widest uppercase font-mono">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>METRO NETWORK // STATIONS &amp; ROUTES MAP</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Live interactive map of metro lines, station stops, transfer junctions, and station status.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-pink-300">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            Pink Line (East-West)
          </span>
          <span className="flex items-center gap-1.5 text-[#C5A880]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
            Blue Line (North-South)
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 text-sm">
          Loading Metro Map...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Schematic Diagram Area */}
          <div className="lg:col-span-2 bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 relative overflow-x-auto shadow-lg">
            <div className="min-w-[650px] py-8 space-y-12">
              
              {/* Pink Line Track */}
              <div>
                <div className="flex items-center justify-between text-xs text-pink-400 font-bold mb-3 tracking-wider">
                  <span>PINK LINE (EAST-WEST)</span>
                  <span>10 STATIONS // ALL OPEN</span>
                </div>
                
                {/* Track Line */}
                <div className="relative flex items-center justify-between py-6">
                  <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 shadow-[0_0_12px_rgba(236,72,153,0.5)]"></div>

                  {routes[0]?.stations.map((st) => {
                    const isSelected = selectedStation?.Station_ID === st.Station_ID;
                    return (
                      <div
                        key={st.Station_ID}
                        onClick={() => setSelectedStation(st)}
                        className="relative z-10 flex flex-col items-center group cursor-pointer"
                      >
                        {/* Node circle */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-white ring-4 ring-pink-500 scale-125' 
                            : st.Type === 'Interchange'
                            ? 'bg-amber-400 ring-2 ring-neutral-900 hover:scale-110'
                            : 'bg-black border-2 border-pink-400 hover:bg-pink-950'
                        }`}>
                          <span className={`text-[9px] font-extrabold ${isSelected ? 'text-black' : 'text-white'}`}>
                            {st.Sequence_Number}
                          </span>
                        </div>

                        {/* Station Name Label */}
                        <span className={`text-[10px] mt-2 whitespace-nowrap transition-colors ${
                          isSelected ? 'text-white font-bold' : 'text-neutral-400 group-hover:text-neutral-200'
                        }`}>
                          {st.Name}
                        </span>

                        {st.Type === 'Interchange' && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded-xs mt-0.5">
                            TRANSFER
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blue Line Track */}
              {routes[1] && (
                <div>
                  <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-3 tracking-wider">
                    <span>BLUE LINE (NORTH-SOUTH)</span>
                    <span>TRANSFER STATIONS</span>
                  </div>

                  <div className="relative flex items-center justify-around py-6 max-w-md">
                    <div className="absolute left-6 right-6 h-1.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>

                    {routes[1].stations.map((st) => {
                      const isSelected = selectedStation?.Station_ID === st.Station_ID;
                      return (
                        <div
                          key={st.Station_ID}
                          onClick={() => setSelectedStation(st)}
                          className="relative z-10 flex flex-col items-center group cursor-pointer"
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-white ring-4 ring-blue-500 scale-125' 
                              : 'bg-black border-2 border-blue-400 hover:bg-blue-950'
                          }`}>
                            <span className={`text-[9px] font-extrabold ${isSelected ? 'text-black' : 'text-white'}`}>
                              {st.Sequence_Number}
                            </span>
                          </div>
                          <span className={`text-[10px] mt-2 whitespace-nowrap ${
                            isSelected ? 'text-white font-bold' : 'text-neutral-400 group-hover:text-neutral-200'
                          }`}>
                            {st.Name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Selected Station Telemetry Card */}
          <div className="bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 flex flex-col justify-between shadow-lg">
            {selectedStation ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-[#27272A] pb-3">
                  <div>
                    <span className="text-[10px] text-[#C5A880] tracking-widest uppercase font-mono">
                      STATION DETAILS: #{selectedStation.Station_ID}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {selectedStation.Name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xs flex items-center gap-1 font-bold">
                    <CheckCircle className="w-3 h-3" />
                    {selectedStation.Status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#121214] p-3 border border-[#27272A] rounded-xs">
                    <span className="text-[9px] text-neutral-400 block uppercase">STATION TYPE</span>
                    <span className="text-neutral-200 font-semibold">{selectedStation.Type} Station</span>
                  </div>

                  <div className="bg-[#121214] p-3 border border-[#27272A] rounded-xs">
                    <span className="text-[9px] text-neutral-400 block uppercase">STOP NUMBER</span>
                    <span className="text-neutral-200 font-semibold">Stop #{selectedStation.Sequence_Number}</span>
                  </div>
                </div>

                <div className="bg-[#121214] p-3 border border-[#27272A] rounded-xs">
                  <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 uppercase mb-1">
                    <MapPin className="w-3 h-3 text-[#C5A880]" />
                    <span>Location Coordinates</span>
                  </div>
                  <span className="text-neutral-300 font-mono text-xs">
                    {selectedStation.GPS_Coordinates || '26.8500° N, 75.7600° E'}
                  </span>
                </div>

                <div className="bg-[#222226] border border-[#2E2E34] p-3.5 rounded-xs text-xs space-y-1.5">
                  <div className="flex justify-between text-neutral-400">
                    <span>Train Stop Duration:</span>
                    <span className="text-white font-bold">45 Seconds</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Entry/Exit Gates:</span>
                    <span className="text-white font-bold">8 Gates Open</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Busiest Hours:</span>
                    <span className="text-[#C5A880] font-bold">08:30 - 10:30 AM</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-neutral-400 text-xs text-center py-12">
                Click any station on the map above to view details.
              </div>
            )}

            <div className="text-[9px] text-neutral-400 pt-4 border-t border-[#27272A] text-center uppercase tracking-widest font-mono">
              URATRO // LIVE NETWORK MONITOR
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
