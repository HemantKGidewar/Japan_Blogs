import { ImageResponse } from "next/og";

export const alt = "Japan Time-Capsule — photo stories from Japan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "76px",
        color: "white",
        background: "radial-gradient(circle at 75% 20%, #713f50 0%, #25191e 32%, #080808 72%)",
      }}
    >
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 7, textTransform: "uppercase", color: "#f0a7bd" }}>
        A photo journal
      </div>
      <div style={{ display: "flex", marginTop: 22, fontSize: 76, fontWeight: 700, letterSpacing: -4 }}>
        Japan Time-Capsule
      </div>
      <div style={{ display: "flex", marginTop: 22, maxWidth: 760, fontSize: 30, lineHeight: 1.35, color: "#d4d4d4" }}>
        Photographs and thoughts from everyday life in Japan.
      </div>
    </div>,
    size,
  );
}
