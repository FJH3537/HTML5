$(document).ready(function () {
    const cities = {
        'kuala-lumpur': { name: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869 },
        'george-town': { name: 'George Town', latitude: 5.4141, longitude: 100.3288 },
        'johor-bahru': { name: 'Johor Bahru', latitude: 1.4927, longitude: 103.7414 },
        'kuching': { name: 'Kuching', latitude: 1.5533, longitude: 110.3592 },
        'kota-kinabalu': { name: 'Kota Kinabalu', latitude: 5.9804, longitude: 116.0735 }
    };

    const storedCity = sessionStorage.getItem('gt_selectedSmartCity');
    if (storedCity && cities[storedCity]) {
        $('#city-select').val(storedCity);
    }

    function weatherLabel(code) {
        if (!Number.isFinite(code)) return 'Data unavailable';
        if (code === 0) return 'Clear sky';
        if ([1, 2, 3].includes(code)) return 'Partly cloudy';
        if ([45, 48].includes(code)) return 'Foggy';
        if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
        if ([61, 63, 65, 66, 67].includes(code)) return 'Rain';
        if ([80, 81, 82].includes(code)) return 'Rain showers';
        if ([95, 96, 99].includes(code)) return 'Thunderstorm';
        return 'Current weather';
    }

    function hasNumber(value) {
        return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
    }

    function formatMetric(value, unit, decimals) {
        if (!hasNumber(value)) return 'Data unavailable';
        const number = Number(value);
        const formatted = decimals === 1 ? number.toFixed(1) : Math.round(number);
        return formatted + (unit ? ' ' + unit : '');
    }

    function aqiInfo(value) {
        if (!hasNumber(value)) return { label: 'Data unavailable', className: 'aqi-unavailable' };
        const aqi = Number(value);
        if (aqi <= 20) return { label: 'Good', className: 'aqi-good' };
        if (aqi <= 40) return { label: 'Fair', className: 'aqi-fair' };
        if (aqi <= 60) return { label: 'Moderate', className: 'aqi-moderate' };
        if (aqi <= 80) return { label: 'Poor', className: 'aqi-poor' };
        return { label: 'Very poor', className: 'aqi-very-poor' };
    }

    function setApiStatus(status) {
        const statusText = {
            connecting: 'Connecting…',
            connected: 'Live data connected',
            unavailable: 'Connection unavailable'
        };
        $('#api-status')
            .removeClass('status-connecting status-connected status-unavailable')
            .addClass('status-' + status);
        $('#api-status-text').text(statusText[status]);
    }

    function updateAqiDisplay(value) {
        const info = aqiInfo(value);
        $('#aqi-value').text(formatMetric(value, '', 0));
        $('#aqi-badge')
            .removeClass('aqi-good aqi-fair aqi-moderate aqi-poor aqi-very-poor aqi-unavailable')
            .addClass(info.className)
            .text(info.label);
    }

    function updateInsight(city, weather, air) {
        const aqi = hasNumber(air.european_aqi) ? Number(air.european_aqi) : null;
        const pm25 = hasNumber(air.pm2_5) ? Number(air.pm2_5) : null;
        const solar = hasNumber(weather.shortwave_radiation) ? Number(weather.shortwave_radiation) : null;
        const wind = hasNumber(weather.wind_speed_10m) ? Number(weather.wind_speed_10m) : null;
        let insight;

        if (aqi !== null && aqi > 60) {
            insight = {
                icon: 'fa-lungs',
                title: 'Prioritise cleaner air and low-emission mobility',
                copy: 'The current air-quality level makes pollution monitoring, shaded public transport and lower-emission travel especially relevant.',
                reason: city.name + ' currently has an AQI of ' + Math.round(aqi) + ' and PM2.5 of ' + (pm25 === null ? 'an unavailable value' : pm25.toFixed(1) + ' µg/m³') + '. Therefore, air monitoring and lower-emission transport should be prioritised.',
                system: 'mobility',
                systemLabel: 'Mobility'
            };
        } else if (solar !== null && solar >= 300) {
            insight = {
                icon: 'fa-solar-panel',
                title: 'Strong conditions for visible solar applications',
                copy: 'Current solar radiation supports exploring rooftop generation, shaded solar walkways and renewable charging demonstrations.',
                reason: city.name + ' currently has solar radiation of ' + Math.round(solar) + ' W/m². Therefore, smart energy controls and visible solar applications are a relevant priority.',
                system: 'energy',
                systemLabel: 'Energy'
            };
        } else if (wind !== null && wind >= 20) {
            insight = {
                icon: 'fa-wind',
                title: 'Use wind data to improve outdoor planning',
                copy: 'Current wind conditions can inform natural ventilation, comfortable pedestrian routes and the placement of environmental sensors.',
                reason: city.name + ' currently has a wind speed of ' + Math.round(wind) + ' km/h. Therefore, mobility planning can use current wind conditions to improve pedestrian comfort and route design.',
                system: 'mobility',
                systemLabel: 'Mobility'
            };
        } else if (aqi !== null || solar !== null || wind !== null) {
            insight = {
                icon: 'fa-building-circle-check',
                title: 'Begin with efficient buildings and responsive controls',
                copy: 'Moderate conditions make energy monitoring, efficient cooling and smart lighting dependable first steps for city facilities.',
                reason: city.name + ' currently has an AQI of ' + (aqi === null ? 'an unavailable value' : Math.round(aqi)) + ', PM2.5 of ' + (pm25 === null ? 'an unavailable value' : pm25.toFixed(1) + ' µg/m³') + ' and solar radiation of ' + (solar === null ? 'an unavailable value' : Math.round(solar) + ' W/m²') + '. These values do not meet the stronger air, solar or wind triggers, so efficient energy management is a dependable starting point.',
                system: 'energy',
                systemLabel: 'Energy'
            };
        } else {
            insight = {
                icon: 'fa-circle-info',
                title: 'Environmental priority needs more data',
                copy: 'Some live values are unavailable. Refresh the dashboard later to generate a condition-based city recommendation.',
                reason: 'The AQI, PM2.5, solar and wind values needed to explain a recommendation are currently unavailable.',
                system: null,
                systemLabel: ''
            };
        }

        $('#insight-location').text(city.name + ' insight');
        $('#insight-icon').attr('class', 'fa-solid ' + insight.icon);
        $('#insight-title').text(insight.title);
        $('#insight-copy').text(insight.copy);
        $('#insight-reason').html('<strong>Why this recommendation?</strong> ' + insight.reason);

        if (insight.system) {
            $('#explore-system-btn')
                .removeClass('d-none')
                .attr('data-system', insight.system)
                .html('Explore the ' + insight.systemLabel + ' System <i class="fa-solid fa-arrow-down ms-2"></i>');
        } else {
            $('#explore-system-btn').addClass('d-none');
        }
    }

    function showLoading() {
        setApiStatus('connecting');
        $('#loading-panel').removeClass('d-none');
        $('#metric-grid, #error-panel').addClass('d-none');
        $('#refresh-data').prop('disabled', true).html('<i class="fa-solid fa-circle-notch fa-spin me-2"></i>Loading data');
    }

    function showError() {
        setApiStatus('unavailable');
        $('#loading-panel, #metric-grid').addClass('d-none');
        $('#error-panel').removeClass('d-none');
        $('#refresh-data').prop('disabled', false).html('<i class="fa-solid fa-rotate me-2"></i>Refresh live data');
        $('#insight-title').text('Live recommendation unavailable');
        $('#insight-copy').text('Reconnect to the internet and retry the dashboard to generate a city priority.');
        $('#insight-reason').html('<strong>Why this recommendation?</strong> Live values could not be retrieved, so no data-based priority can be explained.');
        $('#explore-system-btn').addClass('d-none');
    }

    function loadCityData() {
        const cityId = $('#city-select').val();
        const city = cities[cityId];
        sessionStorage.setItem('gt_selectedSmartCity', cityId);
        showLoading();

        const weatherRequest = $.ajax({
            url: 'https://api.open-meteo.com/v1/forecast',
            method: 'GET',
            dataType: 'json',
            timeout: 12000,
            data: {
                latitude: city.latitude,
                longitude: city.longitude,
                current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,shortwave_radiation',
                timezone: 'auto'
            }
        });

        const airRequest = $.ajax({
            url: 'https://air-quality-api.open-meteo.com/v1/air-quality',
            method: 'GET',
            dataType: 'json',
            timeout: 12000,
            data: {
                latitude: city.latitude,
                longitude: city.longitude,
                current: 'pm2_5,pm10,european_aqi',
                timezone: 'auto'
            }
        });

        $.when(weatherRequest, airRequest)
            .done(function (weatherResult, airResult) {
                const weatherData = weatherResult[0];
                const airData = airResult[0];
                const weather = weatherData.current || {};
                const air = airData.current || {};
                const weatherUnits = weatherData.current_units || {};
                const airUnits = airData.current_units || {};

                $('#temperature-value').text(formatMetric(weather.temperature_2m, weatherUnits.temperature_2m || '°C', 0));
                $('#humidity-value').text(formatMetric(weather.relative_humidity_2m, weatherUnits.relative_humidity_2m || '%', 0));
                $('#wind-value').text(formatMetric(weather.wind_speed_10m, weatherUnits.wind_speed_10m || 'km/h', 0));
                $('#solar-value').text(formatMetric(weather.shortwave_radiation, weatherUnits.shortwave_radiation || 'W/m²', 0));
                updateAqiDisplay(air.european_aqi);
                $('#pm-value').text(formatMetric(air.pm2_5, airUnits.pm2_5 || 'μg/m³', 1));
                $('#weather-note').text(weatherLabel(Number(weather.weather_code)));
                $('#aqi-note').text('Based on the European AQI scale');

                const updatedText = new Intl.DateTimeFormat('en-MY', {
                    timeZone: 'Asia/Kuala_Lumpur',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }).format(new Date()).replace('am', 'AM').replace('pm', 'PM');
                $('#updated-time').text('Last updated: ' + updatedText + ' MYT');
                updateInsight(city, weather, air);

                $('#loading-panel, #error-panel').addClass('d-none');
                $('#metric-grid').removeClass('d-none');
                $('#refresh-data').prop('disabled', false).html('<i class="fa-solid fa-rotate me-2"></i>Refresh live data');
                setApiStatus('connected');
            })
            .fail(function () {
                showError();
            });
    }

    $('#city-select').on('change', loadCityData);
    $('#refresh-data, #retry-data').on('click', loadCityData);
    loadCityData();

    const systems = {
        energy: {
            icon: 'fa-building-circle-check',
            kicker: 'Efficient infrastructure',
            title: 'Smart energy management',
            description: 'Meters and building controls reveal when electricity is used, helping facility teams reduce waste and shift demand away from peak periods.',
            collected: 'Smart meters record electricity demand across buildings and public infrastructure.',
            response: 'Building controls adjust lighting, cooling and battery use according to current demand.',
            result: 'The city uses energy more efficiently and reduces unnecessary peak demand.'
        },
        mobility: {
            icon: 'fa-route',
            kicker: 'Accessible movement',
            title: 'Connected low-carbon mobility',
            description: 'Real-time information helps people combine walking, cycling and public transport while city teams respond to congestion more effectively.',
            collected: 'GPS, traffic sensors, transport schedules and passenger demand show how people move.',
            response: 'Traffic systems update routes, signals, arrival information and charging availability.',
            result: 'People experience more reliable journeys, less congestion and lower transport emissions.'
        },
        air: {
            icon: 'fa-lungs',
            kicker: 'Healthier neighbourhoods',
            title: 'Distributed air-quality sensing',
            description: 'A network of small sensors shows how air conditions change across neighbourhoods, supporting targeted action and clearer public communication.',
            collected: 'Street sensors record AQI, PM2.5 and other pollutants at different locations.',
            response: 'The city issues alerts and targets traffic, planting or enforcement measures where needed.',
            result: 'Environmental problems are detected faster and residents receive clearer health information.'
        },
        waste: {
            icon: 'fa-dumpster',
            kicker: 'Circular resources',
            title: 'Intelligent waste collection',
            description: 'Fill-level sensors and material tracking can reduce unnecessary trips while helping cities recover more useful resources.',
            collected: 'Bin sensors and material records show fill levels, locations and contamination patterns.',
            response: 'Collection routes are scheduled according to need and problem areas receive targeted guidance.',
            result: 'The city reduces unnecessary collection trips and recovers more reusable or recyclable material.'
        },
        water: {
            icon: 'fa-faucet-drip',
            kicker: 'Resilient water services',
            title: 'Smart water monitoring',
            description: 'Flow meters and pressure sensors can identify unusual consumption and possible leaks before they become larger losses.',
            collected: 'Flow meters and pressure sensors record water use and changes across the network.',
            response: 'The system flags unusual patterns and directs maintenance teams to the affected zone.',
            result: 'Leaks are detected earlier, water loss is reduced and repairs are completed faster.'
        },
        lighting: {
            icon: 'fa-lightbulb',
            kicker: 'Safer efficient streets',
            title: 'Sensor-controlled streetlighting',
            description: 'Connected streetlights can adjust brightness to activity and daylight while reporting faults directly to maintenance teams.',
            collected: 'Motion and daylight sensors detect current activity and natural-light conditions.',
            response: 'The lighting controller adjusts LED brightness and reports faults to maintenance teams.',
            result: 'The city reduces electricity waste while maintaining safe visibility.'
        }
    };

    $('.system-btn').on('click', function () {
        const system = systems[$(this).data('system')];
        $('.system-btn').removeClass('active').attr('aria-pressed', 'false');
        $(this).addClass('active').attr('aria-pressed', 'true');

        $('#system-icon').attr('class', 'fa-solid ' + system.icon);
        $('#system-kicker').text(system.kicker);
        $('#system-title').text(system.title);
        $('#system-description').text(system.description);
        $('#system-data').text(system.collected);
        $('#system-response').text(system.response);
        $('#system-result').text(system.result);
    });

    $('#explore-system-btn').on('click', function () {
        const targetSystem = $(this).attr('data-system');
        $('.system-btn[data-system="' + targetSystem + '"]').trigger('click');
        $('html, body').stop(true).animate({
            scrollTop: $('#smart-city-systems').offset().top - 80
        }, 550);
    });
});

