/**
 * Cards Therapy
 * Grid of therapy-area cards: top image, centered heading, description and a list of links.
 *
 * Content contract (DA table, one row per card):
 *   | Cards Therapy                                         |
 *   | <image> | <h3|h4> <p>description</p> <p>intro:</p> <p>link<br>link<br>link</p> |
 *
 * Image and body cells may come in either order; a row with only text renders without an image.
 * The <br>-separated link paragraph becomes ul.cards-therapy-card-links (one link per li); the
 * paragraph before it ending in ":" becomes .cards-therapy-card-links-intro, and is split out of
 * the description when an author merged it in with a <br>.
 */

// No authorable options yet; unknown classes on the block are ignored.
const OPTION_CLASSES = [];

function isImageCell(cell) {
  const pics = cell.querySelectorAll('picture');
  if (pics.length !== 1) return false;
  // Image-only cell: nothing but the picture (optionally wrapped in a <p>/<a>).
  return cell.textContent.trim() === '';
}

const squash = (str) => str.replace(/\s+/g, '');

function isLinksOnly(el) {
  const links = el.querySelectorAll('a');
  if (!links.length) return false;
  return squash(el.textContent) === squash([...links].map((a) => a.textContent).join(''));
}

/**
 * Authors sometimes merge the intro line for the link list ("Mehr Informationen zu ...:")
 * into the description with a <br>. Split the text after the last <br> into its own <p>
 * when it ends with a colon, so it can be styled as the link-list intro.
 */
function splitMergedIntro(p) {
  const brs = [...p.querySelectorAll(':scope > br')];
  const lastBr = brs.at(-1);
  if (!lastBr) return null;
  const nodes = [...p.childNodes];
  const tail = nodes.slice(nodes.indexOf(lastBr) + 1);
  const tailText = tail.map((n) => n.textContent).join('').trim();
  if (!tailText.endsWith(':') || tail.some((n) => n.nodeName === 'A')) return null;
  const intro = document.createElement('p');
  intro.append(...tail);
  if (intro.firstChild?.nodeType === Node.TEXT_NODE) {
    intro.firstChild.textContent = intro.firstChild.textContent.trimStart();
  }
  lastBr.remove();
  p.after(intro);
  return intro;
}

/** Turn a paragraph of <br>-separated links into a <ul> with one link per item. */
function toLinkList(p) {
  const ul = document.createElement('ul');
  ul.className = 'cards-therapy-card-links';
  p.querySelectorAll('a').forEach((a) => {
    const li = document.createElement('li');
    li.append(a);
    ul.append(li);
  });
  p.replaceWith(ul);
  return ul;
}

function decorateBody(body) {
  body.className = 'cards-therapy-card-body';
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('cards-therapy-card-heading');

  // Drop empty spacer paragraphs (e.g. &nbsp; lines carried over from the source).
  body.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('picture, img, a')) p.remove();
  });

  // Paragraphs consisting only of links (optionally separated by <br>) become the link list;
  // an authored list made of links only is kept as a list.
  let firstList = null;
  body.querySelectorAll(':scope > p, :scope > ul').forEach((el) => {
    if (!isLinksOnly(el)) return;
    let list = el;
    if (el.tagName === 'P') list = toLinkList(el);
    else el.classList.add('cards-therapy-card-links');
    firstList ??= list;
  });

  // The paragraph right before the link list is its intro line ("... folgenden Indikationen:").
  if (firstList) {
    let prev = firstList.previousElementSibling;
    // Merged form: "description<br> intro:" in one <p> - split the intro line off first.
    if (prev?.tagName === 'P') prev = splitMergedIntro(prev) || prev;
    if (prev?.tagName === 'P' && prev.textContent.trim().endsWith(':')) {
      prev.classList.add('cards-therapy-card-links-intro');
    }
  }

  // Everything else that is plain text is description.
  body.querySelectorAll(':scope > p:not([class])').forEach((p) => {
    p.classList.add('cards-therapy-card-description');
  });
}

export default function init(el) {
  const active = [...el.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) el.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  ul.className = 'cards-therapy-list';

  [...el.querySelectorAll(':scope > div')].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-therapy-card';
    const cells = [...row.children];
    const imageCell = cells.find(isImageCell);
    const bodyCells = cells.filter((cell) => cell !== imageCell && cell.textContent.trim());

    if (imageCell) {
      imageCell.className = 'cards-therapy-card-image';
      const pic = imageCell.querySelector('picture');
      // Unwrap the picture from any <p> so it sits directly in the image cell.
      imageCell.replaceChildren(pic);
      li.append(imageCell);
    } else {
      li.classList.add('no-image');
    }

    if (bodyCells.length) {
      const [body, ...rest] = bodyCells;
      rest.forEach((cell) => body.append(...cell.childNodes));
      decorateBody(body);
      li.append(body);
    }

    if (li.children.length) ul.append(li);
  });

  el.replaceChildren(ul);
}
