import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DevHomePage from '../pages/DevHomePage.vue'
import DevMapPage from '../pages/DevMapPage.vue'
import DevInsightsPage from '../pages/DevInsightsPage.vue'
import DevMoreInfoPage from '../pages/DevMoreInfoPage.vue'
import { fetchPopularitySummary } from '../../services/popularityService'

vi.mock('../../services/popularityService', () => ({
  fetchPopularitySummary: vi.fn(() => Promise.reject(new Error('Use demo data')))
}))

describe('Dev pages', () => {
  beforeEach(() => {
    fetchPopularitySummary.mockReset()
    fetchPopularitySummary.mockRejectedValue(new Error('Use demo data'))
  })

  it('renders dev home page wrapper', () => {
    const wrapper = mount(DevHomePage, {
      global: {
        stubs: {
          DevPlannerHomeSection: {
            template: '<div data-test="dev-home-panel"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="dev-home-panel"]').exists()).toBe(true)
  })

  it('renders dev map page wrapper', () => {
    const wrapper = mount(DevMapPage, {
      global: {
        stubs: {
          DevPlannerMapPanel: {
            template: '<div data-test="dev-map-panel"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="dev-map-panel"]').exists()).toBe(true)
  })

  it('renders dev insights page wrapper', () => {
    const wrapper = mount(DevInsightsPage, {
      global: {
        stubs: {
          DevInsightsPanel: {
            template: '<div data-test="dev-insights-panel"></div>'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="dev-insights-panel"]').exists()).toBe(true)
  })

  it('renders dev more info page wrapper', () => {
    const wrapper = mount(DevMoreInfoPage)

    expect(wrapper.find('[data-test="dev-more-info-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Popular Origins')
    expect(wrapper.text()).toContain('Popular Destinations')
    expect(wrapper.text()).toContain('Top 3 Routes')
    expect(wrapper.findAll('.ranking-panel')).toHaveLength(2)
    expect(wrapper.findAll('.top-route-card')).toHaveLength(3)
  })

  it('renders dashboard filters without the removed filter chips', () => {
    const wrapper = mount(DevMoreInfoPage)
    const filterLabels = wrapper.findAll('.dashboard-filter-form label > span').map((filter) => filter.text())

    expect(filterLabels).toEqual(['Area', 'Destination', 'Parking type'])
    expect(filterLabels).not.toContain('All')
  })

  it('supports interactive dashboard tooltips and destination selection', async () => {
    const wrapper = mount(DevMoreInfoPage)
    const destinationButton = wrapper.find('.destination-button')
    const barWithTooltip = wrapper.find('.bar-row.has-tooltip')

    expect(destinationButton.attributes('data-tooltip')).toContain('trips')
    expect(barWithTooltip.attributes('data-tooltip')).toContain('km')

    await destinationButton.trigger('click')

    expect(destinationButton.classes()).toContain('active')
    expect(wrapper.text()).toContain('Selected Destination')
    expect(wrapper.text()).toContain(destinationButton.text())
  })

  it('shows all destinations in the KPI when the destination filter is all', () => {
    const wrapper = mount(DevMoreInfoPage)

    expect(wrapper.text()).toContain('All destinations')
    expect(wrapper.text()).not.toContain('Southbank Promenade1,324 trips')
  })

  it('renders database popularity data when available', async () => {
    fetchPopularitySummary.mockResolvedValue({
      startPoints: [
        { display_name: 'Database Origin', search_count: 40 },
        { display_name: '', name: 'Named Origin', search_count: 10 }
      ],
      endPoints: [
        { display_name: 'Database Destination', search_count: 30 }
      ],
      routes: [
        {
          origin_display_name: 'Database Origin',
          destination_display_name: 'Database Destination',
          search_count: 12
        }
      ]
    })

    const wrapper = mount(DevMoreInfoPage)
    await Promise.resolve()
    await Promise.resolve()

    expect(fetchPopularitySummary).toHaveBeenCalledWith(5)
    expect(wrapper.text()).toContain('Database data')
    expect(wrapper.text()).toContain('Database Origin')
    expect(wrapper.text()).toContain('Named Origin')
    expect(wrapper.text()).toContain('Database Destination')
  })

  it('keeps demo data when popularity API returns empty data', async () => {
    fetchPopularitySummary.mockResolvedValue({
      startPoints: [],
      endPoints: [],
      routes: []
    })

    const wrapper = mount(DevMoreInfoPage)
    await Promise.resolve()
    await Promise.resolve()

    expect(wrapper.text()).toContain('Demo data')
    expect(wrapper.text()).toContain('Flinders Street Station')
    expect(wrapper.text()).toContain('Southbank Promenade')
  })

  it('updates dashboard when parking type filter changes', async () => {
    const wrapper = mount(DevMoreInfoPage)
    const parkingSelect = wrapper.findAll('.dashboard-filter-form select')[2]

    await parkingSelect.setValue('rack')

    expect(wrapper.text()).toContain('rack')
    expect(wrapper.text()).toContain('41')
    expect(wrapper.text()).toContain('1.4%')
  })
})
