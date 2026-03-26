import { normalizeStyleProfile, type StyleProfile } from "@/lib/style-profile";
import { STYLE_TARGETS } from "@/lib/style-target-catalog";

const STYLE_TRANSFER_TYPE = "siyuan-style-editor-profile";
const STYLE_TRANSFER_VERSION = 1;

interface StyleTransferDocument {
  exportedAt: string;
  profile: StyleProfile;
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

function createTransferDocument(
  profile: Partial<StyleProfile>,
  exportedAt: string,
): StyleTransferDocument {
  return {
    exportedAt,
    profile: normalizeStyleProfile(profile),
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
  exportedAt = new Date().toISOString(),
): string {
  return JSON.stringify(createTransferDocument(profile, exportedAt), null, 2);
}

export function parseImportedStyleProfile(raw: string): StyleProfile {
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

  return normalizeStyleProfile(parsed.profile);
}
