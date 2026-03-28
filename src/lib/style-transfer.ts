import { normalizeStyleProfile, type StyleProfile } from "@/lib/style-profile";
import { STYLE_TARGETS } from "@/lib/style-target-catalog";

const STYLE_TRANSFER_TYPE = "siyuan-style-editor-profile";
const STYLE_TRANSFER_VERSION = 1;
export const DEFAULT_STYLE_TRANSFER_AUTHOR = "无名";
export const DEFAULT_STYLE_TRANSFER_NAME = "无名样式";

export interface StyleTransferMetadata {
  author: string;
  styleName: string;
}

interface StyleTransferDocument {
  author: string;
  exportedAt: string;
  profile: StyleProfile;
  styleName: string;
  type: typeof STYLE_TRANSFER_TYPE;
  version: typeof STYLE_TRANSFER_VERSION;
}

export interface StyleTransferSummary {
  styledTargetCount: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasProfile(value: unknown): value is { profile: Partial<StyleProfile> } {
  return isObject(value) && isObject(value.profile);
}

function normalizeTransferMetadata(input?: Partial<StyleTransferMetadata> | null): StyleTransferMetadata {
  const author = input?.author?.trim() || DEFAULT_STYLE_TRANSFER_AUTHOR;
  const styleName = input?.styleName?.trim() || DEFAULT_STYLE_TRANSFER_NAME;

  return {
    author,
    styleName,
  };
}

function createTransferDocument(
  profile: Partial<StyleProfile>,
  metadata: StyleTransferMetadata,
  exportedAt: string,
): StyleTransferDocument {
  return {
    author: metadata.author,
    exportedAt,
    profile: normalizeStyleProfile(profile),
    styleName: metadata.styleName,
    type: STYLE_TRANSFER_TYPE,
    version: STYLE_TRANSFER_VERSION,
  };
}

export function countStyledTargets(profile: Partial<StyleProfile>): number {
  const normalizedProfile = normalizeStyleProfile(profile);

  return STYLE_TARGETS.reduce((count, target) => {
    const rule = normalizedProfile[target];
    const hasExplicitStyle = Object.values(rule).some(value => Boolean(value));
    return hasExplicitStyle ? count + 1 : count;
  }, 0);
}

export function serializeStyleProfileTransfer(
  profile: Partial<StyleProfile>,
  metadata: StyleTransferMetadata,
  exportedAt = new Date().toISOString(),
): string {
  return JSON.stringify(
    createTransferDocument(profile, normalizeTransferMetadata(metadata), exportedAt),
    null,
    2,
  );
}

export function parseImportedStyleTransfer(raw: string): {
  metadata: StyleTransferMetadata;
  profile: StyleProfile;
} {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  }
  catch {
    throw new Error("样式配置文件不是有效的 JSON。");
  }

  if (!isObject(parsed)) {
    throw new Error("样式配置文件缺少可导入的 profile 字段。");
  }

  if ("type" in parsed && parsed.type !== STYLE_TRANSFER_TYPE) {
    throw new Error("样式配置文件格式不受支持。");
  }

  if ("version" in parsed && parsed.version !== STYLE_TRANSFER_VERSION) {
    throw new Error("样式配置文件版本不受支持。");
  }

  if (!hasProfile(parsed)) {
    throw new Error("样式配置文件缺少可导入的 profile 字段。");
  }

  const metadata = normalizeTransferMetadata(parsed);

  return {
    metadata,
    profile: normalizeStyleProfile(parsed.profile),
  };
}

export function parseImportedStyleProfile(raw: string): StyleProfile {
  return parseImportedStyleTransfer(raw).profile;
}
