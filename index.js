import { fromEvent, interval, map, merge, switchMap, takeUntil } from "./operators.js";

const canvas = document.getElementById("canvas");
const clearBtn = document.getElementById("clearBtn");
const ctx = canvas.getContext('2d');

const mouseEvents = {
    down: 'mousedown',
    move: 'mousemove',
    up: 'mouseup',
    leave: 'mouseleave',

    touchStart: 'touchstart',
    touchmove: 'touchmove',
    touchend: 'touchend',

    click: 'click'
}

const resetCanvas = (width, height) => {
    const parent = canvas.parentElement;
    canvas.width = width || parent.clientWidth * 0.9; 
    canvas.height = height || parent.clientHeight * 1.5; 

    ctx.clearRect(0, 0 , canvas.width, canvas.height);
    ctx.strokeStyle = 'green';
    ctx.linewidth = 4;

}

const getMousePosition = (canvasDOM, eventValue) => {
    const rect = canvasDOM.getBoundingClientRect()
    return {
        x: eventValue.clientX - rect.left,
        y: eventValue.clientY - rect.top
    }
};

resetCanvas()

const touchToMouse = (touchEvent, mouseEvent) => {
    const [touch] = touchEvent.touches.length ?
        touchEvent.touches :
        touchEvent.changedTouches

    return new MouseEvent(mouseEvent, {
        clientX: touch.clientX,
        clientY: touch.clientY
    })
};

merge([
    fromEvent(canvas, mouseEvents.down),
    fromEvent(canvas, mouseEvents.touchStart).pipeThrough(map(e => touchToMouse(e, mouseEvents.touchStart)))
])
    .pipeThrough(
        switchMap(e => {
            return merge([
                fromEvent(canvas, mouseEvents.move),
                fromEvent(canvas, mouseEvents.touchmove)
                    .pipeThrough(map(e => touchToMouse(e, mouseEvents.move)))
            ])
                .pipeThrough(
                    takeUntil(
                        merge([
                            fromEvent(canvas, mouseEvents.up),
                            fromEvent(canvas, mouseEvents.leave),
                            fromEvent(canvas, mouseEvents.touchend)
                                .pipeThrough(map(e => touchToMouse(e, mouseEvents.up)))
                        ])
                    )
                )
        })
    )
    .pipeThrough(map(function([mouseDown, mouseMove]) {
        this._lastPosition = this._lastPosition ?? mouseDown
        
        const [from, to] = [this._lastPosition, mouseMove]
            .map(item => {
                return getMousePosition(canvas, item)})
        this._lastPosition = mouseMove.type === mouseEvents.up ? null : mouseMove
        
        return {from, to}
    }))
    .pipeTo(new WritableStream({
        write({ from, to }) {
            
            ctx.moveTo(from.x, from.y)
            ctx.lineTo(to.x, to.y)
            ctx.stroke()
        }
    }))

// fromEvent(canvas, mouseEvents.touchStart)
//     .pipeThrough(map(e => touchToMouse(e, mouseEvents.touchStart)))
//     .pipeTo(new WritableStream({
//         write(mouseDown) {
//             const position = getMousePosition(canvas, mouseDown)
            
//             ctx.moveTo(0, 0)
//             ctx.lineTo(position.x, position.y)
//             ctx.stroke()
//         }
//     }))
