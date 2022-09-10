import { Map } from '@/types/map';
import { Marker } from '@/types/marker';
import { User } from '@/types/user';
import { event, pageview, setOptions, optIn, optOut } from 'vue-gtag'
import { eventTypes } from '../events';

export default {
  enabled_analytics: () => {
    optIn();
    event('analytics_opt_in');
  },
  disabled_analytics: () => {
    event('analytics_opt_out');
    optOut();
  },
  created_map: (e: Map) => {
    event('created_map', {
      map_id: e.uuid,
    });
  },
  updated_map: (e: Map) => {
    event('updated_map', {
      map_id: e.uuid,
    });
  },
  deleted_map: (e: Map) => {
    event('deleted_map', {
      map_id: e.uuid,
    });
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
  },
  opened_marker_popup: (e: Marker) => {
    event('opened_marker_popup', {
      marker_id: e.id,
      category_id: e.category.id,
    });
  },
  viewed_page: (to: any) => {
    pageview(to);
  },
  shared_map: (e: { map: Map, action: string }) => {
    event('share', {
      resource: 'map',
      map_id: e.map.uuid,
      action: e.action,
    });
  },
  shared_profile: (e: { user: User, action: string }) => {
    event('share', {
      resource: 'profile',
      username: e.user.username,
      action: e.action,
    });
  },
  searched: (e: { resource: string; query: string; results: any[]; }) => {
    event('search', {
      resource: e.resource,
      search_term: e.query,
      // results: e.results
    });
  },
  logged_in: () => {
    event('login');
  },
  registered: () => {
    event('sign_up');
  },
  created_personal_access_token: () => {
    event('created_personal_access_token');
  }
} as Record<eventTypes, any>;
