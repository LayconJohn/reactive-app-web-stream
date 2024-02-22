import { fromEvent, interval, map } from "./operators.js";

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

//pipeTo: Escrever dados. pipetrought -> Tranformar dados

fromEvent(canvas, mouseEvents.touchStart)
    .pipeThrough(map(e => touchToMouse(e, mouseEvents.touchStart)))
    .pipeTo(new WritableStream({
        write(mouseDown) {
            const position = getMousePosition(canvas, mouseDown)
            
            ctx.moveTo(0, 0)
            ctx.lineTo(position.x, position.y)
            ctx.stroke()
        }
    }))
