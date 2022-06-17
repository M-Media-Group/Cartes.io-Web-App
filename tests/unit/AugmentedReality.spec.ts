import { mount } from '@vue/test-utils'
import AugmentedReality from '../../src/views/AugmentedReality.vue'
import fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

test('Displays AugmentedReality view', async () => {

  // Spoof the URL so that we have a mapId we can use
  const location = {
    ...window.location,
    search: '?mapId=3bdc0bdc-8a77-40e3-8c34-c70466443980',
  };
  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  })

  const wrapper = await mount(AugmentedReality)

  fetch.mockResponseOnce(JSON.stringify([{
    "id": 2694,
    "location": {
      "type": "Point",
      "coordinates": [43.695382432334, 7.3027592897415]
    },
    "category_id": 491,
    "created_at": "2022-06-14T07:21:06+02:00",
    "updated_at": "2022-06-14T07:21:06+02:00",
    "description": "",
    "expires_at": null,
    "is_spam": false,
    "link": null,
    "category": {
      "id": 491,
      "name": "Outdoor gym",
      "slug": "outdoor-gym",
      "icon": "\/images\/marker-01.svg"
    }
  }, {
    "id": 2695,
    "location": {
      "type": "Point",
      "coordinates": [43.697995458261, 7.3079681396484]
    },
    "category_id": 488,
    "created_at": "2022-06-14T07:23:00+02:00",
    "updated_at": "2022-06-14T07:23:00+02:00",
    "description": "",
    "expires_at": null,
    "is_spam": false,
    "link": null,
    "category": {
      "id": 488,
      "name": "Port",
      "slug": "port",
      "icon": "https:\/\/img.icons8.com\/ios-filled\/50\/undefined\/port.png"
    }
  }, {
    "id": 2696,
    "location": {
      "type": "Point",
      "coordinates": [43.70179251893, 7.306986451149]
    },
    "category_id": 492,
    "created_at": "2022-06-15T11:21:41+02:00",
    "updated_at": "2022-06-15T11:21:41+02:00",
    "description": "",
    "expires_at": null,
    "is_spam": false,
    "link": null,
    "category": {
      "id": 492,
      "name": "Casino Shop",
      "slug": "casino-shop",
      "icon": "\/images\/marker-01.svg"
    }
  }]
  ))

  // Assert that there is an a-scene element
  expect(wrapper.find('a-scene').exists()).toBe(true)
  expect(wrapper.find('a-camera').exists()).toBe(true)

  // Expect the markers data to contain elements
  console.log(wrapper)

  // Await trigger update
  await wrapper.vm.$nextTick()

  expect(wrapper.find('a-text').exists()).toBe(true)
})