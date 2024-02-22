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

/**
 * 
 * @param {Number} ms
 * @returns {ReadableStream} 
 */
const interval = (ms) => {
    let _intervalId
    return new ReadableStream({
        start(controller){
            _intervalId = setInterval(() => {
                controller.enqueue(Date.now())
            }, ms);
        },
        cancel(){
            clearInterval(_intervalId);
        }
    })
};

/**
 * 
 * @param {Function} fn
 * @returns {TransformStream} 
 */
const map = (fn) => {
    return new TransformStream({
        //ao inicializar o objeto -> start
        //a medida que recebe os dados -> transform
        transform(chunk, controller){
            controller.enqueue(fn(chunk))
        }
    })
};
//TransformStream -> Writeable e Readble

export {
    fromEvent,
    interval,
    map
}