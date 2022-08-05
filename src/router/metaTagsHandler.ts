// Taken from https://www.digitalocean.com/community/tutorials/vuejs-vue-router-modify-head
export const setMetaAttributes = (to: any, from: any, next: () => any) => {
    updateOrCreateMetaTag("og:description", to.meta.description);
    updateOrCreateMetaTag("og:image", to.meta.image);
    updateOrCreateMetaTag("og:site_name", "Cartes.io");
    updateOrCreateMetaTag("og:locale", to.meta.locale ?? "en_US");
    setFollow(true);
    setCurrentUrl();

    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    const nearestWithTitle = to.matched.slice().reverse().find((r: { meta: { title: any; }; }) => r.meta && r.meta.title);

    // Find the nearest route element with meta tags.
    const nearestWithMeta = to.matched.slice().reverse().find((r: { meta: { metaTags: any; }; }) => r.meta && r.meta.metaTags);

    const previousNearestWithMeta = from.matched.slice().reverse().find((r: { meta: { metaTags: any; }; }) => r.meta && r.meta.metaTags);

    // If a route with a title was found, set the document (page) title to that value.
    if (nearestWithTitle) {
        setTitle(nearestWithTitle.meta.title);
    } else if (previousNearestWithMeta) {
        setTitle(previousNearestWithMeta.meta.title);
    } else {
        setTitle((to.name + ' - Cartes.io') ?? "Cartes.io");
    }

    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => el.parentNode?.removeChild(el));

    // Skip rendering meta tags if there are none.
    if (!nearestWithMeta) return;

    // Turn the meta tag definitions into actual elements in the head.
    nearestWithMeta.meta.metaTags.map((tagDef: { [x: string]: string; }) => {
        const tag = document.createElement('meta');

        Object.keys(tagDef).forEach(key => {
            tag.setAttribute(key, tagDef[key]);
        });

        // We use this to track which meta tags we create so we don't interfere with other ones.
        tag.setAttribute('data-vue-router-controlled', '');

        return tag;
    })
        // Add the meta tags to the document head.
        .forEach((tag: any) => document.head.appendChild(tag));
}

export const setTitle = (title: string) => {
    document.title = title;
    updateOrCreateMetaTag("og:title", title);
    updateOrCreateMetaTag("twitter:title", title);
}

export const setFollow = (follow = true) => {
    updateOrCreateMetaTag("robots", follow ? "index,follow" : "noindex,nofollow");
    updateOrCreateMetaTag("googlebot", follow ? "index,follow" : "noindex,nofollow");
}

export const setDescription = (description: string) => {
    updateOrCreateMetaTag("description", description);
    updateOrCreateMetaTag("og:description", description);
    updateOrCreateMetaTag("twitter:description", description);
}

export const setCurrentUrl = (url = null as null | string) => {
    // If the URL is null, set it to the current URL.
    if (url === null) {
        url = window.location.href;
    }
    updateOrCreateMetaTag("og:url", url);
    updateOrCreateMetaTag("twitter:url", url);
}

export const updateOrCreateMetaTag = (tagName: string, content: string) => {
    const metaTag = document.querySelector(`meta[name="${tagName}"]`);
    if (metaTag) {
        metaTag.setAttribute("content", content);
    } else {
        const newMetaTag = document.createElement("meta");
        newMetaTag.setAttribute("name", tagName);
        newMetaTag.setAttribute("content", content);
        document.head.appendChild(newMetaTag);
    }
}