// Copying through navigator.clipboard needs a secure, focused document; previews
// and iframes often refuse it. The copy event below still carries the payload.
export async function copyText(value) {
  const text = String(value ?? '');
  if (!text) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fall through to the selection-based copy
  }

  try {
    let handled = false;
    const onCopy = (event) => {
      event.clipboardData?.setData('text/plain', text);
      event.preventDefault();
      handled = true;
    };
    // the listener supplies the text, so nothing on the page has to be selected
    document.addEventListener('copy', onCopy, true);
    const ok = document.execCommand('copy');
    document.removeEventListener('copy', onCopy, true);
    return handled || ok;
  } catch {
    return false;
  }
}
