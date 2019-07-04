const OWConf = require('./conf/config.json').openweather;
const rp = require('request-promise');
var jp = require('jsonpath');

const metrics = [
    {name: 'temperature', parameter: '$.main.temp'},
    {name: 'humidity', parameter: '$.main.humidity'},
    {name: 'pressure', parameter: '$.main.pressure'},
    {name: 'wind_speed', parameter: '$.wind.speed'},
    {name: 'wind_direction', parameter: '$.wind.deg'}
];

exports.getCurrentWeatherForLocations = function () {
    return rp({
        qs: {
            appid: OWConf.appId,
            id: OWConf.locationCodes.join(','),
            units: OWConf.units
        },
        uri: OWConf.apiUrl + '/group',
        json: true
    })
        .then(resp => {
            if (!resp.list) {
                console.error('No valid weather data returned');
            }
            return getMetricsFromWeatherData(resp)
        });
};

function getMetricsFromWeatherData(weatherData) {
    var data = [];

    weatherData.list.forEach(function (locationData) {
        metrics
            .map(metric => buildWeatherMetric(locationData, metric))
            .forEach(metric => data.push(metric))
    });

    return data;
}

function buildWeatherMetric(weatherData, metric) {
    return {
        name: 'current',
        parameters: {
            namespace: 'weather',
            tags: {
                location: weatherData.name,
                country: weatherData.sys.country,
                measure: metric.measure,
                units: OWConf.units
            }
        },
        value: jp.value(weatherData, metric.parameter)
    };
}