export function createStyleTransferFilename(now = new Date()) {
  return `siyuan-style-editor-styles-${now.toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
}

export function downloadStyleTransferDocument(content: string, now = new Date()) {
  if (typeof document === "undefined") {
    return;
  }

  const exportUrl = URL.createObjectURL(new Blob([content], {
    type: "application/json;charset=utf-8",
  }));
  const downloadLink = document.createElement("a");
  downloadLink.href = exportUrl;
  downloadLink.download = createStyleTransferFilename(now);
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(exportUrl);
}
