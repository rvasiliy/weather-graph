'use strict';

function loadData(url) {
    return fetch(url).then(res => res.json());
}

/**
 * Отрисовка графика
 * 
 * @param {object[]} data Данные [{date, temperature}]
 * @param {CanvasRenderingContext2D} context Контекст canvas
 */
function draw(data, context) {
    const { width, height } = context.canvas;

    drawAxises(context)

    const dataCount = data.length;
    const hourSize = width / dataCount;

    const MAX_TEMPERATURE = 80;
    const temperatureSize = height / MAX_TEMPERATURE;

    context.beginPath();

    data.forEach((item, i) => {
        const { date, temperature } = item;

        const dateTime = new Date(date);

        const x = hourSize * dateTime.getUTCHours();
        const y = height - temperature * temperatureSize - height / 2;

        if (0 === i) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    });

    context.lineWidth = 2;
    context.strokeStyle = '#ff00ff';
    context.stroke();
}

function drawAxises(context) {
    const { width, height } = context.canvas;
    
    context.beginPath();

    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);

    context.strokeStyle = '#0000ff';
    context.stroke();
}

(async () => {
    const data = await loadData('/data/temperature.json');

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    draw(data, ctx);
})();