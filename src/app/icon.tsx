import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f97316",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          fontFamily: "sans-serif",
          fontSize: "22px",
          fontWeight: "900",
          color: "white",
          letterSpacing: "-1px",
        }}
      >
        L
      </div>
    ),
    { ...size }
  )
}
