'use strict';

function loadData(url) {
    return fetch(url).then(res => res.json());
}

(async () => {
    const data = await loadData('/data/temperature.json');
})();