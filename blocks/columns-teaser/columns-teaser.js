/**
 * Columns Teaser
 * Two-column teaser: text + call-to-action on one side, a large image on the other (50/50).
 *
 * Content contract (DA table):
 *   | Columns Teaser                         |
 *   | <p>text</p> <p><a>CTA</a></p> | <image> |
 *
 * Cell order is respected (image may be left or right). Extra rows render as additional teasers.
 */

// No authorable options yet; unknown classes on the block are ignored.
const OPTION_CLASSES = [];

function isImageCell(cell) {
  return !!cell.querySelector('picture') && cell.textContent.trim() === '';
}

function decorateText(cell) {
  cell.classList.add('columns-teaser-text');
  // The last paragraph made only of link(s) is the CTA; pin it to the bottom of the column.
  const paras = [...cell.querySelectorAll(':scope > p')];
  const cta = paras.reverse().find((p) => {
    const links = p.querySelectorAll('a');
    if (!links.length) return false;
    const linkText = [...links].map((a) => a.textContent).join('').replace(/\s+/g, '');
    return p.textContent.replace(/\s+/g, '') === linkText;
  });
  if (!cta || cta === cell.firstElementChild) return;
  cta.classList.add('columns-teaser-cta');
  // Authors (and the importer) write the CTA as a plain link; Author Kit only buttonizes
  // em/strong/del/u-wrapped links, so render a plain CTA link as the primary button here.
  // Links the author already styled (ak.js added .btn) keep their own button flavor.
  const links = [...cta.querySelectorAll('a')];
  links.forEach((a) => {
    if (!a.classList.contains('btn')) a.classList.add('btn', 'btn-primary');
  });
  if (links.length > 1) cta.classList.add('btn-group');
}

function decorateImage(cell) {
  cell.classList.add('columns-teaser-image');
  const pic = cell.querySelector('picture');
  cell.replaceChildren(pic);
}

export default function init(el) {
  const active = [...el.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) el.dataset.options = active.join(' ');

  [...el.querySelectorAll(':scope > div')].forEach((row) => {
    row.classList.add('columns-teaser-row');
    // Drop empty cells authors may leave behind.
    const hasContent = (cell) => cell.children.length || cell.textContent.trim();
    const cells = [...row.children].filter(hasContent);
    [...row.children].forEach((cell) => { if (!cells.includes(cell)) cell.remove(); });
    row.style.setProperty('--columns-teaser-count', cells.length);

    cells.forEach((cell, idx) => {
      cell.classList.add('columns-teaser-col', `columns-teaser-col-${idx + 1}`);
      if (isImageCell(cell)) {
        decorateImage(cell);
        row.classList.add(idx === 0 ? 'image-start' : 'image-end');
      } else {
        decorateText(cell);
      }
    });
  });
}
