const Conf = require('./conf/config.json');
const owm = require('./open-weather-map');
const Statful = require('statful-client');
const statful = new Statful(Conf.statful);

setInterval(() => {
    console.log('Collecting weather data.');
    owm.getCurrentWeatherForLocations()
        .then(resp => resp.forEach(metric => statful.gauge(metric.name, metric.value, metric.parameters)))
        .catch(function (err) {
            console.error(err)
        });
}, Conf.openweather.checkPeriodSeconds);