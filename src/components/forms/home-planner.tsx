"use client";

import { useState } from "react";
import { Bus, Car, Compass, Globe, Hotel, Map, Plane, Stamp, TrainFront } from "lucide-react";
import type { FieldDef } from "@/lib/form-fields";
import { cn } from "@/lib/utils";
import { EnquiryWizard } from "./enquiry-wizard";

export type PlannerTab = {
  key: string;
  label: string;
  icon: "tour" | "vehicle" | "hotel" | "custom" | "bus" | "train" | "flight" | "visa" | "globe";
  type: "tour" | "planner" | "vehicle" | "hotel" | "intercity" | "train" | "flight" | "visa" | "international";
  fields: FieldDef[];
  note?: string;
};

const ICONS = { tour: Map, vehicle: Car, hotel: Hotel, custom: Compass, bus: Bus, train: TrainFront, flight: Plane, visa: Stamp, globe: Globe };

export function HomePlanner({ tabs }: { tabs: PlannerTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!tab) return null;
  return (
    <div className="rounded-[1.75rem] bg-white shadow-[0_40px_100px_-50px_rgba(15,27,45,.55)]">
      <div role="tablist" aria-label="Trip type" className="flex gap-1 overflow-x-auto border-b border-line p-2 [scrollbar-width:none]">
        {tabs.map((t) => {
          const Icon = ICONS[t.icon];
          const selected = t.key === tab.key;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              id={`planner-tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`planner-panel-${t.key}`}
              onClick={() => setActive(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                selected ? "bg-ink text-ivory" : "text-muted hover:bg-paper hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden /> {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`planner-panel-${tab.key}`} aria-labelledby={`planner-tab-${tab.key}`} className="p-6 md:p-9">
        <EnquiryWizard key={tab.key} type={tab.type} tripFields={tab.fields} note={tab.note} submitLabel="Request a quote" />
      </div>
    </div>
  );
}
