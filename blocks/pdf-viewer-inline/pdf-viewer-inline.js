export default function init(el) {
  const a = el.querySelector('a[href*=".pdf" i]');
  if (!a) return;
  const iframe = document.createElement('iframe');
  iframe.src = a.href;
  iframe.title = a.textContent.trim() || 'PDF';
  iframe.loading = 'lazy';
  a.setAttribute('download', '');
  const p = document.createElement('p');
  p.className = 'pdf-viewer-inline-download';
  p.append(a);
  el.replaceChildren(iframe, p);
}
