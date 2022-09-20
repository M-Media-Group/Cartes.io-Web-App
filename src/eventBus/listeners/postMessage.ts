import { Map } from '@/types/map';
import { Marker } from '@/types/marker';
import { eventTypes } from '../events';

export default {

  created_map: (e: Map) => {
    // Send a postMessage event
    window.postMessage({
      type: eventTypes.created_map,
      data: e,
    }, '*');
  },
  updated_map: (e: Map) => {
    // Send a postMessage event
    window.postMessage({
      type: eventTypes.updated_map,
      data: e,
    }, '*');
  },
  deleted_map: (e: Map) => {
    // Send a postMessage event
    window.postMessage({
      type: eventTypes.deleted_map,
      data: e,
    }, '*');
  },
  created_marker: (e: Marker) => {
    // Send a postMessage event
    window.postMessage({
      type: eventTypes.created_marker,
      data: e,
    }, '*');
  },
  deleted_marker: (e: Marker) => {
    // Send a postMessage event
    window.postMessage({
      type: eventTypes.deleted_marker,
      data: e,
    }, '*');
  }
} as Record<eventTypes, any>;
