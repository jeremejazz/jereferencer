import { Compass, Settings, HelpCircle, Layers, Download } from "lucide-react";

export function Header() {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Compass className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
            Jereferencer
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/30">
              v0.1.0-alpha
            </span>
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">
            Desktop Georeferencing Workbench
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1">
        <a
          href="#layers"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-slate-100 border border-slate-700 shadow-sm"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Layers
        </a>
        <a
          href="#export"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-md transition duration-200 border border-transparent"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </a>
      </nav>

      {/* Action / Setting Buttons */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition duration-200 cursor-pointer"
          title="Help & Guides"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition duration-200 cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <div className="h-6 w-[1px] bg-slate-800 mx-1" />
        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Tauri Dev Mode
        </div>
      </div>
    </header>
  );
}
