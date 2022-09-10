import { App } from "vue";

export enum eventTypes {
  created_map = "created_map",
  updated_map = "updated_map",
  deleted_map = "deleted_map",
  shared_map = "shared_map",
  created_marker = "created_marker",
  created_marker_via_websocket = "created_marker_via_websocket",
  updated_marker = "updated_marker",
  deleted_marker = "deleted_marker",
  deleted_marker_via_websocket = "deleted_marker_via_websocket",
  connected_to_websocket_channel = "connected_to_websocket_channel",
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
}

type EventsObject = { [P in eventTypes]?: any };

class Events {
  events: EventsObject;

  constructor(events = {}) {
    this.events = events;
  }

  $on(eventName: eventTypes, fn: any) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }

  $off(eventName: eventTypes, fn: any) {
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
