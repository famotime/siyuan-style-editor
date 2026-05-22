import {
  buildFeatureStyleCss,
  createDefaultFeatureProfile,
  FEATURE_STYLE_OPTIONS,
  normalizeFeatureProfile,
  type FeatureStyleProfile,
} from "@/lib/style-feature-catalog";

describe("style feature catalog", () => {
  it("creates disabled defaults for every configurable feature", () => {
    const profile = createDefaultFeatureProfile();

    expect(Object.keys(profile)).toEqual(FEATURE_STYLE_OPTIONS.map(option => option.value));
    expect(profile.paragraphHover.enabled).toBe(false);
    expect(profile.paragraphHover.values.backgroundColor).toBe("hsla(0, 0%, 77%, 0.035)");
    expect(profile.imageRadius.values.radius).toBe(6);
    expect(profile.linkStyle.values.lineStyle).toBe("dashed");
    expect(profile.referencedBlockCorners.values.cornerLength).toBe(12);
    expect(profile.refcountBadge.values.hoverScale).toBe(1.15);
  });

  it("normalizes partial and invalid feature profile input", () => {
    const profile = normalizeFeatureProfile({
      imageRadius: {
        enabled: true,
        values: {
          radius: 14,
        },
      },
      linkStyle: {
        enabled: true,
        values: {
          lineStyle: "wavy",
        },
      },
      paragraphHover: {
        values: {
          backgroundColor: "#eeeeee",
          shadowStrength: "loud",
        },
      },
      referencedBlockCorners: {
        enabled: true,
        values: {
          cornerLength: 128,
          strokeWidth: "wide",
        },
      },
    } as Partial<FeatureStyleProfile>);

    expect(profile.imageRadius.enabled).toBe(true);
    expect(profile.imageRadius.values.radius).toBe(14);
    expect(profile.linkStyle.values.lineStyle).toBe("dashed");
    expect(profile.paragraphHover.enabled).toBe(false);
    expect(profile.paragraphHover.values.backgroundColor).toBe("#eeeeee");
    expect(profile.paragraphHover.values.shadowStrength).toBe(0.05);
    expect(profile.referencedBlockCorners.enabled).toBe(true);
    expect(profile.referencedBlockCorners.values.cornerLength).toBe(32);
    expect(profile.referencedBlockCorners.values.strokeWidth).toBe(2);
  });

  it("builds css only for enabled features", () => {
    const profile = normalizeFeatureProfile({
      blockquoteFrame: {
        enabled: true,
        values: {
          borderColor: "rgb(235, 235, 235)",
          lineColor: "rgb(180, 180, 180)",
          radius: 5,
        },
      },
      imageRadius: {
        enabled: true,
        values: {
          radius: 9,
        },
      },
    });

    const css = buildFeatureStyleCss(profile);

    expect(css).toContain(".protyle-wysiwyg .bq");
    expect(css).toContain("box-shadow: 0 0 0 1px rgb(235, 235, 235) inset !important;");
    expect(css).toContain("border-left: 0.25em solid rgb(180, 180, 180) !important;");
    expect(css).toContain(".protyle-wysiwyg img:not(.av__gallery-img)");
    expect(css).toContain("border-radius: 9px !important;");
    expect(css).not.toContain("paragraph hover");
  });

  it("maps the reference blockquote style into configurable css", () => {
    const profile = normalizeFeatureProfile({
      blockquoteFrame: {
        enabled: true,
        values: {
          backgroundColor: "#FFFAFA",
          borderColor: "#3D9140",
          color: "#4D4D4D",
          lineColor: "#3D9140",
          marginY: 4,
          padding: 4,
          radius: 0,
        },
      },
    });

    const css = buildFeatureStyleCss(profile);

    expect(css).toContain(".b3-typography blockquote");
    expect(css).toContain(".b3-typography .bq");
    expect(css).toContain(".protyle-wysiwyg blockquote");
    expect(css).toContain(".protyle-wysiwyg .bq");
    expect(css).toContain("padding: 4px;");
    expect(css).toContain("color: #4D4D4D !important;");
    expect(css).toContain("border-left: 0.25em solid #3D9140 !important;");
    expect(css).toContain("background-color: #FFFAFA !important;");
    expect(css).toContain("margin: 4px 0;");
  });

  it("builds configurable css for referenced block corner markers", () => {
    const profile = normalizeFeatureProfile({
      referencedBlockCorners: {
        enabled: true,
        values: {
          color: "rgba(255, 165, 0, 0.7)",
          cornerLength: 12,
          strokeWidth: 2,
        },
      },
    });

    const css = buildFeatureStyleCss(profile);

    expect(css).toContain(".protyle-wysiwyg [data-node-id][refcount]");
    expect(css).toContain("width: 12px;");
    expect(css).toContain("height: 12px;");
    expect(css).toContain("border-top: 2px solid rgba(255, 165, 0, 0.7);");
    expect(css).toContain("border-right: 2px solid rgba(255, 165, 0, 0.7);");
    expect(css).toContain('[data-type="NodeBlockQueryEmbed"] [data-node-id][refcount]::before');
    expect(css).toContain("display: none;");
  });

  it("builds configurable css for refcount badges", () => {
    const profile = normalizeFeatureProfile({
      refcountBadge: {
        enabled: true,
        values: {
          backgroundColor: "oklch(50% 0.02 250 / 0.3)",
          color: "oklch(75% 0 0)",
          glowColor: "oklch(70% 0.25 250 / 1)",
          hoverBackgroundColor: "oklch(60% 0.15 250 / 0.95)",
          hoverScale: 1.15,
          radius: 3,
          size: 16,
        },
      },
    });

    const css = buildFeatureStyleCss(profile);

    expect(css).toContain(".protyle-attr--refcount");
    expect(css).toContain("height: 16px;");
    expect(css).toContain("width: 16px;");
    expect(css).toContain("background-color: oklch(50% 0.02 250 / 0.3);");
    expect(css).toContain("color: oklch(75% 0 0);");
    expect(css).toContain("border-radius: 3px;");
    expect(css).toContain("transform: scale(1.15);");
    expect(css).toContain("box-shadow: 0 0 10px oklch(70% 0.25 250 / 1);");
  });
});
