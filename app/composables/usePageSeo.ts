import type { MaybeRefOrGetter } from 'vue'

interface PageSeo {
  /** The page's own title. The site name is added by the title template ("Pricing | getalawyer"). */
  title: MaybeRefOrGetter<string>
  /** One or two plain sentences for search results and share cards, about 120–160 characters. */
  description: MaybeRefOrGetter<string>
  /** The title on share cards and the share image, when it should differ from the page title. */
  shareTitle?: MaybeRefOrGetter<string>
  /** A shorter line for the share image, when the description is too long to sit under the title in large type. */
  shareDescription?: MaybeRefOrGetter<string>
  /** A short label above the title on the share image (a practice area, "For lawyers"). */
  eyebrow?: MaybeRefOrGetter<string>
  /** A person's photo for the share image (a lawyer's profile). */
  photo?: MaybeRefOrGetter<string | null | undefined>
}

/**
 * Search and sharing for a public page, set in one call so the title, the
 * description, the share card and the share image never drift apart:
 * `<title>` and the meta description for search results, Open Graph cards
 * (read by WhatsApp, LinkedIn and X), and a share image drawn from the page's
 * own words (app/components/OgImage/Canopy.takumi.vue).
 *
 * Private pages (dashboard, application, sign-in) do not use this: they are
 * kept out of search by the `robots: false` route rules in nuxt.config and
 * only set a title.
 */
export function usePageSeo(seo: PageSeo) {
  const shareTitle = () => toValue(seo.shareTitle ?? seo.title)
  const description = () => toValue(seo.description)

  useSeoMeta({
    title: () => toValue(seo.title),
    description,
    // X reads these too: unhead marks twitter:title / twitter:description as deprecated
    ogTitle: shareTitle,
    ogDescription: description,
  })

  defineOgImage('Canopy', {
    title: shareTitle,
    description: () => toValue(seo.shareDescription ?? seo.description),
    eyebrow: () => toValue(seo.eyebrow) ?? '',
    photo: () => toValue(seo.photo) ?? '',
  })
}
