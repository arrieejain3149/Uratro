import { useState, useEffect } from 'react';
import { Database, Key, Link2, Zap, Search, ArrowRight, ShieldCheck, Eye, ZoomIn, ZoomOut, RotateCcw, Download, X, Maximize2 } from 'lucide-react';

interface TableDef {
  name: string;
  category: 'ticketing' | 'infra' | 'fleet' | 'safety' | 'views';
  description: string;
  pk: string[];
  columns: {
    name: string;
    type: string;
    key?: 'PK' | 'FK' | 'PK/FK';
    nullable: boolean;
    default?: string;
    fkRef?: string;
    desc?: string;
  }[];
  relationships?: {
    type: '1:N' | 'M:N' | 'N:1';
    target: string;
    foreignKey: string;
    notes?: string;
  }[];
}

const MASTER_SCHEMA: TableDef[] = [
  // 1. Commuters & Ticketing
  {
    name: 'Passenger',
    category: 'ticketing',
    description: 'Registered commuters holding RFID transit smart cards or travel tokens with real-time balance tracking.',
    pk: ['Passenger_ID'],
    columns: [
      { name: 'Passenger_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Auto-increment primary identifier' },
      { name: 'Name', type: 'VARCHAR(100)', nullable: false, desc: 'Full commuter legal name' },
      { name: 'Contact', type: 'VARCHAR(20)', nullable: false, desc: 'Primary phone/contact record' },
      { name: 'Card_Balance', type: 'DECIMAL(10,2)', nullable: false, default: '0.00', desc: 'Prepaid wallet credit (₹)' },
    ],
    relationships: [
      { type: '1:N', target: 'Ticket', foreignKey: 'Passenger_ID', notes: 'Passenger opens transit ticket journeys' }
    ]
  },
  {
    name: 'Ticket',
    category: 'ticketing',
    description: 'Atomic transit journey ledger logging entry/exit turnstile timestamps, fares, and station hops.',
    pk: ['Ticket_ID'],
    columns: [
      { name: 'Ticket_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Unique transaction token' },
      { name: 'Passenger_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Passenger(Passenger_ID)', desc: 'Commuter reference' },
      { name: 'Entry_Station_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Station(Station_ID)', desc: 'Tap-in station' },
      { name: 'Exit_Station_ID', type: 'INT', key: 'FK', nullable: true, fkRef: 'Station(Station_ID)', desc: 'Tap-out station' },
      { name: 'Entry_Time', type: 'DATETIME', nullable: false, desc: 'Turnstile check-in timestamp' },
      { name: 'Exit_Time', type: 'DATETIME', nullable: true, desc: 'Turnstile check-out timestamp' },
      { name: 'Fare', type: 'DECIMAL(8,2)', nullable: false, default: '0.00', desc: 'Deducted transit fare (₹)' },
      { name: 'Payment_Method', type: 'VARCHAR(50)', nullable: false, default: "'Smart Card'", desc: 'Smart Card / QR Token / UPI' },
    ],
    relationships: [
      { type: 'N:1', target: 'Passenger', foreignKey: 'Passenger_ID' },
      { type: 'N:1', target: 'Station', foreignKey: 'Entry_Station_ID' },
      { type: 'N:1', target: 'Station', foreignKey: 'Exit_Station_ID' }
    ]
  },

  // 2. Transit Infrastructure
  {
    name: 'Station',
    category: 'infra',
    description: 'Physical passenger stations across Jaipur Metro corridors with GPS geo-coordinates and statuses.',
    pk: ['Station_ID'],
    columns: [
      { name: 'Station_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Primary station identifier' },
      { name: 'Name', type: 'VARCHAR(100)', nullable: false, desc: 'Unique station name' },
      { name: 'Type', type: 'VARCHAR(50)', nullable: false, desc: 'Elevated / Underground / Interchange' },
      { name: 'Status', type: 'VARCHAR(50)', nullable: false, default: "'Operational'", desc: 'Operational / Maintenance / Closed' },
      { name: 'GPS_Coordinates', type: 'VARCHAR(100)', nullable: true, desc: 'Latitude, Longitude geo-point' },
    ],
    relationships: [
      { type: '1:N', target: 'Route_Station_Mapping', foreignKey: 'Station_ID', notes: 'Sequenced along transit corridors' },
      { type: '1:N', target: 'Ticket', foreignKey: 'Station_ID', notes: 'Origin and destination points' },
      { type: '1:N', target: 'Security_Incident', foreignKey: 'Station_ID', notes: 'Station-level security log' }
    ]
  },
  {
    name: 'Route',
    category: 'infra',
    description: 'Corridor paths defining the sequence of stations, termini, and operating zones.',
    pk: ['Route_ID'],
    columns: [
      { name: 'Route_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Route identifier' },
      { name: 'Route_Name', type: 'VARCHAR(100)', nullable: false, desc: 'e.g. Pink Line / Blue Line' },
      { name: 'Start_Station_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Station(Station_ID)', desc: 'Origin terminal station' },
      { name: 'End_Station_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Station(Station_ID)', desc: 'Destination terminal station' },
    ],
    relationships: [
      { type: '1:N', target: 'Route_Station_Mapping', foreignKey: 'Route_ID', notes: 'Ordered station sequence' },
      { type: '1:N', target: 'Track', foreignKey: 'Route_ID', notes: 'Physical track segments' },
      { type: '1:N', target: 'Daily_Train_Schedule', foreignKey: 'Route_ID', notes: 'Assigned train schedules' }
    ]
  },
  {
    name: 'Route_Station_Mapping',
    category: 'infra',
    description: 'Junction table establishing ordered M:N relationships between routes and their sequential stations.',
    pk: ['Route_ID', 'Station_ID'],
    columns: [
      { name: 'Route_ID', type: 'INT', key: 'PK/FK', nullable: false, fkRef: 'Route(Route_ID)', desc: 'Corridor reference' },
      { name: 'Station_ID', type: 'INT', key: 'PK/FK', nullable: false, fkRef: 'Station(Station_ID)', desc: 'Station reference' },
      { name: 'Sequence_Number', type: 'INT', nullable: false, desc: '1, 2, 3... station order along line' },
    ],
    relationships: [
      { type: 'N:1', target: 'Route', foreignKey: 'Route_ID' },
      { type: 'N:1', target: 'Station', foreignKey: 'Station_ID' }
    ]
  },
  {
    name: 'Track',
    category: 'infra',
    description: 'Physical railway track segments, lengths, power distribution rails, and wear conditions.',
    pk: ['Track_ID'],
    columns: [
      { name: 'Track_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Track segment identifier' },
      { name: 'Route_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Route(Route_ID)', desc: 'Parent corridor line' },
      { name: 'Length', type: 'DECIMAL(8,2)', nullable: false, desc: 'Track segment distance (km)' },
      { name: 'Condition_Status', type: 'VARCHAR(50)', nullable: false, default: "'Good'", desc: 'Good / Fair / Compromised / Closed' },
    ],
    relationships: [
      { type: 'N:1', target: 'Route', foreignKey: 'Route_ID' },
      { type: '1:N', target: 'Emergency_Incident', foreignKey: 'Track_ID', notes: 'Track degradation incidents' }
    ]
  },

  // 3. Rolling Stock & Maintenance
  {
    name: 'Metro',
    category: 'fleet',
    description: 'Rolling stock passenger trainsets, passenger load limits, commissioning dates, and operational readiness.',
    pk: ['Metro_ID'],
    columns: [
      { name: 'Metro_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Train rake identifier' },
      { name: 'Model', type: 'VARCHAR(50)', nullable: false, desc: 'e.g. Alstom Metropolis / BEML 4-Car' },
      { name: 'Capacity', type: 'INT', nullable: false, desc: 'Maximum passenger crush load' },
      { name: 'Mfg_Date', type: 'DATE', nullable: true, desc: 'Manufacturing & delivery date' },
      { name: 'Current_Status', type: 'VARCHAR(50)', nullable: false, default: "'Active'", desc: 'Active / Maintenance / Suspended' },
    ],
    relationships: [
      { type: '1:N', target: 'Daily_Train_Schedule', foreignKey: 'Metro_ID', notes: 'Scheduled passenger runs' },
      { type: '1:N', target: 'Emergency_Incident', foreignKey: 'Metro_ID', notes: 'Mechanical & power failures' },
      { type: '1:N', target: 'Maintenance_Job', foreignKey: 'Metro_ID', notes: 'Depot overhaul and repairs' }
    ]
  },
  {
    name: 'Employee',
    category: 'fleet',
    description: 'Certified transit personnel including train pilots, maintenance engineers, and station controllers.',
    pk: ['Emp_ID'],
    columns: [
      { name: 'Emp_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Staff employee ID' },
      { name: 'Name', type: 'VARCHAR(100)', nullable: false, desc: 'Full employee name' },
      { name: 'Role', type: 'VARCHAR(50)', nullable: false, desc: 'Driver / Maintenance Engineer / Station Master / Security' },
      { name: 'Shift', type: 'VARCHAR(20)', nullable: false, desc: 'Morning / Evening / Night' },
    ],
    relationships: [
      { type: '1:N', target: 'Daily_Train_Schedule', foreignKey: 'Driver_Emp_ID', notes: 'Train driving assignments' },
      { type: '1:N', target: 'Maintenance_Engineer_Job', foreignKey: 'Engineer_Emp_ID', notes: 'Assigned engineering work' },
      { type: '1:N', target: 'Emergency_Incident', foreignKey: 'Reporter_Emp_ID', notes: 'First responder incident reports' }
    ]
  },
  {
    name: 'Daily_Train_Schedule',
    category: 'fleet',
    description: 'Dispatch roster pairing trainsets with routes, certified drivers, and operational shifts.',
    pk: ['Schedule_ID'],
    columns: [
      { name: 'Schedule_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Schedule entry token' },
      { name: 'Metro_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Metro(Metro_ID)', desc: 'Dispatched trainset' },
      { name: 'Route_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Route(Route_ID)', desc: 'Assigned corridor' },
      { name: 'Driver_Emp_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Employee(Emp_ID)', desc: 'Pilot in command' },
      { name: 'Date', type: 'DATE', nullable: false, desc: 'Scheduled operational date' },
      { name: 'Shift', type: 'VARCHAR(20)', nullable: false, desc: 'Morning / Evening / Night' },
    ],
    relationships: [
      { type: 'N:1', target: 'Metro', foreignKey: 'Metro_ID' },
      { type: 'N:1', target: 'Route', foreignKey: 'Route_ID' },
      { type: 'N:1', target: 'Employee', foreignKey: 'Driver_Emp_ID' }
    ]
  },
  {
    name: 'Maintenance_Job',
    category: 'fleet',
    description: 'Scheduled preventive overhauls and emergency repairs across subsystems (brakes, pantograph, HVAC).',
    pk: ['Job_ID'],
    columns: [
      { name: 'Job_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Work order job ID' },
      { name: 'Metro_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Metro(Metro_ID)', desc: 'Train under service' },
      { name: 'Component', type: 'VARCHAR(100)', nullable: false, desc: 'Braking / Pantograph / HVAC / Bogie' },
      { name: 'Job_Type', type: 'VARCHAR(50)', nullable: false, default: "'Routine'", desc: 'Routine / Overhaul / Emergency' },
      { name: 'Scheduled_Date', type: 'DATETIME', nullable: false, desc: 'Depot booking date' },
      { name: 'Resolution_Status', type: 'VARCHAR(50)', nullable: false, default: "'Scheduled'", desc: 'Scheduled / In Progress / Completed' },
    ],
    relationships: [
      { type: 'N:1', target: 'Metro', foreignKey: 'Metro_ID' },
      { type: '1:N', target: 'Maintenance_Engineer_Job', foreignKey: 'Job_ID', notes: 'Engineer staffing' }
    ]
  },
  {
    name: 'Maintenance_Engineer_Job',
    category: 'fleet',
    description: 'Junction table assigning multiple certified engineers to a single depot maintenance work order.',
    pk: ['Job_ID', 'Engineer_Emp_ID'],
    columns: [
      { name: 'Job_ID', type: 'INT', key: 'PK/FK', nullable: false, fkRef: 'Maintenance_Job(Job_ID)', desc: 'Work order ID' },
      { name: 'Engineer_Emp_ID', type: 'INT', key: 'PK/FK', nullable: false, fkRef: 'Employee(Emp_ID)', desc: 'Assigned specialist' },
      { name: 'Role_on_Job', type: 'VARCHAR(100)', nullable: true, desc: 'Lead Specialist / Inspector / Assistant' },
    ],
    relationships: [
      { type: 'N:1', target: 'Maintenance_Job', foreignKey: 'Job_ID' },
      { type: 'N:1', target: 'Employee', foreignKey: 'Engineer_Emp_ID' }
    ]
  },

  // 4. Safety & Emergency Hierarchy
  {
    name: 'Emergency_Incident',
    category: 'safety',
    description: 'Track-level rolling stock technical failures (power, signal, breakdown) triggering automatic train suspension.',
    pk: ['Incident_ID'],
    columns: [
      { name: 'Incident_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Emergency token' },
      { name: 'Metro_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Metro(Metro_ID)', desc: 'Affected trainset' },
      { name: 'Track_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Track(Track_ID)', desc: 'Affected track block' },
      { name: 'Reporter_Emp_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Employee(Emp_ID)', desc: 'Reporting driver/controller' },
      { name: 'Breakdown', type: 'BOOLEAN', nullable: false, default: 'FALSE', desc: 'Mechanical propulsion failure' },
      { name: 'Power', type: 'BOOLEAN', nullable: false, default: 'FALSE', desc: 'Third rail power loss' },
      { name: 'Signal_Failure', type: 'BOOLEAN', nullable: false, default: 'FALSE', desc: 'CBTC signalling block loss' },
      { name: 'Timestamp', type: 'DATETIME', nullable: false, desc: 'Incident event time' },
      { name: 'Location_Description', type: 'VARCHAR(255)', nullable: true, desc: 'Physical landmark or milestone' },
      { name: 'Resolution_Status', type: 'VARCHAR(50)', nullable: false, default: "'Pending'", desc: 'Pending / Investigating / Resolved' },
    ],
    relationships: [
      { type: 'N:1', target: 'Metro', foreignKey: 'Metro_ID' },
      { type: 'N:1', target: 'Track', foreignKey: 'Track_ID' },
      { type: 'N:1', target: 'Employee', foreignKey: 'Reporter_Emp_ID' }
    ]
  },
  {
    name: 'Security_Incident',
    category: 'safety',
    description: 'Station-level security events (unauthorized access, baggage issues, medical emergencies).',
    pk: ['Security_Inc_ID'],
    columns: [
      { name: 'Security_Inc_ID', type: 'INT', key: 'PK', nullable: false, desc: 'Security report token' },
      { name: 'Station_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Station(Station_ID)', desc: 'Affected station' },
      { name: 'Reporter_Emp_ID', type: 'INT', key: 'FK', nullable: false, fkRef: 'Employee(Emp_ID)', desc: 'Reporting station marshal' },
      { name: 'Category_Type', type: 'VARCHAR(50)', nullable: false, desc: 'Luggage Theft / Unauthorized Track Access / Medical' },
      { name: 'Timestamp', type: 'DATETIME', nullable: false, desc: 'Incident event timestamp' },
      { name: 'Details', type: 'TEXT', nullable: true, desc: 'Full marshal observation notes' },
      { name: 'Resolution_Status', type: 'VARCHAR(50)', nullable: false, default: "'Pending'", desc: 'Pending / Under Review / Closed' },
    ],
    relationships: [
      { type: 'N:1', target: 'Station', foreignKey: 'Station_ID' },
      { type: 'N:1', target: 'Employee', foreignKey: 'Reporter_Emp_ID' }
    ]
  },
];

const ANALYTICAL_VIEWS = [
  {
    name: 'vw_OriginDestinationMatrix',
    title: 'Commuter Flow O-D Matrix',
    description: 'Aggregates commuter volume, average travel time in minutes, and total revenue generated between each station pair.',
    underlying: ['Ticket', 'Station']
  },
  {
    name: 'vw_StationHourlyCongestion',
    title: 'Hourly Station Congestion Matrix',
    description: 'Classifies hourly check-ins into congestion tiers (Normal Flow, Moderate Transit, Severe Congestion) to optimize peak headway.',
    underlying: ['Station', 'Ticket']
  },
  {
    name: 'vw_FleetHealthAnalytics',
    title: 'Fleet Health & MTBF Matrix',
    description: 'Calculates cumulative mechanical breakdowns, power failures, and scheduled maintenance work orders per train rake.',
    underlying: ['Metro', 'Emergency_Incident', 'Maintenance_Job']
  },
  {
    name: 'vw_RouteFinancialYield',
    title: 'Route Financial Yield & Passenger Volume',
    description: 'Computes financial yield, total revenue, and commuter trips across Pink Line and Blue Line transit corridors.',
    underlying: ['Route', 'Daily_Train_Schedule', 'Route_Station_Mapping', 'Ticket']
  }
];

export default function SchemaTab() {
  const [selectedTable, setSelectedTable] = useState<TableDef>(MASTER_SCHEMA[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveRowCounts, setLiveRowCounts] = useState<Record<string, number>>({});
  const [activeView, setActiveView] = useState<'tables' | 'diagram' | 'views' | 'triggers'>('tables');
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isInverted, setIsInverted] = useState<boolean>(false);

  useEffect(() => {
    // Fetch live schema row counts from MySQL backend
    fetch('/api/v1/sql/schema')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && data.tables) {
          const counts: Record<string, number> = {};
          data.tables.forEach((t: any) => {
            counts[t.TABLE_NAME.toLowerCase()] = t.TABLE_ROWS || 0;
          });
          setLiveRowCounts(counts);
        }
      })
      .catch((err) => console.error('Error fetching schema metadata:', err));
  }, []);

  const filteredTables = MASTER_SCHEMA.filter((tbl) => {
    const matchesCat = categoryFilter === 'all' || tbl.category === categoryFilter;
    const matchesSearch =
      tbl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tbl.columns.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6 text-white font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30 rounded-xs">
              RELATIONAL ARCHITECTURE
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              smart_metro_db // 3NF Master Schema
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Database Schema & ER Architecture
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Complete entity-relationship specification featuring 13 normalized tables, foreign key constraints, analytical views, and automated triggers.
          </p>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Prominent Action Button: View Full ER Diagram */}
          <button
            onClick={() => {
              setZoomLevel(1);
              setIsDiagramModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold tracking-wide bg-[#C5A880] hover:bg-[#d4ba96] text-black rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-[#C5A880]/20 font-mono"
            title="Open ER Diagram in Fullscreen Lightbox"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View ER Diagram Final</span>
          </button>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] p-1 rounded-sm">
            <button
              onClick={() => setActiveView('tables')}
              className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                activeView === 'tables' ? 'bg-[#27272A] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tables (13)
            </button>
            <button
              onClick={() => setActiveView('diagram')}
              className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === 'diagram' ? 'bg-[#27272A] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3 text-[#C5A880]" />
              <span>ER Diagram</span>
            </button>
            <button
              onClick={() => setActiveView('views')}
              className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                activeView === 'views' ? 'bg-[#27272A] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              SQL Views (4)
            </button>
            <button
              onClick={() => setActiveView('triggers')}
              className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                activeView === 'triggers' ? 'bg-[#27272A] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Triggers & Procedures
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: RELATIONAL TABLES INSPECTOR */}
      {activeView === 'tables' && (
        <div className="space-y-6">
          {/* Category Filter Chips & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Entities' },
                { id: 'ticketing', label: 'Commuters & Ticketing' },
                { id: 'infra', label: 'Infrastructure & Routes' },
                { id: 'fleet', label: 'Rolling Stock & Crews' },
                { id: 'safety', label: 'Safety & Emergency' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#C5A880]/15 text-[#C5A880] border-[#C5A880]/50'
                      : 'bg-[#18181B] text-neutral-400 border-[#27272A] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tables or columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xs text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A880] w-full sm:w-64"
              />
            </div>
          </div>

          {/* Master 2-Column Layout: Left Table Selector + Right Detailed Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Entity Cards List */}
            <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable.name === tbl.name;
                const rowCount = liveRowCounts[tbl.name.toLowerCase()] ?? '-';
                return (
                  <button
                    key={tbl.name}
                    onClick={() => setSelectedTable(tbl)}
                    className={`w-full text-left p-3.5 rounded-sm border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E1E22] border-[#C5A880] shadow-md shadow-[#C5A880]/10'
                        : 'bg-[#18181B] border-[#27272A] hover:bg-[#1E1E22] hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C5A880]' : 'text-neutral-500'}`} />
                        <span className={`font-mono text-xs font-bold tracking-wide ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                          {tbl.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141416] text-neutral-400 border border-[#242428]">
                        {rowCount} rows
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 mt-1.5 line-clamp-1">
                      {tbl.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#242428] text-[10px] font-mono text-neutral-400">
                      <span>{tbl.columns.length} columns</span>
                      <span>•</span>
                      <span className="text-[#C5A880]">PK: {tbl.pk.join(', ')}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Selected Entity Deep Inspector */}
            <div className="lg:col-span-8 bg-[#18181B] border border-[#27272A] rounded-sm p-6 space-y-6">
              {/* Selected Table Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272A]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 rounded-xs">
                      BASE TABLE
                    </span>
                    <h2 className="text-xl font-bold font-mono text-white tracking-wide">
                      {selectedTable.name}
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {selectedTable.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <div className="px-2.5 py-1 bg-[#141416] border border-[#27272A] rounded text-neutral-300">
                    Estimated Rows: <strong className="text-[#C5A880]">{liveRowCounts[selectedTable.name.toLowerCase()] ?? 'Connected'}</strong>
                  </div>
                </div>
              </div>

              {/* Column Schema Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-400 tracking-wider">
                  // ATTRIBUTES & DATA TYPES
                </span>
                <div className="overflow-x-auto border border-[#27272A] rounded-sm">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#141416] text-neutral-400 text-[10px] uppercase border-b border-[#27272A]">
                      <tr>
                        <th className="py-2.5 px-3">Column Name</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Key</th>
                        <th className="py-2.5 px-3">Nullable</th>
                        <th className="py-2.5 px-3">Default</th>
                        <th className="py-2.5 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#242428]">
                      {selectedTable.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-[#202024]/60">
                          <td className="py-2 px-3 font-semibold text-white">
                            {col.name}
                          </td>
                          <td className="py-2 px-3 text-[#C5A880]">
                            {col.type}
                          </td>
                          <td className="py-2 px-3">
                            {col.key === 'PK' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                <Key className="w-2.5 h-2.5" /> PK
                              </span>
                            )}
                            {col.key === 'FK' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30" title={col.fkRef}>
                                <Link2 className="w-2.5 h-2.5" /> FK
                              </span>
                            )}
                            {col.key === 'PK/FK' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                PK/FK
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {col.nullable ? 'YES' : 'NO'}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {col.default || '-'}
                          </td>
                          <td className="py-2 px-3 text-neutral-400 text-[11px]">
                            {col.desc || (col.fkRef ? `References ${col.fkRef}` : '-')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Relational Constraints & Foreign Keys */}
              {selectedTable.relationships && selectedTable.relationships.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#27272A]">
                  <span className="text-xs font-mono text-neutral-400 tracking-wider">
                    // FOREIGN KEY RELATIONSHIPS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTable.relationships.map((rel, idx) => (
                      <div key={idx} className="p-3 bg-[#141416] border border-[#27272A] rounded-sm text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[#C5A880] font-bold">{rel.type} Cardinality</span>
                          <span className="text-[10px] text-neutral-400">FK: {rel.foreignKey}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300">
                          <span>{selectedTable.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="font-bold text-white">{rel.target}</span>
                        </div>
                        {rel.notes && (
                          <p className="text-[10px] text-neutral-400 mt-0.5">{rel.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: VISUAL ER DIAGRAM CANVAS */}
      {activeView === 'diagram' && (
        <div className="space-y-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 rounded-xs">
                  MASTER RELATIONAL BLUEPRINT
                </span>
                <span className="text-xs font-mono text-white font-semibold">
                  Complete Chen / Crow's-Foot ER Diagram (Final)
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Visual specification showing all 13 entities, attributes, ISA incident specialization, and relationship cardinalities.
              </p>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 bg-[#141416] hover:bg-[#202024] border border-[#27272A] rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-neutral-400 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-1.5 bg-[#141416] hover:bg-[#202024] border border-[#27272A] rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 bg-[#141416] hover:bg-[#202024] border border-[#27272A] rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsInverted((v) => !v)}
                className={`px-2.5 py-1.5 border rounded text-xs transition-colors cursor-pointer ${
                  isInverted
                    ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880]'
                    : 'bg-[#141416] border-[#27272A] text-neutral-300 hover:text-white'
                }`}
                title="Toggle Dark/Light Mode Inversion"
              >
                {isInverted ? 'Inverted (Dark)' : 'Natural (Light)'}
              </button>
              <button
                onClick={() => setIsDiagramModalOpen(true)}
                className="px-3 py-1.5 bg-[#C5A880] hover:bg-[#d6bc96] text-black font-semibold rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-sm p-4 overflow-auto max-h-[680px] flex items-center justify-center relative shadow-inner">
            <div
              className="transition-transform duration-200 origin-center p-4 rounded-sm flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                backgroundColor: isInverted ? '#141416' : '#ffffff',
              }}
            >
              <img
                src="/er-diagram-final.png"
                alt="URATRO Master ER Diagram Final"
                className={`max-w-none transition-all duration-300 ${
                  isInverted ? 'invert hue-rotate-180 contrast-125' : ''
                }`}
                style={{ width: '100%', minWidth: '950px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: HIGH PERFORMANCE SQL VIEWS */}
      {activeView === 'views' && (
        <div className="space-y-4">
          <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-sm text-xs font-mono text-neutral-400">
            // PRE-COMPILED ANALYTICAL VIEWS (HIGH-SPEED DATA WAREHOUSING QUERIES)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ANALYTICAL_VIEWS.map((v) => (
              <div key={v.name} className="bg-[#18181B] border border-[#27272A] p-5 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30 rounded-xs">
                    SQL VIEW
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">smart_metro_db</span>
                </div>
                <h3 className="text-base font-bold text-white font-mono">{v.name}</h3>
                <p className="text-xs text-neutral-300 font-medium">{v.title}</p>
                <p className="text-xs text-neutral-400 leading-relaxed">{v.description}</p>
                <div className="pt-3 border-t border-[#27272A] flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                  <span>Underlying Tables:</span>
                  <div className="flex flex-wrap gap-1">
                    {v.underlying.map((u) => (
                      <span key={u} className="px-1.5 py-0.5 bg-[#141416] border border-[#27272A] rounded text-neutral-300 text-[10px]">
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: STORED PROCEDURES & TRIGGERS */}
      {activeView === 'triggers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stored Procedures Card */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C5A880]" />
                <h3 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
                  STORED PROCEDURES (ACID TRANSACTIONS)
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#141416] border border-[#27272A] rounded-sm space-y-1.5">
                  <div className="font-mono font-bold text-emerald-400">1. sp_TapInPassenger(...)</div>
                  <p className="text-neutral-300">
                    Executes row-level pessimistic lock (<code className="text-[#C5A880]">SELECT ... FOR UPDATE</code>) on Passenger balance. Verifies minimum ₹20 threshold, checks if commuter is already in-transit, opens gate, and creates active Ticket.
                  </p>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Parameters: (p_passenger_id, p_station_id, p_payment_method)
                  </div>
                </div>

                <div className="p-3 bg-[#141416] border border-[#27272A] rounded-sm space-y-1.5">
                  <div className="font-mono font-bold text-emerald-400">2. sp_TapOutPassenger(...)</div>
                  <p className="text-neutral-300">
                    Calculates station sequence hops between entry and exit stations. Dynamically computes transit fare, deducts from smart card balance, updates ticket exit timestamp, and commits ACID transaction with rollback on failure.
                  </p>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Parameters: (p_ticket_id, p_exit_station_id)
                  </div>
                </div>
              </div>
            </div>

            {/* Triggers Card */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <h3 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
                  AUTOMATED DATABASE TRIGGERS
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#141416] border border-[#27272A] rounded-sm space-y-1.5">
                  <div className="font-mono font-bold text-amber-400">1. trg_EmergencyIncident_AutoCascade</div>
                  <p className="text-neutral-300">
                    Fires <code className="text-[#C5A880]">AFTER INSERT ON Emergency_Incident</code>. Automatically cascades to the rolling-stock <code className="text-[#C5A880]">Metro</code> table and updates <code className="text-[#C5A880]">Current_Status = 'Suspended'</code> to prevent collisions.
                  </p>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Event: AFTER INSERT | Target: Metro.Current_Status = 'Suspended'
                  </div>
                </div>

                <div className="p-3 bg-[#141416] border border-[#27272A] rounded-sm space-y-1.5">
                  <div className="font-mono font-bold text-amber-400">2. trg_Maintenance_AutoRestore</div>
                  <p className="text-neutral-300">
                    Fires <code className="text-[#C5A880]">AFTER UPDATE ON Maintenance_Job</code>. When work order changes to <code className="text-[#C5A880]">'Completed'</code>, automatically restores the trainset status to <code className="text-[#C5A880]">'Active'</code> and returns it to service.
                  </p>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Event: AFTER UPDATE | Target: Metro.Current_Status = 'Active'
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN ER DIAGRAM LIGHTBOX MODAL */}
      {isDiagramModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Modal Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A] z-10 bg-[#161619]/90 px-4 py-2.5 rounded-sm">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 rounded-xs uppercase">
                ER Diagram Final
              </span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                smart_metro_db Master Relational Architecture
              </span>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.2))}
                className="p-1.5 bg-[#1C1C20] hover:bg-[#28282E] border border-[#27272A] rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-neutral-400 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3.5, z + 0.2))}
                className="p-1.5 bg-[#1C1C20] hover:bg-[#28282E] border border-[#27272A] rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 bg-[#1C1C20] hover:bg-[#28282E] border border-[#27272A] rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsInverted((v) => !v)}
                className={`px-3 py-1.5 border rounded text-xs transition-colors cursor-pointer ${
                  isInverted
                    ? 'bg-[#C5A880]/20 border-[#C5A880] text-[#C5A880]'
                    : 'bg-[#1C1C20] border-[#27272A] text-neutral-300 hover:text-white'
                }`}
                title="Toggle Dark/Light Inversion"
              >
                {isInverted ? 'Inverted (Dark)' : 'Natural (Light)'}
              </button>
              <a
                href="/er-diagram-final.png"
                download="smart_metro_db_er_diagram_final.png"
                className="px-3 py-1.5 bg-[#242428] hover:bg-[#303036] border border-[#3A3A40] text-neutral-200 hover:text-white rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Download High-Res PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </a>
              <button
                onClick={() => setIsDiagramModalOpen(false)}
                className="w-8 h-8 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-2"
                title="Close Lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Zoomable Body */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6 my-2 relative rounded-sm bg-[#111113] border border-[#222226]">
            <div
              className="transition-transform duration-150 origin-center p-6 rounded-sm shadow-2xl"
              style={{
                transform: `scale(${zoomLevel})`,
                backgroundColor: isInverted ? '#141416' : '#ffffff',
              }}
            >
              <img
                src="/er-diagram-final.png"
                alt="URATRO Master ER Diagram Final Fullscreen"
                className={`max-w-none transition-all duration-300 select-none ${
                  isInverted ? 'invert hue-rotate-180 contrast-125' : ''
                }`}
                style={{ width: '100%', minWidth: '1100px' }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-2 px-2 text-[11px] font-mono text-neutral-400">
            <span>Scroll horizontally/vertically to pan around • Press Esc or ✕ to close</span>
            <span className="text-[#C5A880]">smart_metro_db // Chen Notation Master Diagram</span>
          </div>
        </div>
      )}
    </div>
  );
}
