import { describe, it, expect } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

const FIXTURE_PATH = join(process.cwd(), 'fixtures/profile-check-definitions.json')

describe('profile-check-definitions fixture', () => {
  it('matches Law-Backend pinned checksum', () => {
    const raw = readFileSync(FIXTURE_PATH, 'utf8')
    const checksum = createHash('sha256').update(raw).digest('hex')
    expect(checksum).toBe(
      '6e0fe11edb5f9cb3e5af7207dd34e18a6248803450be6872425f33879a06a1de'
    )
    const parsed = JSON.parse(raw)
    expect(parsed.totalWeight).toBe(130)
    expect(parsed.checks).toHaveLength(13)
  })
})
