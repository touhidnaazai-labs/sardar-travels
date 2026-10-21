import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";

const LOGO = `data:image/png;base64,${readFileSync(path.join(process.cwd(), "public/brand/logo-horizontal-light.png")).toString("base64")}`;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Sardar Travels — tours, vehicle hire and hotels from Mysuru";

/** Default share image for pages that don't set their own (tour pages use their photo). */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#0f1c3a 0%,#0e7c86 130%)", color: "#fff" }}>
        { }
        <img src={LOGO} width={412} height={110} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.02 }}>Your Journey.</div>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.02, color: "#3dd6c0" }}>Your Way.</div>
          <div style={{ marginTop: 28, fontSize: 30, opacity: 0.85 }}>Tours · Vehicle hire · Hotels — Mysuru, Ooty, Kodaikanal, Coorg</div>
        </div>
      </div>
    ),
    size,
  );
}
