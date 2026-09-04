import type { HeadModel, HeadTagDescriptor } from '@/types/head';

/**
 * HeadModel -> an ordered list of tag descriptors.
 *
 * The order is fixed here and nowhere else, so the string the prerenderer writes and the DOM
 * the runtime applies are in the same sequence. Both consumers read this one array.
 */
export function toHeadTags(head: HeadModel): readonly HeadTagDescriptor[] {
  const tags: HeadTagDescriptor[] = [
    { key: 'charset', tag: 'meta', attrs: { charset: head.charset } },
    {
      key: 'viewport',
      tag: 'meta',
      attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    },
    { key: 'title', tag: 'title', attrs: {}, text: head.title },
    {
      key: 'description',
      tag: 'meta',
      attrs: { name: 'description', content: head.description },
    },
  ];

  if (head.robots) {
    tags.push({ key: 'robots', tag: 'meta', attrs: { name: 'robots', content: head.robots } });
  }

  if (head.canonical) {
    tags.push({
      key: 'canonical',
      tag: 'link',
      attrs: { rel: 'canonical', href: head.canonical },
    });
  }

  for (const alternate of head.alternates) {
    tags.push({
      key: `alternate:${alternate.hreflang}`,
      tag: 'link',
      attrs: { rel: 'alternate', hreflang: alternate.hreflang, href: alternate.href },
    });
  }

  tags.push(
    { key: 'og:locale', tag: 'meta', attrs: { property: 'og:locale', content: head.ogLocale } },
    { key: 'og:type', tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    { key: 'og:title', tag: 'meta', attrs: { property: 'og:title', content: head.ogTitle } },
    {
      key: 'og:description',
      tag: 'meta',
      attrs: { property: 'og:description', content: head.ogDescription },
    },
    { key: 'og:url', tag: 'meta', attrs: { property: 'og:url', content: head.ogUrl } },
    { key: 'og:image', tag: 'meta', attrs: { property: 'og:image', content: head.ogImage } },
    {
      key: 'twitter:card',
      tag: 'meta',
      attrs: { name: 'twitter:card', content: 'summary_large_image' },
    },
    { key: 'twitter:title', tag: 'meta', attrs: { name: 'twitter:title', content: head.ogTitle } },
    {
      key: 'twitter:description',
      tag: 'meta',
      attrs: { name: 'twitter:description', content: head.ogDescription },
    },
    {
      key: 'icon',
      tag: 'link',
      attrs: { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    },
  );

  return tags;
}

/** Renders one descriptor to HTML. Used by the prerenderer only. */
export function renderHeadTag(tag: HeadTagDescriptor): string {
  const attrs = Object.entries(tag.attrs)
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join('');

  if (tag.tag === 'title') return `<title>${escapeText(tag.text ?? '')}</title>`;
  if (tag.tag === 'meta') return `<meta${attrs} />`;
  return `<link${attrs} />`;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
