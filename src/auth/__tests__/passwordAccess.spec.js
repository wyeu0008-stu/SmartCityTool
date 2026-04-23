import { beforeEach, describe, expect, it } from 'vitest'
import {
  ACCESS_PASSWORD,
  grantPasswordAccess,
  hasPasswordAccess
} from '../passwordAccess'

describe('passwordAccess', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('exports the expected password', () => {
    expect(ACCESS_PASSWORD).toBe('fit5120')
  })

  it('returns false when scope access is missing', () => {
    expect(hasPasswordAccess('dev')).toBe(false)
  })

  it('stores and reads scope-specific access', () => {
    grantPasswordAccess('dev')

    expect(hasPasswordAccess('dev')).toBe(true)
    expect(hasPasswordAccess('oldver')).toBe(false)
  })
})
