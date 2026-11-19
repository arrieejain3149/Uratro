import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Terminal, Network, Search, X, Check, AlertCircle } from 'lucide-react';
import type { AuthUser } from '../../types/auth';

interface ColumnMeta {
  COLUMN_NAME: string;
  COLUMN_KEY: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  EXTRA: string;
  COLUMN_DEFAULT: any;
}

interface AdminPortalProps {
  authUser?: AuthUser;
  onOpenAuthModal: () => void;
  onOpenWorkbench: () => void;
  onOpenSchema: () => void;
}

export default function AdminPortal({
  authUser: _authUser,
  onOpenAuthModal,
  onOpenWorkbench,
  onOpenSchema,
}: AdminPortalProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('Station');
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeRow, setActiveRow] = useState<any>(null);

  // Fetch tables
  useEffect(() => {
    fetch('/api/v1/crud/tables')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.tables)) {
          setTables(data.tables);
          if (data.tables.length > 0) {
            setSelectedTable(data.tables[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching tables:', err));
  }, []);

  // Fetch table data
  const fetchTableData = (tableName: string) => {
    setLoading(true);
    setStatusMessage('');
    fetch(`/api/v1/crud/${tableName}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setColumns(data.columns || []);
          setRows(data.rows || []);
          setPrimaryKey(data.primary_key || null);
        }
      })
      .catch((err) => console.error('Error fetching table data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  // Handle Add Record
  const handleOpenAdd = () => {
    const initial: Record<string, any> = {};
    columns.forEach((c) => {
      if (c.EXTRA !== 'auto_increment') {
        initial[c.COLUMN_NAME] = '';
      }
    });
    setFormData(initial);
    setIsAddOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/crud/${selectedTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStatusMessage(`Record inserted into ${selectedTable} successfully.`);
        setIsAddOpen(false);
        fetchTableData(selectedTable);
      } else {
        alert(data.detail || 'Error inserting record');
      }
    } catch (err) {
      console.error('Error inserting:', err);
    }
  };

  // Handle Edit Record
  const handleOpenEdit = (row: any) => {
    setActiveRow(row);
    setFormData({ ...row });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryKey || !activeRow) return;
    try {
      const pkVal = activeRow[primaryKey];
      const res = await fetch(`/api/v1/crud/${selectedTable}/${primaryKey}/${pkVal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStatusMessage(`Record ${pkVal} updated successfully.`);
        setIsEditOpen(false);
        fetchTableData(selectedTable);
      } else {
        alert(data.detail || 'Error updating record');
      }
    } catch (err) {
      console.error('Error updating:', err);
    }
  };

  // Handle Delete Record
  const handleOpenDelete = (row: any) => {
    setActiveRow(row);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!primaryKey || !activeRow) return;
    try {
      const pkVal = activeRow[primaryKey];
      const res = await fetch(`/api/v1/crud/${selectedTable}/${primaryKey}/${pkVal}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStatusMessage(`Record ${pkVal} deleted successfully.`);
        setIsDeleteOpen(false);
        fetchTableData(selectedTable);
      } else {
        alert(data.detail || 'Error deleting record');
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Filter rows
  const filteredRows = rows.filter((r) => {
    if (!searchQuery) return true;
    return Object.values(r).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 font-sans select-none text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242428]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-1">
            Data Feeder
          </h1>
          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
            Create Read Update Delete
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Deep link buttons to SQL Workbench and Schema Tab */}
          <button
            onClick={onOpenWorkbench}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xs border border-[#27272A] bg-[#18181B] hover:bg-neutral-800 text-[#C5A880] hover:text-[#D4AF37] text-xs font-mono transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Workbench</span>
          </button>

          <button
            onClick={onOpenSchema}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xs border border-[#27272A] bg-[#18181B] hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            <Network className="w-3.5 h-3.5" />
            <span>ER Diagram</span>
          </button>

          <button
            onClick={onOpenAuthModal}
            className="px-3 py-2 rounded-xs border border-[#27272A] bg-[#141416] hover:bg-neutral-800 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Switch Role
          </button>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div className="mt-4 p-3 rounded-xs bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="cursor-pointer text-neutral-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table Selector Chip Bar */}
      <div className="mt-6">
        <div className="text-[10px] tracking-wider uppercase text-neutral-400 font-mono mb-2">
          Select Relational Entity ({tables.length} Tables Available)
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {tables.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTable(t)}
              className={`px-3 py-1.5 rounded-xs text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedTable === t
                  ? 'bg-[#C5A880] text-neutral-950 font-bold shadow-xs'
                  : 'bg-[#18181B] border border-[#27272A] text-neutral-300 hover:text-white hover:border-neutral-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar: Search, Insert Button, Refresh */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${selectedTable} rows...`}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xs pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTableData(selectedTable)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xs border border-[#27272A] bg-[#18181B] hover:bg-neutral-800 text-neutral-300 text-xs font-mono cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xs bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 text-xs font-semibold font-mono tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {selectedTable}</span>
          </button>
        </div>
      </div>

      {/* Main Table Data Grid */}
      <div className="mt-5 rounded-xs border border-[#27272A] bg-[#18181B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#141416] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#27272A]">
              <tr>
                {columns.map((c) => (
                  <th key={c.COLUMN_NAME} className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>{c.COLUMN_NAME}</span>
                      {c.COLUMN_KEY === 'PRI' && (
                        <span className="text-[9px] px-1 py-0.2 rounded-xs bg-[#C5A880]/20 text-[#C5A880]">
                          PK
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242428] text-neutral-200">
              {filteredRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                  {columns.map((c) => (
                    <td key={c.COLUMN_NAME} className="py-2.5 px-4 whitespace-nowrap max-w-xs truncate">
                      {row[c.COLUMN_NAME] !== null ? String(row[c.COLUMN_NAME]) : (
                        <span className="text-neutral-500 italic">NULL</span>
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 rounded-xs bg-[#242428] hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(row)}
                        className="p-1.5 rounded-xs bg-red-950/40 border border-red-800/40 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="py-8 text-center text-neutral-500">
                    No records found in {selectedTable}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD RECORD */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div onClick={() => setIsAddOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#18181B] border border-[#27272A] rounded-sm p-6 shadow-2xl z-10 text-white font-mono select-none max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <h2 className="text-sm uppercase tracking-wider font-bold text-white">
                Insert Record: {selectedTable}
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-4 space-y-3 text-xs">
              {columns
                .filter((c) => c.EXTRA !== 'auto_increment')
                .map((c) => (
                  <div key={c.COLUMN_NAME}>
                    <label className="block text-[10px] uppercase text-neutral-400 mb-1">
                      {c.COLUMN_NAME} ({c.DATA_TYPE})
                    </label>
                    <input
                      type="text"
                      value={formData[c.COLUMN_NAME] || ''}
                      onChange={(e) => setFormData({ ...formData, [c.COLUMN_NAME]: e.target.value })}
                      placeholder={`Enter ${c.COLUMN_NAME}`}
                      className="w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2 text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                ))}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-2 rounded-xs border border-[#27272A] bg-[#121214] text-neutral-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xs bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 font-bold text-xs uppercase cursor-pointer"
                >
                  Insert Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RECORD */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div onClick={() => setIsEditOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#18181B] border border-[#27272A] rounded-sm p-6 shadow-2xl z-10 text-white font-mono select-none max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <h2 className="text-sm uppercase tracking-wider font-bold text-white">
                Edit Record in {selectedTable}
              </h2>
              <button onClick={() => setIsEditOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3 text-xs">
              {columns.map((c) => {
                const isPk = c.COLUMN_NAME === primaryKey;
                return (
                  <div key={c.COLUMN_NAME}>
                    <label className="block text-[10px] uppercase text-neutral-400 mb-1">
                      {c.COLUMN_NAME} {isPk && '(Primary Key - Read Only)'}
                    </label>
                    <input
                      type="text"
                      disabled={isPk}
                      value={formData[c.COLUMN_NAME] !== undefined && formData[c.COLUMN_NAME] !== null ? String(formData[c.COLUMN_NAME]) : ''}
                      onChange={(e) => setFormData({ ...formData, [c.COLUMN_NAME]: e.target.value })}
                      className={`w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2 text-white focus:outline-none focus:border-[#C5A880] ${
                        isPk ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                );
              })}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-2 rounded-xs border border-[#27272A] bg-[#121214] text-neutral-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xs bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 font-bold text-xs uppercase cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div onClick={() => setIsDeleteOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#18181B] border border-red-800/60 rounded-sm p-6 shadow-2xl z-10 text-white font-mono select-none">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-neutral-300 mb-4">
              Are you sure you want to delete this record from <span className="text-white font-bold">{selectedTable}</span>?
              {primaryKey && activeRow && (
                <span className="block mt-1 text-[11px] text-neutral-400">
                  {primaryKey}: {activeRow[primaryKey]}
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-3 py-1.5 rounded-xs border border-[#27272A] bg-[#121214] text-neutral-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-xs bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
