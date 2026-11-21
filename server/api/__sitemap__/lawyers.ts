
interface SearchPage {
  data?: {
    results?: { id: string, name: string, image?: string | null }[]
    pagination?: { hasMore?: boolean }
  }
}

/** The search API's largest page; a stop so a broken `hasMore` can never loop forever. */
const PAGE_SIZE = 100
const MAX_PAGES = 50

/**
 * Every lawyer listed in the directory, for the sitemap: their public profile
 * at /lawyers/:id, with their photo. Read from the same public search the
 * directory uses, so only listed lawyers appear. If the API cannot be reached
 * the sitemap still lists the site's own pages (an empty list here).
 */
export default defineSitemapEventHandler(async () => {
  const { public: { apiUrl } } = useRuntimeConfig()
  const urls: { loc: string, images?: { loc: string, title: string }[] }[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await $fetch<SearchPage>(`${apiUrl}/api/search/lawyers`, {
      query: { page, limit: PAGE_SIZE },
    }).catch((error) => {
      console.error('[sitemap] lawyers could not be read:', error instanceof Error ? error.message : error)
      return null
    })
    const results = res?.data?.results ?? []

    for (const lawyer of results) {
      urls.push({
        loc: `/lawyers/${lawyer.id}`,
        ...(lawyer.image ? { images: [{ loc: lawyer.image, title: lawyer.name }] } : {}),
      })
    }
    if (!res?.data?.pagination?.hasMore || results.length === 0) break
  }

  return urls
})
