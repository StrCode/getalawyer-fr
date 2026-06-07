import type { H3Event } from 'h3'

/**
 * GET /api/lawyers/:id
 * Proxies to Law-Backend with session cookies so SSR and client share one code path.
 */
export default defineEventHandler(async (event: H3Event) => {
  const lawyerId = getRouterParam(event, 'id')

  if (!lawyerId?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Invalid lawyer ID',
    })
  }

  const config = useRuntimeConfig()
  const cookieHeader = getHeader(event, 'cookie')

  const url = `${config.public.apiUrl}/api/lawyers/${encodeURIComponent(lawyerId)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw createError({
        statusCode: res.status,
        statusMessage: res.statusText,
        message:
          (body as { error?: string }).error
          || (body as { message?: string }).message
          || 'Failed to fetch lawyer profile',
        data: body,
      })
    }

    return body
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error('[api/lawyers/:id] proxy error:', error)
    throw createError({
      statusCode: 502,
      message: 'Could not reach the profile service',
    })
  }
})
