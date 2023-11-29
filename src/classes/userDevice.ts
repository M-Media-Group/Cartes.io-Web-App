import $bus, { eventTypes } from "@/eventBus/events";

class userDevice {

    #hasArSupport = null as null | Boolean;
    #isOnline = navigator.onLine;
    #deviceMediaDevices: MediaDeviceInfo[] = [];
    #currentPosition = {
        latitude: 0,
        longitude: 0,
        accuracy: 0
    };

    #ipLocation = {
        ip: "",
        network: "",
        version: "",
        city: "",
        region: "",
        region_code: "",
        country: "",
        country_name: "",
        country_code: "",
        country_code_iso3: "",
        country_capital: "",
        country_tld: "",
        continent_code: "",
        in_eu: false,
        postal: "",
        latitude: 0,
        longitude: 0,
        timezone: "",
        utc_offset: "",
        country_calling_code: "",
        currency: "",
        currency_name: "",
        languages: "",
        country_area: 0,
        country_population: 0,
        asn: "",
        org: ""
    };

    constructor() {
        this.listenForOnlineStatusChange();
        this.getAllMediaDevices();
        this.fetchIpLocation();
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

    fetchIpLocation() {
        if (localStorage.getItem("ipLocation")) {
            this.#ipLocation = JSON.parse(localStorage.getItem("ipLocation") as string);
            return;
        }

        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                // Theoretically can be written as this.#ipLocation = data;, but written in long-form for clarity and to avoid any potential issues if the API changes
                this.#ipLocation = {
                    ip: data.ip,
                    network: data.org,
                    version: data.version,
                    city: data.city,
                    region: data.region,
                    region_code: data.region_code,
                    country: data.country,
                    country_name: data.country_name,
                    country_code: data.country_code,
                    country_code_iso3: data.country_code_iso3,
                    country_capital: data.country_capital,
                    country_tld: data.country_tld,
                    continent_code: data.continent_code,
                    in_eu: data.in_eu,
                    postal: data.postal,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timezone: data.timezone,
                    utc_offset: data.utc_offset,
                    country_calling_code: data.country_calling_code,
                    currency: data.currency,
                    currency_name: data.currency_name,
                    languages: data.languages,
                    country_area: data.country_area,
                    country_population: data.country_population,
                    asn: data.asn,
                    org: data.org
                };

                this.cacheIpLocation();
            });
    }

    cacheIpLocation() {
        localStorage.setItem("ipLocation", JSON.stringify(this.#ipLocation));
    }

    get ipLocation() {
        return this.#ipLocation;
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

    getLongAndLat(options = undefined as PositionOptions | undefined) {
        return new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, options)
        );
    }

    async getCurrentPosition() {
        let crd;
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        function error(err: { code: any; message: any; }) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }

        const success = (pos: any) => {
            crd = pos.coords;
            this.#currentPosition = {
                latitude: crd.latitude,
                longitude: crd.longitude,
                accuracy: crd.accuracy
            };
            return this.#currentPosition;
        }

        return await this.getLongAndLat(options).then(success, error);
    }

    get location() {
        return this.getCurrentPosition();
    }

    get supportsMediaDevices() {
        return navigator.mediaDevices &&
            "mediaDevices" in navigator
    }

    getAllMediaDevices() {
        if (!navigator.mediaDevices || !this.supportsMediaDevices) {
            return;
        }
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