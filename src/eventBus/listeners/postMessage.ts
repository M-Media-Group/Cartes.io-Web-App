import { Map } from '@/types/map';
import { Marker } from '@/types/marker';
import { eventTypes } from '../events';

export default {

  loaded_map: (e: Map) => {
    // Send a postMessage event
    window.parent.postMessage({
      type: eventTypes.loaded_map,
      data: e,
    }, '*');
  },
  updated_map: (e: Map) => {
    // Send a postMessage event
    window.parent.postMessage({
      type: eventTypes.updated_map,
      data: e,
    }, '*');
  },
  deleted_map: (e: Map) => {
    // Send a postMessage event
    // @todo investigate why in this specific case we need to do the JSON.parse hack - taken from https://stackoverflow.com/a/42376465
    window.parent.postMessage({
      type: eventTypes.deleted_map,
      data: JSON.parse(JSON.stringify(e)),
    }, '*');
  },
  created_marker: (e: Marker) => {
    // Send a postMessage event
    window.parent.postMessage({
      type: eventTypes.created_marker,
      data: e,
    }, '*');
  },
  deleted_marker: (e: Marker) => {
    // Send a postMessage event
    window.parent.postMessage({
      type: eventTypes.deleted_marker,
      data: e,
    }, '*');
  }
} as Record<eventTypes, any>;
