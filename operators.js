/**
 * @param {EventTarget} target 
 * @param {string} eventName 
 * @returns {ReadableStream}
 */
const fromEvent = (target, eventName) => {
    let _listener
    return new ReadableStream({
        start(controller) {
            _listener = (e) => controller.enqueue(e);
            target.addEventListener(eventName, _listener)
        },
        cancel() {
            target.removeEventListener(eventName, _listener)
        }
    })

};

export {
    fromEvent,
}