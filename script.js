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

    const dataCount = data.length;
    const hourSize = width / dataCount;

    const MAX_TEMPERATURE = 80;
    const temperatureSize = height / MAX_TEMPERATURE;

    context.beginPath();

    const startTime = Date.parse('2022-05-28T00:00:00Z');
    const MILLISECONDS_IN_HOUR = 3.6e6;

    data.forEach((item, i) => {
        const { date, temperature } = item;

        const dateTime = Date.parse(date);

        const x = hourSize * ((dateTime - startTime) / MILLISECONDS_IN_HOUR);
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

    context.moveTo(0, height);
    context.lineTo(0, 0);

    context.strokeStyle = '#000000';
    context.stroke();
}

(async () => {
    const data = await loadData('/data/temperature.json');

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    drawAxises(ctx);
    draw(data, ctx);
})();