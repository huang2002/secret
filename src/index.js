// @ts-check
const { createElement: h } = X;

const MAIN_COLOR = '#222';
const BG_COLOR = '#EEE';
const LINE_WIDTH = 36;

const content = location.search.length > 1
    ? decodeURIComponent(location.search.slice(1))
    : 'use query string to customize your secret';

const canvas = /** @type {HTMLCanvasElement} */(
    h('canvas', {
        style: {
            position: 'fixed',
            left: '0',
            top: '0',
        },
    })
);

const paragraph = h('p', {
    style: {
        position: 'fixed',
        left: '0',
        top: '40%',
        width: '100%',
        padding: '0 1em',
        color: MAIN_COLOR,
        fontFamily: 'sans-serif',
        fontSize: '25px',
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
    },
},
    content,
);

const hint = h('p', {
    style: {
        position: 'fixed',
        left: '0',
        bottom: '1em',
        width: '100%',
        color: '#666',
        fontSize: '18px',
        textAlign: 'center',
    },
},
    '（刮开有惊喜）',
);

const mask = h('div', {
    style: {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
    },
});

document.body.appendChild(
    h('div', {
        id: 'app',
    },
        canvas,
        paragraph,
        hint,
        mask,
    )
);

let currentWidth = window.innerWidth;
let currentHeight = window.innerHeight;

const context = canvas.getContext('2d');

/**
 * @typedef {[number, number]} Point
 */

/**
 * @typedef {Point[]} Path
 */

/**
 * @type {Path[]}
 */
let paths = [];

const render = () => {
    context.fillStyle = MAIN_COLOR;
    context.fillRect(0, 0, currentWidth, currentHeight);
    context.beginPath();
    paths.forEach(path => {
        path.forEach((p, i) => {
            if (i) {
                context.lineTo(p[0], p[1]);
            } else {
                context.moveTo(p[0], p[1]);
            }
        });
    });
    context.strokeStyle = BG_COLOR;
    context.lineWidth = LINE_WIDTH;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
};

/**
 * @type {Path}
 */
let currentPath;
let isScraping = false;

/**
 * @param {number} x
 * @param {number} y
 */
const renderIncrement = (x, y) => {
    const lastPoint = currentPath[currentPath.length - 1];
    context.beginPath();
    context.moveTo(lastPoint[0], lastPoint[1]);
    context.lineTo(x, y);
    context.strokeStyle = BG_COLOR;
    context.lineWidth = LINE_WIDTH;
    context.lineCap = 'round';
    context.stroke();
};

/**
 * @param {number} x
 * @param {number} y
 */
const startPath = (x, y) => {
    currentPath = [[x, y]];
    paths.push(currentPath);
    isScraping = true;
};

/**
 * @param {number} x
 * @param {number} y
 */
const continuePath = (x, y) => {
    renderIncrement(x, y);
    currentPath.push([x, y]);
};

/**
 * @param {number} x
 * @param {number} y
 */
const endPath = (x, y) => {
    renderIncrement(x, y);
    currentPath.push([x, y]);
    isScraping = false;
};

if (navigator.maxTouchPoints) {
    mask.addEventListener('touchstart', event => {
        event.preventDefault();
        const touch = event.changedTouches[0];
        startPath(touch.clientX, touch.clientY);
    }, { passive: false });
    mask.addEventListener('touchmove', event => {
        event.preventDefault();
        if (isScraping) {
            const touch = event.changedTouches[0];
            continuePath(touch.clientX, touch.clientY);
        }
    }, { passive: false });
    mask.addEventListener('touchend', event => {
        const touch = event.changedTouches[0];
        endPath(touch.clientX, touch.clientY);
    });
} else {
    mask.addEventListener('mousedown', event => {
        event.preventDefault();
        startPath(event.clientX, event.clientY);
    }, { passive: false });
    mask.addEventListener('mousemove', event => {
        event.preventDefault();
        if (isScraping) {
            continuePath(event.clientX, event.clientY);
        }
    }, { passive: false });
    mask.addEventListener('mouseup', event => {
        endPath(event.clientX, event.clientY);
    });
}

const onResize = () => {
    if (paths.length) {
        const scaleX = window.innerWidth / currentWidth;
        const scaleY = window.innerHeight / currentHeight;
        paths = paths.map(path => (
            path.map(p => ([
                p[0] * scaleX,
                p[1] * scaleY,
            ]))
        ));
    }
    currentWidth = window.innerWidth;
    currentHeight = window.innerHeight;
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    render();
};

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

onResize();
