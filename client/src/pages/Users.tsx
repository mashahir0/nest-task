import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import api from "../api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

type TabKey = "all" | "files" | "people" | "chats";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filters, setFilters] = useState({ files: true, people: true, chats: false, lists: false });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [searchError, setSearchError] = useState<string>("");

  const loadUsers = async () => {
    if (searchError) return; // don't fetch when validation fails
    const q = search.trim();
    const res = await api.get("/users", { params: q ? { search: q } : {} });
    setUsers(res.data.data);
  };

  useEffect(() => {
    loadUsers();
  }, [search, searchError]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return (
      <span>
        {before}
        <mark className="bg-yellow-200 rounded px-0.5">{match}</mark>
        {after}
      </span>
    );
  };

  const people = useMemo(() => users, [users]);
  const filesCount = 0; // no files data yet
  const chatsCount = 0; // no chats data yet

  // For smooth container shrink/expand based on visible list size
  const visiblePeopleCount = (activeTab === 'people' || activeTab === 'all') && filters.people ? people.length : 0;
  const visibleFilesCount = (activeTab === 'files' || activeTab === 'all') && filters.files ? 0 : 0;
  const visibleChatsCount = (activeTab === 'chats' || activeTab === 'all') && filters.chats ? 0 : 0;
  const visibleRows = visiblePeopleCount + visibleFilesCount + visibleChatsCount;
  const maxHeight = Math.max(220, Math.min(560, 140 + visibleRows * 56));

  const TabButton = ({ id, label, count, disabled }: { id: TabKey; label: string; count: number; disabled?: boolean }) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      aria-disabled={disabled}
      className={`text-sm font-medium flex items-center gap-2 px-3 py-1 rounded-full transition ${
        disabled
          ? "text-gray-400 cursor-not-allowed opacity-50"
          : activeTab === id
            ? "bg-gray-900 text-white"
            : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        disabled ? "bg-gray-100" : activeTab === id ? "bg-gray-800" : "bg-gray-200"
      }`}>
        {count}
      </span>
    </button>
  );

  const MenuRow = ({ icon, label, enabled, onToggle, disabled }: { icon: ReactNode; label: string; enabled?: boolean; onToggle?: () => void; disabled?: boolean }) => (
    <button
      type="button"
      className={`flex w-full items-center gap-2 p-2 rounded-lg hover:bg-gray-100 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
    >
      {icon}
      <span className="flex-1 text-left text-sm text-gray-800">{label}</span>
      {!disabled && (
        <span className={`ml-2 w-5 h-5 inline-flex items-center justify-center rounded-full ${enabled ? 'bg-gray-900' : 'bg-gray-200'}`}>
          {enabled ? (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12"><path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
          ) : (
            <span className="w-2 h-2 bg-white rounded-full block" />
          )}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="relative bg-white rounded-2xl shadow-md ring-1 ring-black/5 overflow-hidden animate-scale-fade-in transition-max-height" style={{ maxHeight }}>
          {/* Search row */}
          <div className="flex items-center gap-3 px-4 pt-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-400"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/></svg>
            <input
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                // Validation: max 50, only letters, numbers, spaces, dot, underscore and hyphen
                const tooLong = value.length > 50;
                const invalidChars = !/^[-_.\w\s]*$/.test(value);
                const onlySpaces = value.trim().length === 0 && value.length > 0;
                if (tooLong) {
                  setSearchError("Search must be 50 characters or less.");
                } else if (invalidChars) {
                  setSearchError("Only letters, numbers, spaces, -, _, . are allowed.");
                } else if (onlySpaces) {
                  setSearchError("Enter at least one non-space character.");
                } else {
                  setSearchError("");
                }
                setSearch(value);
              }}
              placeholder="Search"
              aria-invalid={!!searchError}
              className={`flex-1 outline-none py-3 text-gray-900 placeholder:text-gray-400 ${searchError ? 'ring-1 ring-red-400 rounded-md' : ''}`}
            />
            <button onClick={() => setSearch("")} className="text-sm text-gray-600 hover:underline">Clear</button>
            <button
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
              className="ml-auto text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
          {searchError && (
            <div className="px-4 pb-2 text-xs text-red-600">{searchError}</div>
          )}

          {/* Tabs */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <TabButton id="all" label="All" count={(filters.people ? people.length : 0) + (filters.files ? filesCount : 0) + (filters.chats ? chatsCount : 0)} />
              <TabButton id="files" label="Files" count={filters.files ? filesCount : 0} disabled={!filters.files} />
              <TabButton id="people" label="People" count={filters.people ? people.length : 0} disabled={!filters.people} />
              <TabButton id="chats" label="Chats" count={filters.chats ? chatsCount : 0} disabled={!filters.chats} />
            </div>
            <button onClick={() => setIsMenuOpen((v) => !v)} className="p-2 text-gray-500 hover:text-gray-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Divider */}
          <div className="mt-2 border-t" />

          {/* Settings dropdown */}
          {isMenuOpen && (
            <div ref={menuRef} className="absolute right-3 top-16 z-10 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-2 animate-scale-fade-in">
              <MenuRow
                icon={(
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
                label="Files"
                enabled={filters.files}
                onToggle={() => setFilters((f) => {
                  const next = { ...f, files: !f.files };
                  if (!next.files && activeTab === 'files') setActiveTab('all');
                  return next;
                })}
              />
              <MenuRow
                icon={(
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 8a7 7 0 1114 0H5z" stroke="currentColor" strokeWidth="2"/></svg>
                )}
                label="People"
                enabled={filters.people}
                onToggle={() => setFilters((f) => {
                  const next = { ...f, people: !f.people };
                  if (!next.people && activeTab === 'people') setActiveTab('all');
                  return next;
                })}
              />
              <MenuRow
                icon={(
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400"><path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="2"/></svg>
                )}
                label="Chats"
                enabled={filters.chats}
                onToggle={() => setFilters((f) => {
                  const next = { ...f, chats: !f.chats };
                  if (!next.chats && activeTab === 'chats') setActiveTab('all');
                  return next;
                })}
              />
              <MenuRow
                icon={(
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400"><path d="M6 6h12v12H6z" stroke="currentColor" strokeWidth="2"/></svg>
                )}
                label="Lists"
                enabled={filters.lists}
                onToggle={() => setFilters((f) => ({ ...f, lists: !f.lists }))}
                disabled
              />
            </div>
          )}

          {/* Results */}
          <div className="px-2 py-2">
            {(activeTab === "all" || activeTab === "people") && filters.people && people.map((u, idx) => (
              <div key={u.id} className="flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-xl animate-slide-up">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                    {u.name?.charAt(0) || "U"}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${idx % 2 === 0 ? "bg-green-500" : "bg-yellow-500"}`}></span>
                </div>

                {/* Texts */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {highlight(u.name, search)}
                  </div>
                  <div className="text-xs text-gray-500">{idx % 2 === 0 ? "Active now" : "Active 2d ago"}</div>
                </div>

                {/* Trailing icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}

            {(activeTab === "all" || activeTab === "files") && filters.files && filesCount === 0 && (
              <div className="px-2 py-6 text-center text-sm text-gray-500">No files found</div>
            )}

            {(activeTab === "all" || activeTab === "chats") && filters.chats && chatsCount === 0 && (
              <div className="px-2 py-6 text-center text-sm text-gray-500">No chats found</div>
            )}
          </div>

          {/* Bottom shimmer placeholder */}
          <div className="p-4">
            <div className="h-2 w-full rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
