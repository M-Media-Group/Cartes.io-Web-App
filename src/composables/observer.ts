import { onBeforeUnmount } from "vue";

// A global Vue3 composable for a single IntersectionObserver instance.
const observedElements = new Map()

const options = {
    // The root needs to be an element that is the viewport, the heights may change
    // so we can't use the map element
    root: null,
    rootMargin: '200%',
    threshold: 0
} as IntersectionObserverInit;

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const { isIntersecting, target } = entry
        const callback = observedElements.get(target)
        callback(entry)
    })
}, options)

export function useIntersectionObserver() {
    // An array that holds a reference to the elements that are currently being observed by this component. Here we will store just enough information to be able to retrieve the element from the global observedElements map.
    const localElements = new Map()

    function observeElement(element: HTMLElement, callback: (entry: IntersectionObserverEntry) => void) {
        observedElements.set(element, callback)
        observer.observe(element)

        localElements.set(element, callback)
    }

    function unobserveElement(element: HTMLElement) {
        observedElements.delete(element)
        observer.unobserve(element)

        localElements.delete(element)

        console.log("Remaining elements: ", observedElements.size)
    }

    // On unmount, unobserve all elements
    onBeforeUnmount(() => {
        localElements.forEach((_, element) => {
            unobserveElement(element)
        })
    })

    return {
        observeElement, unobserveElement
    }
}