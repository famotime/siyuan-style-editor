import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleRule } from "@/lib/style-profile";

interface BuildCandidatePreviewStyleOptions {
  candidateValue: string;
  channel: PaintChannel;
  fallbackTextColor: string;
  rule: StyleRule;
}

export function buildCandidatePreviewStyle({
  candidateValue,
  channel,
  fallbackTextColor,
  rule,
}: BuildCandidatePreviewStyleOptions) {
  const nextColor = channel === "color"
    ? candidateValue || undefined
    : rule.color || fallbackTextColor;
  const nextBackgroundColor = channel === "backgroundColor"
    ? candidateValue || undefined
    : rule.backgroundColor || undefined;

  return {
    color: nextColor,
    backgroundColor: nextBackgroundColor,
    fontWeight: rule.fontWeight || undefined,
    fontStyle: rule.fontStyle || undefined,
    textDecoration: rule.textDecoration || undefined,
  };
}

export function getCandidatePreviewValue(channel: PaintChannel, value: string) {
  const label = channel === "backgroundColor" ? "底色" : "字色";
  return `${label}: ${value || "恢复默认"}`;
}
