import type {
  FeatureStyleControl,
  FeatureStyleControlOption,
} from "../feature-style-types"

export function colorControl(key: string, label: string): FeatureStyleControl {
  return {
    key,
    label,
    type: "color",
  }
}

interface NumberControlRange {
  max?: number
  min?: number
  slider?: boolean
  step?: number
  unit?: string
}

export function numberControl(key: string, label: string, range: NumberControlRange): FeatureStyleControl {
  return {
    key,
    label,
    ...(range.max === undefined ? {} : { max: range.max }),
    ...(range.min === undefined ? {} : { min: range.min }),
    ...(range.slider === undefined ? {} : { slider: range.slider }),
    ...(range.step === undefined ? {} : { step: range.step }),
    type: "number",
    ...(range.unit === undefined ? {} : { unit: range.unit }),
  }
}

export function selectControl(key: string, label: string, options: FeatureStyleControlOption[]): FeatureStyleControl {
  return {
    key,
    label,
    options,
    type: "select",
  }
}

export function textControl(key: string, label: string, placeholder?: string): FeatureStyleControl {
  return {
    key,
    label,
    ...(placeholder === undefined ? {} : { placeholder }),
    type: "text",
  }
}
