import { App } from "vue";

export enum eventTypes {
  created_map = "created_map",
  updated_map = "updated_map",
  deleted_map = "deleted_map",
  shared_map = "shared_map",
  loaded_map = "loaded_map",
  enabled_analytics = "enabled_analytics",
  disabled_analytics = "disabled_analytics",
  created_marker = "created_marker",
  created_marker_via_websocket = "created_marker_via_websocket",
  updated_marker_via_websocket = "updated_marker_via_websocket",
  updated_marker = "updated_marker",
  deleted_marker = "deleted_marker",
  dragged_marker = "dragged_marker",
  deleted_marker_via_websocket = "deleted_marker_via_websocket",
  connected_to_websocket_channel = "connected_to_websocket_channel",
  left_websocket_channel = "left_websocket_channel",
  opened_marker_popup = "opened_marker_popup",
  went_offline = "went_offline",
  came_online = "came_online",
  viewed_page = "viewed_page",
  logged_in = "logged_in",
  logged_out = "logged_out",
  sent_reset_password_email = "sent_reset_password_email",
  updated_user = "updated_user",
  shared_profile = "shared_profile",
  registered = "registered",
  searched = "searched",
  created_personal_access_token = "created_personal_access_token",
  deleted_personal_access_token = "deleted_personal_access_token",
  enabled_location = "enabled_location",
  failed_to_enable_location = "failed_to_enable_location",
  disabled_location = "disabled_location",
  changed_marker_order = "changed_marker_order",
  started_sharing_location = "started_sharing_location",
  stopped_sharing_location = "stopped_sharing_location",
  updated_tracked_view = "updated_tracked_view",
}

type EventsObject = { [P in eventTypes]?: any };

class Events {
  events: EventsObject;

  constructor(events = {}) {
    this.events = events;
  }

  $on(eventName: eventTypes, fn: Function) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }

  $off(eventName: eventTypes, fn: Function) {
    if (this.events[eventName]) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  }

  $emit(eventName: eventTypes, data = null as any) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (fn: (arg0: any) => void) {
        fn(data);
      });
    }
  }
}

const eventsInstance = new Events();

export class Listeners {
  constructor(...events: EventsObject[]) {
    events.forEach((event: EventsObject) => {
      Object.keys(event).forEach((eventName: any) => {
        eventsInstance.$on(eventName, event[eventName as eventTypes]);
      });
    });
  }
}

// Currently unused
export const EventsPlugin = {
  install: (app: App<any>) => {
    // inject a globally available $bus
    app.config.globalProperties.$bus = eventsInstance;
  },
};

export default eventsInstance;
