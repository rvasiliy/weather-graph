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
    const TEMPERATURE_ZERO_Y = height / 2;

    const POSITIVE_TEMPERATURE_COLOR = '#ff0000';
    const NEGATIVE_TEMPERATURE_COLOR = '#0000ff';

    context.beginPath();
    context.lineWidth = 2;

    const startTime = Date.parse('2022-05-27T20:00:00Z');
    const MILLISECONDS_IN_HOUR = 3.6e6;

    let isTemperaturePositive = true;

    data.forEach((item, i) => {
        const { date, temperature } = item;

        const dateTime = Date.parse(date);

        const x = hourSize * ((dateTime - startTime) / MILLISECONDS_IN_HOUR);
        const y = height - temperature * temperatureSize - TEMPERATURE_ZERO_Y;

        if (0 === i) {
            context.moveTo(x, y);

            isTemperaturePositive = y <= TEMPERATURE_ZERO_Y;
        } else {
            // переход от положительных температур к отрицательным
            if (TEMPERATURE_ZERO_Y < y && isTemperaturePositive) {
                const { date, temperature } = data[i - 1];
                const dateTime = Date.parse(date);
                const prevX = hourSize * ((dateTime - startTime) / MILLISECONDS_IN_HOUR);
                const prevY = height - temperature * temperatureSize - TEMPERATURE_ZERO_Y;

                const { x: pX, y: pY } = calcAxisXIntersection(prevX, prevY, x, y, TEMPERATURE_ZERO_Y);

                context.lineTo(pX, pY);

                context.strokeStyle = POSITIVE_TEMPERATURE_COLOR;
                context.stroke();

                context.beginPath();
                context.moveTo(pX, pY);

                isTemperaturePositive = false;
            }

            // переход от отрицательных температур к положительным
            if (y <= TEMPERATURE_ZERO_Y && !isTemperaturePositive) {
                const { date, temperature } = data[i - 1];
                const dateTime = Date.parse(date);
                const prevX = hourSize * ((dateTime - startTime) / MILLISECONDS_IN_HOUR);
                const prevY = height - temperature * temperatureSize - TEMPERATURE_ZERO_Y;

                const { x: pX, y: pY } = calcAxisXIntersection(prevX, prevY, x, y, TEMPERATURE_ZERO_Y);

                context.lineTo(pX, pY);

                context.strokeStyle = NEGATIVE_TEMPERATURE_COLOR;
                context.stroke();

                context.beginPath();
                context.moveTo(pX, pY);

                isTemperaturePositive = true;
            }

            context.lineTo(x, y);
        }
    });

    context.strokeStyle = isTemperaturePositive ? POSITIVE_TEMPERATURE_COLOR : NEGATIVE_TEMPERATURE_COLOR;
    context.stroke();
}

function drawAxises(context) {
    const { width, height } = context.canvas;

    // context.beginPath();
    // context.setLineDash([9, 1]);

    // context.moveTo(0, height / 2);
    // context.lineTo(width, height / 2);

    // context.moveTo(0, height);
    // context.lineTo(0, 0);


    // context.strokeStyle = '#000000';
    // context.stroke();

    // context.setLineDash([]);

    drawDashLine(context, width, height / 2, 0, height / 2, 5);
    drawDashLine(context, 0, height, 0, 0, 5);
}

/**
 * Рисует пунктирную линию с заданной шириной штриха
 * 
 * Существует стандартный метод canvas setLineDash(), который
 * позволяет рисовать пунктирные линии. Лучше использовать его.
 * 
 * Эта функция создана в учебных целях
 * 
 * @param {CanvasRenderingContext2D} context Контекст canvas
 * @param {number} startX Начальная координата x
 * @param {number} startY Начальная координата y
 * @param {number} endX Конечная координата x
 * @param {number} endY Конечная координата y
 * @param {number} width Ширина штриха
 */
function drawDashLine(context, startX, startY, endX, endY, width) {
    if (width <= 0) {
        throw new RangeError('Ширина штриха должна быть больше нуля');
    }

    context.beginPath();

    let x = startX;
    let y = startY;

    context.moveTo(x, y);

    const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const dashCount = lineLength / width;

    const deltaX = (endX - startX) / dashCount;
    const deltaY = (endY - startY) / dashCount;

    const directionX = startX <= endX ? 1 : -1;
    const directionY = startY <= endY ? 1 : -1;

    while (true) {
        x += deltaX;
        y += deltaY;

        if ((endX - x) * directionX < 0) {
            x = endX;
        }

        if ((endY - y) * directionY < 0) {
            y = endY;
        }

        context.lineTo(x, y);

        if ((endX - x) * directionX <= 0 && (endY - y) * directionY <= 0) {
            break;
        }

        x += deltaX;
        y += deltaY;

        context.moveTo(x, y);
    }

    context.stroke();
}

/**
 * Вычисляет координату пересечения отрезка с осью OX
 * 
 * @param {number} startX Начальная координата x
 * @param {number} startY Начальная координата y
 * @param {number} endX Конечная координата x
 * @param {number} endY Конечная координата y
 * @param {number} baseY Значение координаты y оси OX
 */
function calcAxisXIntersection(startX, startY, endX, endY, baseY) {
    let delta = (endY - startY) / (baseY - startY);
    let x = startX + ((endX - startX) / delta);

    return {
        x,
        y: baseY
    };
}

// const a = calcAxisXIntersection(startX, startY, endX, endY, baseY) => {x: 2, y: 3}

(async () => {
    const data = await loadData('/data/temperature.json');

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    drawAxises(ctx);
    draw(data, ctx);
})();
