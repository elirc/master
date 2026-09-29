import { ImageResponse } from "next/og";

export const size = {
  width: 192,
  height: 192,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0f172a",
          color: "#e2e8f0",
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          width: "100%",
          borderRadius: 32,
        }}
      >
        MLP
      </div>
    ),
    {
      ...size,
    },
  );
}



