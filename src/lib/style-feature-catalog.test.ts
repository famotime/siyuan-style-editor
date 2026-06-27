import type { FeatureStyleProfile } from "@/lib/style-feature-catalog"
import {
  BODY_SAFE_FEATURE_OPTIONS,
  buildFeatureStyleCss,
  createDefaultFeatureProfile,
  EDITOR_UI_FEATURE_OPTIONS,
  FEATURE_STYLE_OPTIONS,

  normalizeFeatureProfile,
} from "@/lib/style-feature-catalog"

describe("style feature catalog", () => {
  it("creates disabled defaults for every configurable feature", () => {
    const profile = createDefaultFeatureProfile()

    expect(Object.keys(profile)).toEqual(FEATURE_STYLE_OPTIONS.map((option) => option.value))
    expect(profile.paragraphHover.enabled).toBe(false)
    expect(profile.paragraphHover.values.backgroundColor).toBe("rgba(111, 142, 207, 0.04)")
    expect(profile.imageRadius.values.radius).toBe(6)
    expect(profile.linkStyle.values.lineStyle).toBe("dashed")
    expect(profile.referencedBlockCorners.values.cornerLength).toBe(12)
    expect(profile.refcountBadge.values.hoverScale).toBe(1.15)
    expect(profile.foldedBlockStyle.values.opacity).toBe(0.85)
    expect(profile.editorBackground.values.backgroundColor).toBe("#222222")
    expect(profile.headingSpacing.values.headingTopMargin).toBe(0.5)
    expect(profile.unorderedListMarkerColor.values.markerColor).toBe("oklch(68% 0.07 245)")
    expect(profile.markStyle.values.backgroundColor).toBe("rgba(255, 212, 0, 0.14)")
    expect(profile.markStyle.values.emphasisThickness).toBe(2)
    expect(profile.inlineCodeStyle.values.color).toBe("#d19a66")
    expect(profile.inlineCodeStyle.values.radius).toBe(4)
    expect(profile.blockRefStyle.values.color).toBe("#6f8ecf")
    expect(profile.blockRefStyle.values.fontWeight).toBe(600)
    expect(profile.hrStyle.values.mode).toBe("gradient")
    expect(profile.hrStyle.values.height).toBe(2)
    expect(profile.headingDecoration.values.mode).toBe("leftBar")
    expect(profile.headingDecoration.values.barWidth).toBe(3)
    expect(profile.headingNumbering.enabled).toBe(false)
    expect(profile.listBulletLine.values.lineColor).toBe("rgb(70, 110, 220)")
    expect(profile.orderedListStyle.values.width).toBe(24)
    expect(profile.refSearchMenu.values.itemMinHeight).toBe(45)
    expect(profile.backlinkSticky.values.backgroundColor).toBe("var(--b3-list-hover, #363636)")
    expect(profile.documentTitle.values.fontSize).toBe(40)
    expect(profile.headImage.values.radius).toBe(6)
    expect(profile.docTag.values.secondaryBg).toBe("rgba(111, 142, 207, 0.12)")
    expect(profile.docTreeColorBlocks.values.color1).toBe("rgba(120, 90, 69, 0.85)")
    expect(profile.outlineNumber.values.fontSize).toBe(10)
    expect(profile.blockGutterAnim.values.transitionMs).toBe(150)
    expect(profile.toolbarStyle.values.buttonSize).toBe(28)
    expect(profile.slashMenu.values.columnWidth).toBe(180)
    expect(profile.emojiPanel.values.panelWidth).toBe(366)
    expect(profile.searchPanel.values.lineHeight).toBe(1.3)
  })

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
      foldedBlockStyle: {
        enabled: true,
        values: {
          borderColor: "#111111",
          opacity: "soft",
        },
      },
      headingSpacing: {
        enabled: true,
        values: {
          headingTopMargin: 1,
          headingBottomMargin: "wide",
        },
      },
      unorderedListMarkerColor: {
        enabled: true,
        values: {
          markerColor: 42,
        },
      },
      markStyle: {
        enabled: true,
        values: {
          emphasisThickness: 999,
          lineStyle: "invalid",
        },
      },
      inlineCodeStyle: {
        enabled: true,
        values: {
          radius: -5,
        },
      },
      blockRefStyle: {
        enabled: true,
        values: {
          fontWeight: 100,
          lineStyle: "wavy",
        },
      },
      hrStyle: {
        enabled: true,
        values: {
          mode: "unknown",
        },
      },
      headingDecoration: {
        enabled: true,
        values: {
          mode: "unknownMode",
          barWidth: 99,
        },
      },
      headingNumbering: {
        enabled: true,
        values: {},
      },
      listBulletLine: {
        enabled: true,
        values: {
          lineWidth: 0,
        },
      },
      orderedListStyle: {
        enabled: true,
        values: {
          showBackground: "invalid",
        },
      },
      refSearchMenu: {
        enabled: true,
        values: {
          maxHeight: "invalid",
        },
      },
      backlinkSticky: {
        enabled: true,
        values: {},
      },
    } as Partial<FeatureStyleProfile>)

    expect(profile.imageRadius.enabled).toBe(true)
    expect(profile.imageRadius.values.radius).toBe(14)
    expect(profile.linkStyle.values.lineStyle).toBe("dashed")
    expect(profile.paragraphHover.enabled).toBe(false)
    expect(profile.paragraphHover.values.backgroundColor).toBe("#eeeeee")
    expect(profile.paragraphHover.values.shadowStrength).toBe(0.05)
    expect(profile.referencedBlockCorners.enabled).toBe(true)
    expect(profile.referencedBlockCorners.values.cornerLength).toBe(32)
    expect(profile.referencedBlockCorners.values.strokeWidth).toBe(2)
    expect(profile.foldedBlockStyle.enabled).toBe(true)
    expect(profile.foldedBlockStyle.values.opacity).toBe(0.85)
    expect(profile.foldedBlockStyle.values.borderColor).toBe("#111111")
    expect(profile.headingSpacing.enabled).toBe(true)
    expect(profile.headingSpacing.values.headingTopMargin).toBe(1)
    expect(profile.headingSpacing.values.headingBottomMargin).toBe(0.1)
    expect(profile.unorderedListMarkerColor.enabled).toBe(true)
    expect(profile.unorderedListMarkerColor.values.markerColor).toBe("oklch(68% 0.07 245)")
    expect(profile.markStyle.enabled).toBe(true)
    expect(profile.markStyle.values.emphasisThickness).toBe(5)
    expect(profile.markStyle.values.lineStyle).toBe("solid")
    expect(profile.inlineCodeStyle.enabled).toBe(true)
    expect(profile.inlineCodeStyle.values.radius).toBe(0)
    expect(profile.blockRefStyle.enabled).toBe(true)
    expect(profile.blockRefStyle.values.fontWeight).toBe(400)
    expect(profile.blockRefStyle.values.lineStyle).toBe("dashed")
    expect(profile.hrStyle.enabled).toBe(true)
    expect(profile.hrStyle.values.mode).toBe("gradient")
    expect(profile.headingDecoration.enabled).toBe(true)
    expect(profile.headingDecoration.values.mode).toBe("leftBar")
    expect(profile.headingDecoration.values.barWidth).toBe(8)
    expect(profile.headingNumbering.enabled).toBe(true)
    expect(profile.listBulletLine.enabled).toBe(true)
    expect(profile.listBulletLine.values.lineWidth).toBe(1)
    expect(profile.orderedListStyle.enabled).toBe(true)
    expect(profile.orderedListStyle.values.showBackground).toBe("no")
    expect(profile.refSearchMenu.enabled).toBe(true)
    expect(profile.refSearchMenu.values.maxHeight).toBe("50vh")
    expect(profile.backlinkSticky.enabled).toBe(true)
  })

  it("builds configurable css for mark text style", () => {
    const profile = normalizeFeatureProfile({
      markStyle: {
        enabled: true,
        values: {
          backgroundColor: "rgba(255, 212, 0, 0.2)",
          color: "#ffffff",
          emphasisColor: "rgba(255, 200, 0, 0.9)",
          emphasisThickness: 3,
          lineStyle: "solid",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-type~=mark]')
    expect(css).toContain("color: #ffffff !important;")
    expect(css).toContain("background-color: rgba(255, 212, 0, 0.2) !important;")
    expect(css).toContain("border-bottom: 3px solid rgba(255, 200, 0, 0.9) !important;")
  })

  it("builds configurable css for inline code style", () => {
    const profile = normalizeFeatureProfile({
      inlineCodeStyle: {
        enabled: true,
        values: {
          backgroundColor: "rgba(100, 100, 100, 0.2)",
          color: "#ff9c9c",
          paddingX: 6,
          paddingY: 3,
          radius: 8,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-type~=code]')
    expect(css).toContain("color: #ff9c9c !important;")
    expect(css).toContain("background-color: rgba(100, 100, 100, 0.2) !important;")
    expect(css).toContain("padding: 3px 6px;")
    expect(css).toContain("border-radius: 8px;")
  })

  it("builds configurable css for block reference link style", () => {
    const profile = normalizeFeatureProfile({
      blockRefStyle: {
        enabled: true,
        values: {
          backgroundColor: "rgba(100, 150, 200, 0.15)",
          color: "rgb(130, 190, 255)",
          fontWeight: 700,
          lineColor: "rgba(130, 190, 255, 0.6)",
          lineStyle: "solid",
          lineThickness: 1.5,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-type~="block-ref"]')
    expect(css).toContain('[data-type~="file-annotation-ref"]')
    expect(css).toContain("color: rgb(130, 190, 255) !important;")
    expect(css).toContain("font-weight: 700;")
    expect(css).toContain("border-bottom: 1.5px solid rgba(130, 190, 255, 0.6) !important;")
  })

  it("builds configurable css for hr divider style in gradient mode", () => {
    const profile = normalizeFeatureProfile({
      hrStyle: {
        enabled: true,
        values: {
          colorLeft: "rgba(255, 0, 0, 0.5)",
          colorRight: "rgba(0, 0, 255, 0.5)",
          height: 3,
          mode: "gradient",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-node-id].hr > div:after')
    expect(css).toContain("height: 3px;")
    expect(css).toContain("linear-gradient(to right, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5))")
  })

  it("builds configurable css for hr divider style in line mode", () => {
    const profile = normalizeFeatureProfile({
      hrStyle: {
        enabled: true,
        values: {
          colorLeft: "#aaa",
          height: 2,
          lineStyle: "dashed",
          mode: "line",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-node-id].hr > div:after')
    expect(css).toContain("border-top: 2px dashed #aaa;")
  })

  it("builds configurable css for heading decoration in left bar mode", () => {
    const profile = normalizeFeatureProfile({
      headingDecoration: {
        enabled: true,
        values: {
          barColor: "#e53935",
          barWidth: 4,
          fontWeight: 700,
          mode: "leftBar",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-node-id].h1')
    expect(css).toContain("padding-left: 12px;")
    expect(css).toContain("font-weight: 700;")
    expect(css).toContain("background-color: #e53935;")
    expect(css).toContain("width: 4px;")
  })

  it("builds configurable css for heading decoration in underline mode", () => {
    const profile = normalizeFeatureProfile({
      headingDecoration: {
        enabled: true,
        values: {
          barColor: "rgba(44, 62, 80, 0.5)",
          barWidth: 2,
          fontWeight: 600,
          mode: "underline",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain("linear-gradient(to right, transparent, rgba(44, 62, 80, 0.5))")
    expect(css).toContain("height: 2px;")
  })

  it("builds css for heading numbering hide", () => {
    const profile = normalizeFeatureProfile({
      headingNumbering: {
        enabled: true,
        values: {},
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".h1::before")
    expect(css).toContain("content: none !important;")
    expect(css).toContain("display: none !important;")
  })

  it("builds configurable css for list bullet lines", () => {
    const profile = normalizeFeatureProfile({
      listBulletLine: {
        enabled: true,
        values: {
          lineColor: "#466edc",
          lineWidth: 2,
          radius: 8,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".block-focus")
    expect(css).toContain("border-left: 2px solid #466edc;")
    expect(css).toContain("border-bottom-left-radius: 8px;")
  })

  it("builds configurable css for ordered list styles", () => {
    const profile = normalizeFeatureProfile({
      orderedListStyle: {
        enabled: true,
        values: {
          showBackground: "yes",
          hoverBgColor: "rgba(100, 150, 200, 0.3)",
          width: 28,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('div[data-subtype="o"].list')
    expect(css).toContain("counter-reset:")
    expect(css).toContain("counter-increment: o2")
    expect(css).toContain("width: 28px;")
    expect(css).toContain("background-color: rgba(100, 150, 200, 0.3)")
  })

  it("builds configurable css for ref search menu", () => {
    const profile = normalizeFeatureProfile({
      refSearchMenu: {
        enabled: true,
        values: {
          hoverBgColor: "rgba(200, 200, 255, 0.2)",
          itemMinHeight: 50,
          maxHeight: "60vh",
          radius: 8,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".protyle-hint")
    expect(css).toContain("border-radius: 8px;")
    expect(css).toContain("max-height: 60vh;")
    expect(css).toContain("min-height: 50px;")
    expect(css).toContain("background-color: rgba(200, 200, 255, 0.2);")
  })

  it("builds configurable css for backlink sticky headers", () => {
    const profile = normalizeFeatureProfile({
      backlinkSticky: {
        enabled: true,
        values: {
          backgroundColor: "#363636",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".backlinkMList .b3-list-item")
    expect(css).toContain(".backlinkList .b3-list-item")
    expect(css).toContain("position: sticky;")
    expect(css).toContain("background-color: #363636;")
  })

  it("builds configurable css for document title", () => {
    const profile = normalizeFeatureProfile({
      documentTitle: {
        enabled: true,
        values: {
          fontSize: 48,
          placeholderColor: "#999999",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".protyle-title__input")
    expect(css).toContain("font-size: 48px;")
    expect(css).toContain(".protyle-title__input:empty:after")
    expect(css).toContain("color: #999999;")
  })

  it("builds configurable css for doc tree color blocks", () => {
    const profile = normalizeFeatureProfile({
      docTreeColorBlocks: {
        enabled: true,
        values: {
          color1: "rgba(120, 90, 69, 0.85)",
          radius: 8,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".sy__file .b3-list--background:nth-child(5n-4)")
    expect(css).toContain("background-color: rgba(120, 90, 69, 0.85) !important;")
    expect(css).toContain("border-radius: 8px;")
  })

  it("builds configurable css for outline number markers", () => {
    const profile = normalizeFeatureProfile({
      outlineNumber: {
        enabled: true,
        values: {
          fontSize: 12,
          h1Color: "red",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-subtype="h1"] > span:first-child::after')
    expect(css).toContain('content: "❶"')
    expect(css).toContain("color: red;")
    expect(css).toContain("font-size: 12px;")
  })

  it("builds configurable css for toolbar style", () => {
    const profile = normalizeFeatureProfile({
      toolbarStyle: {
        enabled: true,
        values: {
          buttonSize: 32,
          currentColor: "gold",
          hoverBg: "rgba(100, 100, 255, 0.3)",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".protyle-toolbar")
    expect(css).toContain("height: 32px;")
    expect(css).toContain("width: 32px;")
    expect(css).toContain("color: gold;")
  })

  it("builds configurable css for slash menu", () => {
    const profile = normalizeFeatureProfile({
      slashMenu: {
        enabled: true,
        values: {
          columnWidth: 200,
          radius: 10,
          textColor: "#eee",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".hint--menu")
    expect(css).toContain("border-radius: 10px;")
    expect(css).toContain("column-width: 200px;")
    expect(css).toContain("color: #eee;")
  })

  it("builds configurable css for emoji panel", () => {
    const profile = normalizeFeatureProfile({
      emojiPanel: {
        enabled: true,
        values: {
          emojiFontSize: 24,
          itemSize: 36,
          panelWidth: 400,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".emojis")
    expect(css).toContain("width: 400px !important;")
    expect(css).toContain(".emojis__item")
    expect(css).toContain("height: 36px;")
    expect(css).toContain("font-size: 24px;")
  })

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
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".protyle-wysiwyg .bq")
    expect(css).toContain("box-shadow: 0 0 0 1px rgb(235, 235, 235) inset !important;")
    expect(css).toContain("border-left: 0.25em solid rgb(180, 180, 180) !important;")
    expect(css).toContain(".protyle-wysiwyg img")
    expect(css).toContain("border-radius: 9px !important;")
    expect(css).not.toContain("paragraph hover")
  })

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
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".b3-typography blockquote")
    expect(css).toContain(".b3-typography .bq")
    expect(css).toContain(".protyle-wysiwyg blockquote")
    expect(css).toContain(".protyle-wysiwyg .bq")
    expect(css).toContain("padding: 4px;")
    expect(css).toContain("color: #4D4D4D !important;")
    expect(css).toContain("border-left: 0.25em solid #3D9140 !important;")
    expect(css).toContain("background-color: #FFFAFA !important;")
    expect(css).toContain("margin: 4px 0;")
  })

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
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".protyle-wysiwyg [data-node-id][refcount]")
    expect(css).toContain("width: 12px;")
    expect(css).toContain("height: 12px;")
    expect(css).toContain("border-top: 2px solid rgba(255, 165, 0, 0.7);")
    expect(css).toContain("border-right: 2px solid rgba(255, 165, 0, 0.7);")
    expect(css).toContain('[data-type="NodeBlockQueryEmbed"] [data-node-id][refcount]::before')
    expect(css).toContain("display: none;")
  })

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
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".protyle-attr--refcount")
    expect(css).toContain("height: 16px;")
    expect(css).toContain("width: 16px;")
    expect(css).toContain("background-color: oklch(50% 0.02 250 / 0.3);")
    expect(css).toContain("color: oklch(75% 0 0);")
    expect(css).toContain("border-radius: 3px;")
    expect(css).toContain("transform: scale(1.15);")
    expect(css).toContain("box-shadow: 0 0 10px oklch(70% 0.25 250 / 1);")
  })

  it("builds configurable css for folded block hints", () => {
    const profile = normalizeFeatureProfile({
      foldedBlockStyle: {
        enabled: true,
        values: {
          borderColor: "rgba(90, 90, 90, 0.6)",
          opacity: 0.85,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('div[fold="1"]:not(div[data-type="NodeListItem"])')
    expect(css).toContain('background-image: repeating-linear-gradient(')
    expect(css).toContain("border-radius: 5px;")
    expect(css).toContain("border: 1px solid rgba(90, 90, 90, 0.6);")
    expect(css).toContain("opacity: 0.85;")
    expect(css).toContain('[fold="1"]:hover')
  })

  it("builds configurable css for editor background", () => {
    const profile = normalizeFeatureProfile({
      editorBackground: {
        enabled: true,
        values: {
          backgroundColor: "#222222",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(":root")
    expect(css).toContain("--b3-theme-background: #222222;")
  })

  it("builds configurable css for heading spacing", () => {
    const profile = normalizeFeatureProfile({
      headingSpacing: {
        enabled: true,
        values: {
          headingBottomMargin: 0.1,
          headingTopMargin: 0.5,
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain(".protyle-wysiwyg > .h1")
    expect(css).toContain("margin-top: 0.5em;")
    expect(css).toContain("margin-bottom: 0.1em;")
    expect(css).toContain(".protyle-wysiwyg .protyle-wysiwyg__embed")
    expect(css).toContain(".bq > .h1")
  })

  it("builds configurable css for unordered list marker colors", () => {
    const profile = normalizeFeatureProfile({
      unorderedListMarkerColor: {
        enabled: true,
        values: {
          markerColor: "oklch(75% 0 0)",
        },
      },
    })

    const css = buildFeatureStyleCss(profile)

    expect(css).toContain('[data-subtype="u"] > .protyle-action')
    expect(css).toContain("color: oklch(75% 0 0);")
  })
  it("typographyBase — 正文排版", () => {
    const profile = normalizeFeatureProfile({
      typographyBase: {
        enabled: true,
        values: {
          fontSize: 17,
          lineHeight: 1.8,
          textIndent: 2,
          paragraphSpacing: 12,
          letterSpacing: 0.5,
        },
      },
    } as Partial<FeatureStyleProfile>)

    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("--b3-font-size: 17px")
    expect(css).toContain("--b3-font-line-height: 1.8")
    expect(css).toContain("text-indent: 2em")
    expect(css).toContain("margin-bottom: 12px")
    expect(css).toContain("letter-spacing: 0.5px")
  })

  it("editorWidth — 编辑器宽度", () => {
    const profile = normalizeFeatureProfile({
      editorWidth: {
        enabled: true,
        values: {
          maxWidth: 800,
          fullWidth: "no",
          contentPadding: 16,
        },
      },
    } as Partial<FeatureStyleProfile>)

    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("max-width: 800px")
    expect(css).toContain("padding-left: 16px")
    expect(css).toContain("padding-right: 16px")
  })

  it("fontFamily — 正文字体", () => {
    const profile = normalizeFeatureProfile({
      fontFamily: {
        enabled: true,
        values: {
          mainFont: "lxgw",
          codeFont: "jetbrains",
          customMainFont: "",
        },
      },
    } as Partial<FeatureStyleProfile>)

    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("--b3-font-family-protyle")
    expect(css).toContain("霞鹜文楷")
    expect(css).toContain("--b3-font-family-code")
    expect(css).toContain("JetBrains Mono")
  })

  it("topBarStyle — 顶栏样式", () => {
    const profile = normalizeFeatureProfile({
      topBarStyle: {
        enabled: true,
        values: {
          mode: "glass",
          blurRadius: 12,
          backgroundColor: "#ffffff",
          height: 40,
          borderBottom: "show",
        },
      },
    } as Partial<FeatureStyleProfile>)

    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("#toolbar")
    expect(css).toContain("backdrop-filter: blur(12px)")
    expect(css).toContain("height: 40px")
  })

  it("scrollbarStyle — 滚动条样式", () => {
    const profile = normalizeFeatureProfile({
      scrollbarStyle: {
        enabled: true,
        values: {
          width: 6,
          trackColor: "#f0f0f0",
          thumbColor: "#c0c0c0",
          thumbRadius: 4,
          hideMode: "hover",
        },
      },
    } as Partial<FeatureStyleProfile>)

    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("::-webkit-scrollbar")
    expect(css).toContain("width: 6px")
    expect(css).toContain("::-webkit-scrollbar-thumb")
    expect(css).toContain("::-webkit-scrollbar-track")
  })

  it("codeBlockStyle — 代码块外观", () => {
    const profile = normalizeFeatureProfile({
      codeBlockStyle: {
        enabled: true,
        values: {
          borderRadius: 8,
          backgroundColor: "#1e1e1e",
          headerBgColor: "#2d2d2d",
          maxHeight: "300px",
          lineNumberColor: "#858585",
        },
      },
    } as Partial<FeatureStyleProfile>)

    const css = buildFeatureStyleCss(profile)
    expect(css).toContain(".code-block")
    expect(css).toContain("border-radius: 8px")
    expect(css).toContain("max-height: 300px")
    expect(css).toContain(".protyle-linenumber")
  })

  it("boldTextStyle — 加粗文本样式", () => {
    const profile = normalizeFeatureProfile({
      boldTextStyle: {
        enabled: true,
        values: {
          color: "#ff0000",
          backgroundColor: "#ffff00",
          borderRadius: 4,
          fontWeight: 800,
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("strong, b")
    expect(css).toContain("color: #ff0000")
    expect(css).toContain("font-weight: 800")
  })

  it("tabBarStyle — 页签栏样式", () => {
    const profile = normalizeFeatureProfile({
      tabBarStyle: {
        enabled: true,
        values: {
          height: 36,
          fontSize: 14,
          activeIndicator: "background",
          indicatorColor: "#ff0000",
          backgroundColor: "#f5f5f5",
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain(".layout-tab-bar")
    expect(css).toContain("height: 36px")
    expect(css).toContain("font-size: 14px")
  })

  it("breadcrumbStyle — 面包屑样式", () => {
    const profile = normalizeFeatureProfile({
      breadcrumbStyle: {
        enabled: true,
        values: {
          textColor: "#333333",
          backgroundColor: "#fafafa",
          separatorColor: "#aaaaaa",
          fontSize: 13,
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain(".protyle-breadcrumb")
    expect(css).toContain("color: #333333")
    expect(css).toContain("font-size: 13px")
  })

  it("dockStyle — 停靠栏样式", () => {
    const profile = normalizeFeatureProfile({
      dockStyle: {
        enabled: true,
        values: {
          iconSize: 22,
          backgroundColor: "#f0f0f0",
          hoverColor: "#e0e0e0",
          width: 44,
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain(".dock")
    expect(css).toContain("width: 44px")
    expect(css).toContain(".dock__item")
  })

  it("imageRadius — 扩展：阴影和悬停效果", () => {
    const profile = normalizeFeatureProfile({
      imageRadius: {
        enabled: true,
        values: {
          radius: 8,
          shadow: "medium",
          hoverZoom: "slight",
          maxWidth: "80%",
          borderColor: "#cccccc",
          borderWidth: 1,
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("border-radius: 8px")
    expect(css).toContain("box-shadow")
    expect(css).toContain("transform: scale(1.02)")
    expect(css).toContain("max-width: 80%")
    expect(css).toContain("border: 1px")
  })

  it("searchHighlight — 搜索高亮色", () => {
    const profile = normalizeFeatureProfile({
      searchHighlight: {
        enabled: true,
        values: {
          matchColor: "#ffff00",
          currentMatchColor: "#ff0000",
          matchBorderRadius: 3,
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("search-mark")
    expect(css).toContain("background-color: #ffff00")
    expect(css).toContain("background-color: #ff0000")
    expect(css).toContain("border-radius: 3px")
  })

  it("dialogStyle — 对话框样式", () => {
    const profile = normalizeFeatureProfile({
      dialogStyle: {
        enabled: true,
        values: {
          borderRadius: 16,
          backdropBlur: 10,
          backdropOpacity: 0.6,
          shadowIntensity: "heavy",
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain(".b3-dialog__container")
    expect(css).toContain("border-radius: 16px")
    expect(css).toContain("backdrop-filter: blur(10px)")
    expect(css).toContain(".b3-dialog__scrim")
  })

  it("listMarkerStyle — 列表标记样式", () => {
    const profile = normalizeFeatureProfile({
      listMarkerStyle: {
        enabled: true,
        values: {
          unorderedStyle: "circle",
          orderedStyle: "upper-roman",
          itemSpacing: 6,
          indentation: 28,
        },
      },
    } as Partial<FeatureStyleProfile>)
    const css = buildFeatureStyleCss(profile)
    expect(css).toContain("list-style-type: circle")
    expect(css).toContain("list-style-type: upper-roman")
    expect(css).toContain("margin-bottom: 6px")
    expect(css).toContain("margin-left: 28px")
  })
})

describe("feature option filters", () => {
  it("splits options into body-safe and editor-UI groups", () => {
    expect(BODY_SAFE_FEATURE_OPTIONS.length + EDITOR_UI_FEATURE_OPTIONS.length).toBe(FEATURE_STYLE_OPTIONS.length)
    expect(BODY_SAFE_FEATURE_OPTIONS.every((option) => option.risk === "正文安全")).toBe(true)
    expect(EDITOR_UI_FEATURE_OPTIONS.every((option) => option.risk === "全屋改造")).toBe(true)
  })

  it("includes known body-safe features", () => {
    const values = BODY_SAFE_FEATURE_OPTIONS.map((option) => option.value)
    expect(values).toContain("paragraphHover")
    expect(values).toContain("imageRadius")
    expect(values).toContain("tableStyle")
    expect(values).toContain("linkStyle")
  })

  it("includes known editor-UI features", () => {
    const values = EDITOR_UI_FEATURE_OPTIONS.map((option) => option.value)
    expect(values).toContain("editorBackground")
    expect(values).toContain("headingNumbering")
    expect(values).toContain("blockGutterAnim")
    expect(values).toContain("slashMenu")
    expect(values).toContain("docTreeColorBlocks")
  })
})
