class userDevice {

    hasArSupport = null as null | Boolean;
    isOnline = navigator.onLine;

    constructor() {
        this.listenForOnlineStatusChange();
    }

    listenForOnlineStatusChange() {
        window.addEventListener("online", () => {
            this.isOnline = true;
        });
        window.addEventListener("offline", () => {
            alert("You are offline");
            this.isOnline = false;
        });
    }

    stopListeningForOnlineStatusChange() {
        window.removeEventListener("online", () => {
            this.isOnline = true;
        });
        window.removeEventListener("offline", () => {
            this.isOnline = false;
        });
    }

    get supportsAr() {
        if (this.hasArSupport === null) {
            this.hasArSupport = this.supportsGeolocation && this.supportsMediaDevices && this.supportsDeviceOrientation && this.supportsDeviceMotion;
        }
        return this.hasArSupport;
    }

    get supportsGeolocation() {
        return navigator.geolocation &&
            "geolocation" in navigator
    }

    get supportsMediaDevices() {
        return navigator.mediaDevices &&
            "mediaDevices" in navigator
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
        return this.isOnline;
    }

}

export default new userDevice();