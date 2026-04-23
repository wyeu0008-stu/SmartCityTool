import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import PasswordGateView from '../PasswordGateView.vue'

const { replace, grantPasswordAccess } = vi.hoisted(() => ({
  replace: vi.fn(),
  grantPasswordAccess: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace
  })
}))

vi.mock('../../auth/passwordAccess', () => ({
  ACCESS_PASSWORD: 'fit5120',
  grantPasswordAccess
}))

describe('PasswordGateView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dev environment label for dev target', () => {
    const wrapper = mount(PasswordGateView, {
      props: {
        target: 'dev',
        redirectTo: '/dev'
      }
    })

    expect(wrapper.text()).toContain('Development Environment')
  })

  it('renders old version label for oldver target', () => {
    const wrapper = mount(PasswordGateView, {
      props: {
        target: 'oldver',
        redirectTo: '/oldver'
      }
    })

    expect(wrapper.text()).toContain('Old Version')
  })

  it('grants access and redirects on correct password', async () => {
    const wrapper = mount(PasswordGateView, {
      props: {
        target: 'dev',
        redirectTo: '/dev'
      }
    })

    await wrapper.find('input').setValue('fit5120')
    await wrapper.find('form').trigger('submit.prevent')

    expect(grantPasswordAccess).toHaveBeenCalledWith('dev')
    expect(replace).toHaveBeenCalledWith('/dev')
  })

  it('shows error and clears input on incorrect password', async () => {
    const wrapper = mount(PasswordGateView, {
      props: {
        target: 'oldver',
        redirectTo: '/oldver'
      }
    })

    await wrapper.find('input').setValue('wrong')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Incorrect password. Please try again.')
    expect(wrapper.find('input').element.value).toBe('')
    expect(grantPasswordAccess).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })
})
