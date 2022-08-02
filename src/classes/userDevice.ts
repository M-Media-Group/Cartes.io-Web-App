import $bus, { eventTypes } from "@/eventBus/events";

class userDevice {

    #hasArSupport = null as null | Boolean;
    #isOnline = navigator.onLine;
    #deviceMediaDevices: MediaDeviceInfo[] = [];

    constructor() {
        this.listenForOnlineStatusChange();
        this.getAllMediaDevices();
    }

    listenForOnlineStatusChange() {
        window.addEventListener("online", () => {
            this.#isOnline = true;
            $bus.$emit(eventTypes.came_online);
        });
        window.addEventListener("offline", () => {
            $bus.$emit(eventTypes.went_offline);
            this.#isOnline = false;
        });
    }

    stopListeningForOnlineStatusChange() {
        window.removeEventListener("online", () => {
            this.#isOnline = true;
        });
        window.removeEventListener("offline", () => {
            this.#isOnline = false;
        });
    }

    get supportsAr() {
        if (this.#hasArSupport === null) {
            this.#hasArSupport = this.supportsGeolocation && this.supportsMediaDevices && this.supportsDeviceOrientation && this.supportsDeviceMotion;
        }
        return this.#hasArSupport;
    }

    get supportsGeolocation() {
        return navigator.geolocation &&
            "geolocation" in navigator
    }

    get supportsMediaDevices() {
        return navigator.mediaDevices &&
            "mediaDevices" in navigator
    }

    getAllMediaDevices() {
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                this.#deviceMediaDevices = devices;
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });
    }

    get mediaDevices() {
        return this.#deviceMediaDevices;
    }

    get hasMediaDevices() {
        return this.#deviceMediaDevices.length > 0;
    }

    get hasGivenPermissionForMediaDevices() {
        return this.#deviceMediaDevices.some((device) => device.label !== "");
    }

    get hasVideoMediaDevice() {
        return this.#deviceMediaDevices.some((device) => device.kind === "videoinput");
    }

    get hasAudioMediaDevice() {
        return this.#deviceMediaDevices.some((device) => device.kind === "audioinput");
    }

    get supportsDeviceOrientation() {
        return window.DeviceOrientationEvent &&
            "DeviceOrientationEvent" in window
    }

    get supportsDeviceMotion() {
        return window.DeviceMotionEvent &&
            "DeviceMotionEvent" in window
    }

    get supportsTouchInput() {
        return "ontouchstart" in window;
    }

    get language() {
        return navigator.language;
    }

    get supportsCookies() {
        return navigator.cookieEnabled;
    }

    get userAgent() {
        return navigator.userAgent;
    }

    get online() {
        return this.#isOnline;
    }

}

export default new userDevice();