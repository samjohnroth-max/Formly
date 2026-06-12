import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
          background: "#0F4C8F",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 20,
            height: 20,
            gap: 2,
          }}
        >
          {[1, 0.55, 0.55, 0.55].map((opacity, i) => (
            <div
              key={i}
              style={{
                width: 9,
                height: 9,
                background: `rgba(255, 255, 255, ${opacity})`,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { width: 32, height: 32 }
  );
}
