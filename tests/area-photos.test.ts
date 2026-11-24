import { describe, expect, it } from 'vitest'
import { areaPhotoSrcset, areaPhotoUrl } from '../app/lib/area-photos'

const photo = 'https://res.cloudinary.com/demo/image/upload/v1/practice_areas/tax.jpg'

describe('areaPhotoUrl', () => {
  it('asks Cloudinary for the size shown', () => {
    expect(areaPhotoUrl(photo, 72, 72)).toBe('https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_72,h_72,q_auto,f_auto/v1/practice_areas/tax.jpg')
  })
  it('leaves other addresses as they are, and nothing as nothing', () => {
    expect(areaPhotoUrl('https://example.com/a.jpg', 72, 72)).toBe('https://example.com/a.jpg')
    expect(areaPhotoUrl(null, 72, 72)).toBeNull()
    expect(areaPhotoUrl('', 72, 72)).toBeNull()
  })
})

describe('areaPhotoSrcset', () => {
  it('offers a sharper copy for sharp screens', () => {
    expect(areaPhotoSrcset(photo, 72, 72)).toBe(`${areaPhotoUrl(photo, 72, 72)} 1x, ${areaPhotoUrl(photo, 144, 144)} 2x`)
  })
  it('has nothing to offer for other addresses', () => {
    expect(areaPhotoSrcset('https://example.com/a.jpg', 72, 72)).toBeUndefined()
  })
})
