
class cartes {

    #api_url: string = "https://cartes.io/api/";
    #map_uuid: string | null;
    #api_key: string | null;
    #token: string | null;
    #headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };
    #params: Record<string, any>;
    #request_url = this.#api_url;

    // Constructor with map_uuid=None, api_key=None, token=None
    // Constructor with map_uuid=None, api_key=None, token=None
    constructor(map_uuid = null as string | null, api_key = null as string | null, token = null as string | null) {
        this.#map_uuid = map_uuid;
        this.#api_key = api_key;
        this.#token = token;

        this.#params = {
            token: this.#token,
            api_key: this.#api_key,
        }

        if (map_uuid) {
            this.#request_url = this.#api_url + "maps/" + map_uuid;
        }
    }

    // Private method to get headers
    private getHeaders(): Headers {
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + this.#api_key);
        return headers;
    }

    private attachParamsToUrl() {
        // Attach any params to this.#request_url
        if (this.#params) {
            let params = "";
            for (let key in this.#params) {
                if (this.#params[key]) {
                    params += "&" + key + "=" + this.#params[key];
                }
            }
            this.#request_url += "?" + params.substring(1);
        }
    }

    // Private method handleRequest to make the request using fetch
    private handleRequest(method = "GET", body = null as any): Promise<any> {

        this.attachParamsToUrl();

        const data = {
            method: method.toUpperCase(),
            headers: this.getHeaders(),
        } as RequestInit;

        // If the method is not GET, we need to add the body
        if (data.method !== "GET") {
            data.body = JSON.stringify(body);
        }

        return fetch(this.#request_url, data)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                // Switch the response codes to determine the message
                switch (response.status) {
                    case 400:
                        return response.json().then((data) => {
                            throw new Error(data.message);
                        });
                    case 401:
                        throw new Error("You are not logged in.");
                    case 403:
                        throw new Error("You are not authorized to add markers to this map.");
                    case 404:
                        throw new Error("Map not found.");
                    case 500:
                        throw new Error("Internal server error.");
                    default:
                        throw new Error("Unknown error.");
                }
            })
            .then((data) => {
                console.log("Got");
                return data;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    public maps(uuid = null as string | number | null, token = null as string | null): cartes {
        if (uuid) {
            this.#request_url = this.#api_url + "maps/" + uuid;
        } else {
            this.#request_url = this.#api_url + "maps";
        }

        if (token) {
            this.#params.token = token;
        }

        return this;
    }

    public categories(id = null as string | number | null): cartes {
        if (id) {
            this.#request_url = this.#api_url + "categories/" + id;
        } else {
            this.#request_url = this.#api_url + "categories";
        }

        return this;
    }

    public markers(id = null as string | number | null, token = null as string | null): cartes {
        if (id) {
            // Append to the url
            this.#request_url += "/markers/" + id;
        } else {
            this.#request_url += "/markers";
        }

        if (token) {
            this.#params.token = token;
        }

        return this;
    }

    // Public method "get"
    public get(): Promise<any> {
        return this.handleRequest("GET");
    }

    // Public method "create"
    public create(data: any): Promise<any> {
        return this.handleRequest("POST", data);
    }

    // Public method "update"
    public update(data: any): Promise<any> {
        return this.handleRequest("PUT", data);
    }

    // Public method "delete"
    public delete(): Promise<any> {
        return this.handleRequest("DELETE");
    }
}

export default new cartes();