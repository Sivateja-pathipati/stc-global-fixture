import { useLayoutEffect } from 'react';
import { computeHead } from '@/services/head.service';
import { toHeadTags } from '@/mappers/head.mapper';
import type { LocaleId } from '@/types/locale';
import type { RouteId, RouteParams } from '@/types/route';

/**
 * Applies the same HeadModel the prerenderer stamped, to the live DOM.
 *
 * Both callers go through computeHead() and toHeadTags(), so the hydrated head is byte-identical
 * to the shell's. Any divergence is therefore never accidental — it can only come from an
 * explicit head.* manifest entry.
 *
 * `locale` here is the PATH locale, not the rendered content locale. When a defect makes those
 * disagree, <html lang> keeps saying what the URL says while the body renders another
 * language — which is the defect, observable in two independent ways.
 */
export function useDocumentHead(locale: LocaleId, routeId: RouteId, params?: RouteParams): void {
  const slug = params?.slug ?? '';

  useLayoutEffect(() => {
    const origin = window.__RGT_SHELL__?.origin ?? window.location.origin;
    const head = computeHead(locale, routeId, slug ? { slug } : undefined, origin);
    const tags = toHeadTags(head);

    document.documentElement.lang = head.htmlLang;
    document.documentElement.dir = head.dir;

    // Replace only the tags this hook owns, marked with data-rgt-head, so the shell's other
    // head content (stylesheet links Vite injected, font preloads) is left alone.
    document.head.querySelectorAll('[data-rgt-head]').forEach((node) => node.remove());

    for (const tag of tags) {
      if (tag.tag === 'title') {
        document.title = tag.text ?? '';
        continue;
      }
      if (tag.key === 'charset' || tag.key === 'viewport') continue;

      const element = document.createElement(tag.tag);
      for (const [name, value] of Object.entries(tag.attrs)) element.setAttribute(name, value);
      element.setAttribute('data-rgt-head', tag.key);
      document.head.appendChild(element);
    }
  }, [locale, routeId, slug]);
}
