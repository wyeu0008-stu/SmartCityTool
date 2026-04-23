import { describe, expect, it, vi, beforeEach } from 'vitest'

const hasPasswordAccess = vi.fn()

vi.mock('../../auth/passwordAccess', () => ({
  hasPasswordAccess
}))

describe('router', () => {
  beforeEach(() => {
    vi.resetModules()
    hasPasswordAccess.mockReset()
    window.history.replaceState({}, '', '/')
  })

  it('allows access to public release routes', async () => {
    hasPasswordAccess.mockReturnValue(false)
    const router = (await import('../index')).default

    await router.push('/map')

    expect(router.currentRoute.value.fullPath).toBe('/map')
  })

  it('redirects protected oldver routes to password gate when unauthorized', async () => {
    hasPasswordAccess.mockReturnValue(false)
    const router = (await import('../index')).default

    await router.push('/oldver')

    expect(router.currentRoute.value.name).toBe('password-gate')
    expect(router.currentRoute.value.params.target).toBe('oldver')
    expect(router.currentRoute.value.query.redirect).toBe('/oldver')
  })

  it('allows protected dev route when authorized', async () => {
    hasPasswordAccess.mockImplementation((scope) => scope === 'dev')
    const router = (await import('../index')).default

    await router.push('/dev')

    expect(router.currentRoute.value.fullPath).toBe('/dev')
  })

  it('supports public alias route for planner', async () => {
    hasPasswordAccess.mockReturnValue(false)
    const router = (await import('../index')).default

    const resolved = router.resolve('/routes')

    expect(resolved.path).toBe('/routes')
    expect(resolved.matched[0].components.default).toBeDefined()
  })
})
