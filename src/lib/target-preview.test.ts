import {
  buildChannelSwatchStyle,
  buildTargetPreviewStyle,
} from "@/lib/target-preview";

describe("target preview helpers", () => {
  it("keeps strong text bold by default", () => {
    expect(buildTargetPreviewStyle(
      "strong",
      {
        backgroundColor: "",
        color: "",
        fontStyle: "",
        fontWeight: "",
        textDecoration: "",
      },
      "var(--panel-text)",
    )).toEqual({
      backgroundColor: undefined,
      color: "var(--panel-text)",
      fontStyle: undefined,
      fontWeight: "700",
      textDecoration: undefined,
    });
  });

  it("uses the configured style values for the preview card", () => {
    expect(buildTargetPreviewStyle(
      "heading2",
      {
        backgroundColor: "#fff1c2",
        color: "#334155",
        fontStyle: "italic",
        fontWeight: "600",
        textDecoration: "underline",
      },
      "var(--panel-text)",
    )).toEqual({
      backgroundColor: "#fff1c2",
      color: "#334155",
      fontStyle: "italic",
      fontWeight: "600",
      textDecoration: "underline",
    });
  });

  it("builds a visible swatch even when the channel is unset", () => {
    expect(buildChannelSwatchStyle("", "var(--panel-text)")).toEqual({
      background: "var(--panel-text)",
      isEmpty: true,
    });
  });

  it("uses the actual channel value for a configured swatch", () => {
    expect(buildChannelSwatchStyle("#60a5fa", "var(--panel-text)")).toEqual({
      background: "#60a5fa",
      isEmpty: false,
    });
  });
});
