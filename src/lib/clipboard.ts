// bulletproof clipboard copy with deep webview & mobile fallback
export async function copyToClipboard(text: string): Promise<boolean>
{
  if (!text)
    return false;

  // 1. try modern async clipboard api in secure contexts
  try
  {
    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText)
    {
      await navigator.clipboard.writeText(text);
      return true;
    }
  }
  catch
  {
    // continue to fallback
  }

  // 2. legacy execCommand fallback for webviews (whatsapp, instagram, wechat, safari)
  try
  {
    if (typeof document !== "undefined")
    {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.fontSize = "16px"; // prevents mobile safari auto-zoom
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // required for ios mobile webkit

      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  }
  catch
  {
    // copy failed
  }

  return false;
}
