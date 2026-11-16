"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  role: string;
}

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: "ws_1", name: "Acme Media Orbit", role: "Owner" },
    { id: "ws_2", name: "Tech Launch Studio", role: "Admin" },
    { id: "ws_3", name: "Personal Brand", role: "Editor" },
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(workspaces[0]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border bg-card hover:bg-accent text-sm font-medium transition-colors text-foreground shadow-sm"
      >
        <div className="w-5 h-5 rounded-md bg-violet-600/10 text-violet-600 flex items-center justify-center font-bold text-[10px]">
          {selectedWorkspace.name.slice(0, 2).toUpperCase()}
        </div>
        <span className="truncate max-w-[140px] text-xs font-semibold">{selectedWorkspace.name}</span>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-56 rounded-xl border bg-card shadow-xl z-50 p-1.5 space-y-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Workspaces & Brands
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setSelectedWorkspace(ws);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                  selectedWorkspace.id === ws.id
                    ? "bg-violet-600/10 text-violet-600 font-semibold"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{ws.name}</span>
                </div>
                {selectedWorkspace.id === ws.id && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}

            <div className="pt-1.5 mt-1 border-t">
              <a
                href="/app/workspaces"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage or Add Brand</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

