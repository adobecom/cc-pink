import { getLibs } from '../../scripts/utils.js';

export function decorateText(el) {
  if (!el) return;
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const heading = headings[headings.length - 1];
  heading.classList.add('heading-xl');
  heading.nextElementSibling?.classList.add('body-m');
  heading.previousElementSibling?.classList.add('detail-m');
}

export function extendButtonsClass(text) {
  text?.querySelectorAll('.con-button').forEach((button) => {
    button.classList.add('button-justified-mobile');
  });
}

export async function decorateFeatures(paragraphs, parentEl, lastChild, createTag) {
  if (!paragraphs?.length || !parentEl || !lastChild) return;

  const mnemonicList = createTag('div', { class: 'mnemonic-list' });
  const productList = createTag('div', { class: 'product-list' });
  [...paragraphs].forEach((paragraph) => {
    const title = paragraph.querySelector('strong');
    const picture = paragraph.querySelector('picture');
    const product = createTag('div', { class: 'product-item' });
    if (picture) product.appendChild(picture);
    if (title) product.appendChild(title);
    productList.appendChild(product);
    paragraph.replaceWith(productList);
  });
  mnemonicList.appendChild(productList);
  parentEl.insertBefore(mnemonicList, lastChild);
}

export function appendFeatures(el, foreground, text, promiseArr, getConfig, loadStyle, createTag) {
  if (!el || !foreground || !text || !promiseArr) return;
  const paragraphs = Array.from(foreground.querySelectorAll(':scope p:not([class])'));
  const actionArea = text.querySelector('.action-area');
  const headingsIndexes = paragraphs.flatMap((elem, i) => (elem.querySelector('strong') && !elem.querySelector('picture') ? i : []));
  if (!headingsIndexes.length) return;
  if (headingsIndexes.length === 1) {
    decorateFeatures(paragraphs, text, actionArea, createTag);
  } else {
    const mnemonics = paragraphs.splice(...headingsIndexes);
    const businessFeatures = paragraphs;
    decorateFeatures(mnemonics, text, actionArea, createTag);
    decorateFeatures(businessFeatures, text, actionArea, createTag);
  }
  promiseArr.push(loadStyle(`${getConfig().base}/blocks/mnemonic-list/mnemonic-list.css`));
}

export default async function init(el) {
  const miloLibs = getLibs('/libs');
  const { decorateBlockBg, decorateButtons, loadCDT } = await import(`${miloLibs}/utils/decorate.js`);
  const { createTag, getConfig, loadStyle } = await import(`${miloLibs}/utils/utils.js`);
  const children = el.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  if (children.length > 1) {
    children[0].classList.add('background');
    decorateBlockBg(el, children[0], { useHandleFocalpoint: true });
  }
  foreground?.classList.add('foreground', 'container');
  const headline = foreground?.querySelector('h1, h2, h3, h4, h5, h6');
  const text = headline?.closest('div');
  text?.classList.add('text');
  decorateText(text);
  decorateButtons(text, 'button-l');
  extendButtonsClass(text);
  const promiseArr = [];
  appendFeatures(el, foreground, text, promiseArr, getConfig, loadStyle, createTag);
  if (el.classList.contains('countdown-timer')) {
    promiseArr.push(loadCDT(text, el.classList));
  }
  await Promise.allSettled(promiseArr);
}
