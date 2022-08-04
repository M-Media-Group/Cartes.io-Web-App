import { Map } from '@/types/map';
import { Marker } from '@/types/marker';
import { event } from 'vue-gtag'
import { eventTypes } from '../events';

export default {
  created_map: (e: Map) => {
    event('created_map');
  },
  deleted_map: (e: Map) => {
    event('deleted_map');
  },
  created_marker: (e: Marker) => {
    event('created_marker', {
      category_id: e.category.id,
    });
  },
  deleted_marker: (e: Marker) => {
    event('deleted_marker', {
      category_id: e.category.id,
    });
  }
} as Record<eventTypes, any>;
