import type { FeatureDefinition } from "./feature-style-types"
import { ELEMENTS_DEFINITIONS } from "./definitions/elements"
import { THEME_DEFINITIONS } from "./definitions/theme"
import { TYPOGRAPHY_DEFINITIONS } from "./definitions/typography"

// 将所有定义合并入一个 Map 中，以支持按指定顺序进行拼装
const allDefinitionsMap = [
  ...ELEMENTS_DEFINITIONS,
  ...TYPOGRAPHY_DEFINITIONS,
  ...THEME_DEFINITIONS,
].reduce((map, def) => {
  map[def.value] = def
  return map
}, {} as Record<string, FeatureDefinition>)

// 严格按照原数组中的 value 顺序配置，以规避可能因顺序变化造成的内部索引匹配或导出不兼容的隐藏风险
const DEFINITION_KEYS = [
  "paragraphHover",
  "foldedBlockStyle",
  "editorBackground",
  "headingSpacing",
  "headingDecoration",
  "headingNumbering",
  "unorderedListMarkerColor",
  "listBulletLine",
  "orderedListStyle",
  "blockquoteFrame",
  "referencedBlockCorners",
  "refcountBadge",
  "refSearchMenu",
  "backlinkSticky",
  "imageRadius",
  "tableStyle",
  "markStyle",
  "inlineCodeStyle",
  "blockRefStyle",
  "hrStyle",
  "linkStyle",
  "underlineStyle",
  "strikethroughStyle",
  "taskListStyle",
  "documentTitle",
  "headImage",
  "docTag",
  "docTreeColorBlocks",
  "outlineNumber",
  "blockGutterAnim",
  "toolbarStyle",
  "slashMenu",
  "emojiPanel",
  "searchPanel",
  "typographyBase",
  "editorWidth",
  "fontFamily",
  "topBarStyle",
  "scrollbarStyle",
  "codeBlockStyle",
  "boldTextStyle",
  "tabBarStyle",
  "breadcrumbStyle",
  "dockStyle",
  "searchHighlight",
  "dialogStyle",
  "listMarkerStyle",
  "customThemePrimary",
  "layoutCompactMode",
] as const

export const FEATURE_DEFINITIONS: FeatureDefinition[] = DEFINITION_KEYS.map((key) => {
  const def = allDefinitionsMap[key]
  if (!def) {
    throw new Error(`Missing feature style definition for key: ${key}`)
  }
  return def
})
