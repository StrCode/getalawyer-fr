/**
 * A practice area's photo at the size it is shown. Staff upload the photos in
 * the admin and they live in Cloudinary, which cuts each one to size and
 * picks the format; anything else is used as it is.
 */
export function areaPhotoUrl(url: string | null | undefined, width: number, height: number): string | null {
  if (!url)
    return null
  if (!url.startsWith('https://res.cloudinary.com/') || !url.includes('/image/upload/'))
    return url
  return url.replace('/image/upload/', `/image/upload/c_fill,g_auto,w_${width},h_${height},q_auto,f_auto/`)
}

/** The photo at the size shown and at twice that, for sharp screens. */
export function areaPhotoSrcset(url: string | null | undefined, width: number, height: number): string | undefined {
  const one = areaPhotoUrl(url, width, height)
  const two = areaPhotoUrl(url, width * 2, height * 2)
  return one && two && one !== two ? `${one} 1x, ${two} 2x` : undefined
}
