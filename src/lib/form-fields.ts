/** Declarative field definitions — serialisable so server components can configure client forms. */
export type FieldOption = string | { value: string; label: string };

export type FieldDef = {
  name: string;
  label: string;
  kind: "text" | "date" | "time" | "number" | "select" | "textarea" | "choice";
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  width?: "full" | "half" | "third";
  /** Stored in the enquiry's `details` JSON rather than a dedicated column. */
  detail?: boolean;
  help?: string;
  autoComplete?: string;
  /** For date fields: must be on/after the value of this other date field. */
  after?: string;
};

export const optValue = (o: FieldOption) => (typeof o === "string" ? o : o.value);
export const optLabel = (o: FieldOption) => (typeof o === "string" ? o : o.label);

export const paxFields: FieldDef[] = [
  { name: "adults", label: "Adults", kind: "number", min: 1, max: 99, required: true, width: "half" },
  { name: "children", label: "Children", kind: "number", min: 0, max: 60, width: "half" },
];
