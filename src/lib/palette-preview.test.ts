import {
  buildCandidatePreviewStyle,
  getCandidatePreviewValue,
} from "@/lib/palette-preview";

describe("palette preview helpers", () => {
  it("applies a foreground candidate while keeping the target background", () => {
    expect(buildCandidatePreviewStyle({
      candidateValue: "#336699",
      channel: "color",
      fallbackTextColor: "var(--b3-theme-on-surface)",
      rule: {
        backgroundColor: "#fff5cc",
        color: "#222222",
        fontStyle: "italic",
        fontWeight: "700",
        textDecoration: "",
      },
    })).toEqual({
      backgroundColor: "#fff5cc",
      color: "#336699",
      fontStyle: "italic",
      fontWeight: "700",
      textDecoration: undefined,
    });
  });

  it("applies a background candidate while keeping the target color", () => {
    expect(buildCandidatePreviewStyle({
      candidateValue: "#111827",
      channel: "backgroundColor",
      fallbackTextColor: "var(--b3-theme-on-surface)",
      rule: {
        backgroundColor: "",
        color: "#e5e7eb",
        fontStyle: "",
        fontWeight: "",
        textDecoration: "underline",
      },
    })).toEqual({
      backgroundColor: "#111827",
      color: "#e5e7eb",
      fontStyle: undefined,
      fontWeight: undefined,
      textDecoration: "underline",
    });
  });

  it("uses the fallback text color when previewing a background without a saved text color", () => {
    expect(buildCandidatePreviewStyle({
      candidateValue: "var(--b3-font-background13)",
      channel: "backgroundColor",
      fallbackTextColor: "var(--b3-theme-on-surface)",
      rule: {
        backgroundColor: "",
        color: "",
        fontStyle: "",
        fontWeight: "",
        textDecoration: "",
      },
    }).color).toBe("var(--b3-theme-on-surface)");
  });

  it("formats candidate values for the card footer", () => {
    expect(getCandidatePreviewValue("color", "#336699")).toBe("字色: #336699");
    expect(getCandidatePreviewValue("backgroundColor", "")).toBe("底色: 恢复默认");
  });
});
