/**
 * Hero Banner
 * Full-bleed background image with a heading and short intro text on top.
 *
 * Content contract (DA table):
 *   | Hero Banner        |
 *   | <background image> |   (optional)
 *   | <h1> <p>           |
 */

// No authorable options yet; unknown classes on the block are ignored.
const OPTION_CLASSES = [];
const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function setBackgroundFocus(img) {
  const { title } = img.dataset;
  if (!title?.includes('data-focal')) return;
  delete img.dataset.title;
  const [x, y] = title.split(':')[1].split(',');
  img.style.objectPosition = `${x}% ${y}%`;
}

function decorateBackground(bg) {
  bg.classList.add('hero-banner-background');
  const img = bg.querySelector('picture img');
  if (!img) return;
  setBackgroundFocus(img);
  img.loading = 'eager';
  img.fetchPriority = 'high';
}

function decorateForeground(fg, extraRows) {
  fg.classList.add('hero-banner-foreground');
  const content = fg.querySelector(':scope > div') || fg;
  content.classList.add('hero-banner-content');

  // Tolerate authors splitting text across several rows: merge into one foreground.
  extraRows.forEach((row) => {
    [...row.querySelectorAll(':scope > div')].forEach((cell) => content.append(...cell.childNodes));
    row.remove();
  });

  const heading = content.querySelector(HEADINGS);
  if (heading) heading.classList.add('hero-banner-heading');
}

export default function init(el) {
  const active = [...el.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) el.dataset.options = active.join(' ');

  const rows = [...el.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // Background row = a row with a picture but no heading.
  const bgRow = rows.find((row) => row.querySelector('picture') && !row.querySelector(HEADINGS));
  const fgRows = rows.filter((row) => row !== bgRow);

  if (bgRow) {
    decorateBackground(bgRow);
  } else {
    el.classList.add('no-image');
  }

  const [fg, ...extra] = fgRows;
  if (fg) decorateForeground(fg, extra);
}
