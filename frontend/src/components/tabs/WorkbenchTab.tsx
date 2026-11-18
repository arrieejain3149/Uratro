import { useState, useEffect } from 'react';
import { Play, Trash2, Clock, CheckCircle2, AlertTriangle, Download, Database, Search, History, Copy, Check } from 'lucide-react';

interface QueryResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  type?: 'SELECT' | 'MUTATION';
  query?: string;
  columns?: string[];
  rows?: any[];
  rowCount?: number;
  message?: string;
  error?: string;
  executionMs?: number;
}

const PRESET_QUERIES = [
  { label: 'Stations', sql: 'SELECT * FROM Station;' },
  { label: 'Train Fleet', sql: 'SELECT * FROM Metro;' },
  { label: 'Passengers (Top 10)', sql: 'SELECT * FROM Passenger LIMIT 10;' },
  { label: 'Recent Tickets', sql: 'SELECT * FROM Ticket ORDER BY Ticket_ID DESC LIMIT 10;' },
  { label: 'O-D Flow Matrix', sql: 'SELECT * FROM vw_OriginDestinationMatrix LIMIT 10;' },
  { label: 'Station Congestion', sql: 'SELECT * FROM vw_StationHourlyCongestion LIMIT 10;' },
  { label: 'Fleet Reliability', sql: 'SELECT * FROM vw_FleetHealthAnalytics;' },
  { label: 'Active Routes', sql: 'SELECT * FROM Route;' },
  { label: 'Emergency Incidents', sql: 'SELECT * FROM Emergency_Incident;' },
  { label: 'All Tables', sql: 'SHOW TABLES;' },
];

export default function WorkbenchTab() {
  const [query, setQuery] = useState<string>('SELECT * FROM Station;');
  const [result, setResult] = useState<QueryResult>({ status: 'idle' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [history, setHistory] = useState<string[]>([
    'SELECT * FROM Station;',
    'SELECT * FROM Metro;',
    'SELECT * FROM vw_OriginDestinationMatrix LIMIT 10;'
  ]);
  const [isCopied, setIsCopied] = useState(false);

  const executeQuery = async (sqlToRun?: string) => {
    const targetSql = (sqlToRun !== undefined ? sqlToRun : query).trim();
    if (!targetSql) return;

    setResult({ status: 'loading' });

    try {
      const res = await fetch('/api/v1/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetSql }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setResult({
          status: 'success',
          type: data.type,
          query: targetSql,
          columns: data.columns || [],
          rows: data.rows || [],
          rowCount: data.rowCount || 0,
          message: data.message,
          executionMs: data.executionMs,
        });

        // Add to history
        setHistory((prev) => [targetSql, ...prev.filter((q) => q !== targetSql)].slice(0, 10));
      } else {
        setResult({
          status: 'error',
          query: targetSql,
          error: data.error || 'Query execution failed on MySQL engine.',
          executionMs: data.executionMs || 0,
        });
      }
    } catch (err: any) {
      setResult({
        status: 'error',
        query: targetSql,
        error: err.message || 'Network connection failed.',
        executionMs: 0,
      });
    }
  };

  // Run initial query on mount
  useEffect(() => {
    executeQuery('SELECT * FROM Station;');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  };

  const handleCopyResults = () => {
    if (!result.rows || result.rows.length === 0) return;
    const jsonStr = JSON.stringify(result.rows, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result.rows || !result.columns || result.columns.length === 0) return;
    const header = result.columns.join(',');
    const rows = result.rows.map((row) =>
      result.columns!.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uratro_query_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter rows by search term
  const filteredRows = (result.rows || []).filter((row) => {
    if (!searchTerm.trim()) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-6 space-y-6 text-white font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30 rounded-xs">
              DBMS CONSOLE
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              MySQL 8.0 // smart_metro_db
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            SQL Workbench
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Execute native SQL statements directly against your relational metro database and inspect live tabular outputs.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#18181B] border border-[#27272A] text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-300">MySQL Host: localhost:3306</span>
          </div>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>// QUICK QUERY PRESETS</span>
          <span className="text-[10px] text-neutral-400">Click any preset to populate & execute</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setQuery(preset.sql);
                executeQuery(preset.sql);
              }}
              className="px-3 py-1.5 text-xs font-mono rounded-sm bg-[#18181B] border border-[#27272A] text-neutral-300 hover:text-white hover:border-[#C5A880]/60 hover:bg-[#202024] transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* SQL Editor Area */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-sm overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#141416] border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C5A880]" />
            <span className="text-xs font-mono font-medium text-neutral-300 tracking-wider">
              QUERY EDITOR
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-[#202024] border border-[#2E2E33] rounded text-neutral-300">Ctrl + Enter</kbd> to run
          </span>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            spellCheck={false}
            className="w-full bg-[#161619] text-[#E4E4E7] font-mono text-xs sm:text-sm p-4 outline-none resize-y border-none leading-relaxed selection:bg-[#C5A880]/30"
            placeholder="Write SQL query here... e.g. SELECT * FROM Station WHERE Type = 'Interchange';"
          />
        </div>

        {/* Query Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#141416] border-t border-[#27272A]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuery('')}
              className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-[#1C1C20] hover:bg-[#242428] border border-[#2A2A2E] rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => executeQuery()}
              disabled={result.status === 'loading'}
              className="px-5 py-2 text-xs font-semibold tracking-wide bg-[#C5A880] hover:bg-[#d6bc96] text-black rounded-sm transition-all shadow-md hover:shadow-[#C5A880]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {result.status === 'loading' ? 'Executing Query...' : 'Run Query'}
            </button>
          </div>
        </div>
      </div>

      {/* Execution Results Section */}
      <div className="space-y-4">
        {/* Results Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] px-4 py-3 rounded-sm">
          <div className="flex items-center gap-4 text-xs font-mono">
            {result.status === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Query OK
              </span>
            )}
            {result.status === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                Query Error
              </span>
            )}
            {result.status === 'loading' && (
              <span className="flex items-center gap-1.5 text-[#C5A880] font-semibold animate-pulse">
                <Clock className="w-4 h-4" />
                Executing on MySQL...
              </span>
            )}

            {result.executionMs !== undefined && (
              <span className="text-neutral-400">
                Duration: <strong className="text-neutral-200">{result.executionMs} ms</strong>
              </span>
            )}

            {result.rowCount !== undefined && (
              <span className="text-neutral-400">
                Rows: <strong className="text-neutral-200">{result.rowCount}</strong>
              </span>
            )}
          </div>

          {/* Table Controls (Search & Export) */}
          {result.status === 'success' && result.rows && result.rows.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-[#141416] border border-[#27272A] rounded-xs text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <button
                onClick={handleCopyResults}
                title="Copy as JSON"
                className="p-1.5 bg-[#141416] hover:bg-[#202024] border border-[#27272A] rounded-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleDownloadCsv}
                title="Download CSV"
                className="px-2.5 py-1 bg-[#141416] hover:bg-[#202024] border border-[#27272A] rounded-xs text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
            </div>
          )}
        </div>

        {/* Error Message Box */}
        {result.status === 'error' && (
          <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-sm font-mono text-xs text-rose-300 space-y-1">
            <div className="font-semibold text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              MySQL Engine Execution Error
            </div>
            <p className="text-rose-300/90 whitespace-pre-wrap pl-6">{result.error}</p>
          </div>
        )}

        {/* Mutation Feedback Message */}
        {result.status === 'success' && result.type === 'MUTATION' && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-sm font-mono text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{result.message}</span>
          </div>
        )}

        {/* Results Data Grid */}
        {result.status === 'success' && result.type === 'SELECT' && (
          <div className="bg-[#18181B] border border-[#27272A] rounded-sm overflow-hidden shadow-lg">
            {filteredRows.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 font-mono text-xs">
                No records found matching criteria.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 z-10 bg-[#141416] border-b border-[#27272A] text-neutral-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center text-neutral-400 border-r border-[#242428]">#</th>
                      {result.columns!.map((col) => (
                        <th key={col} className="py-2.5 px-4 font-semibold text-neutral-300 border-r border-[#242428] last:border-none">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202024]">
                    {filteredRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-[#202024]/70 transition-colors">
                        <td className="py-2 px-3 text-center text-neutral-400 border-r border-[#242428] text-[10px]">
                          {rowIdx + 1}
                        </td>
                        {result.columns!.map((col) => {
                          const val = row[col];
                          const isNull = val === null || val === undefined;
                          return (
                            <td key={col} className="py-2 px-4 border-r border-[#242428] last:border-none whitespace-nowrap text-neutral-300">
                              {isNull ? (
                                <span className="text-neutral-400 italic">NULL</span>
                              ) : typeof val === 'number' ? (
                                <span className="text-[#C5A880]">{val}</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Query History Bar */}
      {history.length > 0 && (
        <div className="bg-[#18181B] border border-[#27272A] rounded-sm p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <History className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>// RECENT QUERY LOG</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(h);
                  executeQuery(h);
                }}
                className="px-2.5 py-1 text-[11px] font-mono bg-[#141416] hover:bg-[#202024] border border-[#242428] hover:border-neutral-600 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer truncate max-w-xs"
                title={h}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
