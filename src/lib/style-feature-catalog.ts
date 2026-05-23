import { FEATURE_DEFINITIONS } from "./feature-style-definitions";

import type {
  FeatureStyleConfig,
  FeatureStyleControl,
  FeatureStyleId,
  FeatureStyleOption,
  FeatureStyleProfile,
} from "./feature-style-types";

export type {
  FeatureStyleConfig,
  FeatureStyleControl,
  FeatureStyleId,
  FeatureStyleOption,
  FeatureStyleProfile,
} from "./feature-style-types";

export { FEATURE_DEFINITIONS } from "./feature-style-definitions";

const FEATURE_DEFINITION_MAP = FEATURE_DEFINITIONS.reduce((map, definition) => {
  map[definition.value] = definition;
  return map;
}, {} as Record<FeatureStyleId, typeof FEATURE_DEFINITIONS[number]>);

export const FEATURE_STYLE_IDS = FEATURE_DEFINITIONS.map(definition => definition.value);

export const FEATURE_STYLE_OPTIONS: FeatureStyleOption[] = FEATURE_DEFINITIONS.map(({
  buildCss,
  defaults,
  ...option
}) => option);

export const BODY_SAFE_FEATURE_OPTIONS = FEATURE_STYLE_OPTIONS.filter(option => option.risk === "正文安全");

export const EDITOR_UI_FEATURE_OPTIONS = FEATURE_STYLE_OPTIONS.filter(option => option.risk === "全屋改造");

function cloneConfig(config: FeatureStyleConfig): FeatureStyleConfig {
  return {
    enabled: config.enabled,
    values: {
      ...config.values,
    },
  };
}

function normalizeControlValue(
  control: FeatureStyleControl,
  inputValue: unknown,
  fallbackValue: string | number | boolean,
): string | number | boolean {
  if (control.type === "number") {
    if (typeof inputValue !== "number" || !Number.isFinite(inputValue)) {
      return fallbackValue;
    }

    const min = control.min ?? Number.NEGATIVE_INFINITY;
    const max = control.max ?? Number.POSITIVE_INFINITY;
    return Math.min(max, Math.max(min, inputValue));
  }

  if (control.type === "select") {
    if (typeof inputValue !== "string") {
      return fallbackValue;
    }

    return control.options?.some(option => option.value === inputValue) ? inputValue : fallbackValue;
  }

  return typeof inputValue === "string" ? inputValue : fallbackValue;
}

export function createDefaultFeatureProfile(): FeatureStyleProfile {
  return FEATURE_DEFINITIONS.reduce((profile, definition) => {
    profile[definition.value] = cloneConfig(definition.defaults);
    return profile;
  }, {} as FeatureStyleProfile);
}

export function normalizeFeatureProfile(input?: Partial<FeatureStyleProfile> | null): FeatureStyleProfile {
  const profile = createDefaultFeatureProfile();
  if (!input || typeof input !== "object") {
    return profile;
  }

  for (const definition of FEATURE_DEFINITIONS) {
    const rawConfig = input[definition.value];
    if (!rawConfig || typeof rawConfig !== "object") {
      continue;
    }

    const rawValues = rawConfig.values && typeof rawConfig.values === "object" ? rawConfig.values : {};
    const values = {
      ...definition.defaults.values,
    };

    for (const control of definition.controls) {
      values[control.key] = normalizeControlValue(
        control,
        (rawValues as Record<string, unknown>)[control.key],
        definition.defaults.values[control.key],
      );
    }

    profile[definition.value] = {
      enabled: rawConfig.enabled === true,
      values,
    };
  }

  return profile;
}

export function getFeatureStyleOption(featureId: FeatureStyleId): FeatureStyleOption {
  const {
    buildCss,
    defaults,
    ...option
  } = FEATURE_DEFINITION_MAP[featureId];
  return option;
}

export function buildFeatureStyleCss(input?: Partial<FeatureStyleProfile> | null): string {
  const profile = normalizeFeatureProfile(input);

  return FEATURE_DEFINITIONS.flatMap((definition) => {
    const config = profile[definition.value];
    if (!config.enabled) {
      return [];
    }

    return definition.buildCss(config);
  }).join("\n\n");
}
