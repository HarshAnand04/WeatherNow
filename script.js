const API_KEY = "YOUR_API_KEY_HERE";
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');
const animationContainer = document.getElementById('animation-container');
const loadingEl = document.getElementById('loading');
const unitToggleBtn = document.getElementById('unit-toggle');

// --- State ---
let currentUnit = 'metric'; // 'metric' (°C) or 'imperial' (°F)
let lastCity = '';

// --- Unit Toggle ---
unitToggleBtn.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggleBtn.textContent = currentUnit === 'metric' ? '°C' : '°F';
    if (lastCity) fetchWeather();
});

// --- Event Listeners ---
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchWeather();
});

// --- Helpers ---
function formatTime(unixTimestamp, timezoneOffset) {
    // timezoneOffset is in seconds from OpenWeatherMap
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatVisibility(meters) {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
}

function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
    weatherInfo.classList.toggle('hidden', show || weatherInfo.dataset.loaded !== 'true');
}

function showError(msg) {
    errorMessage.textContent = msg;
    weatherInfo.classList.add('hidden');
    animationContainer.innerHTML = '';
    showLoading(false);
}

// --- Main Fetch ---
async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    errorMessage.textContent = '';
    showLoading(true);
    lastCity = city;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '404' || data.cod === 404) {
            showError('City not found! Please check the spelling.');
            return;
        }

        if (data.cod !== 200) {
            showError(`Error: ${data.message || 'Something went wrong.'}`);
            return;
        }

        renderWeather(data);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

// --- Render ---
function renderWeather(data) {
    const { name, sys, weather, main, wind, visibility, clouds, timezone } = data;
    const unitLabel = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

    // Primary
    document.getElementById('city-name').textContent = name;
    document.getElementById('country-region').textContent = sys.country ? `📍 ${sys.country}` : '';
    document.getElementById('weather-condition').textContent =
        weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1);

    // Icon from OpenWeatherMap
    const iconCode = weather[0].icon;
    const iconEl = document.getElementById('weather-icon');
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    iconEl.alt = weather[0].description;

    // Temperature
    document.getElementById('temperature').textContent = `${Math.round(main.temp)}${unitLabel}`;
    document.getElementById('feels-like').textContent = `Feels like ${Math.round(main.feels_like)}${unitLabel}`;

    // Details
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${wind.speed} ${windUnit}`;
    document.getElementById('temp-range').textContent =
        `${Math.round(main.temp_min)}${unitLabel} / ${Math.round(main.temp_max)}${unitLabel}`;
    document.getElementById('visibility').textContent =
        visibility !== undefined ? formatVisibility(visibility) : 'N/A';
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    document.getElementById('cloud-cover').textContent = clouds ? `${clouds.all}%` : 'N/A';

    // Sunrise / Sunset (adjusted for city timezone)
    document.getElementById('sunrise').textContent = formatTime(sys.sunrise, timezone);
    document.getElementById('sunset').textContent = formatTime(sys.sunset, timezone);

    // Last updated
    const now = new Date();
    document.getElementById('last-updated').textContent =
        `Updated at ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

    // Show card
    weatherInfo.dataset.loaded = 'true';
    weatherInfo.classList.remove('hidden');
    showLoading(false);
    errorMessage.textContent = '';

    // Animation
    const weatherType = weather[0].main.toLowerCase();
    addAnimation(weatherType);
}

// --- Animations ---
function addAnimation(weatherType) {
    animationContainer.innerHTML = '';
    document.body.className = ''; // reset all bg classes

    switch (weatherType) {
        case 'clear':
            document.body.classList.add('clear-bg');
            animationContainer.innerHTML = buildBirds() + buildSun();
            break;

        case 'clouds':
            document.body.classList.add('cloudy-bg');
            animationContainer.innerHTML = buildClouds(4);
            break;

        case 'rain':
        case 'drizzle':
            document.body.classList.add('rain-bg');
            animationContainer.innerHTML = buildClouds(2) + buildRain(30);
            break;

        case 'thunderstorm':
            document.body.classList.add('storm-bg');
            animationContainer.innerHTML = buildClouds(3) + buildRain(20) + buildLightning();
            break;

        case 'snow':
            document.body.classList.add('snow-bg');
            animationContainer.innerHTML = buildSnow(25);
            break;

        case 'mist':
        case 'haze':
        case 'fog':
        case 'smoke':
        case 'dust':
        case 'sand':
        case 'ash':
        case 'squall':
            document.body.classList.add('fog-bg');
            animationContainer.innerHTML = buildFog(5);
            break;

        case 'tornado':
            document.body.classList.add('storm-bg');
            animationContainer.innerHTML = buildTornado();
            break;

        default:
            console.warn(`No animation for: ${weatherType}`);
            animationContainer.innerHTML = '';
            break;
    }
}

// --- Animation Builders ---
function buildSun() {
    return `<div class="sun"></div>`;
}

function buildBirds() {
    return `
    <div class="birds">
        <div class="bird bird1">
            <div class="wing wing-left"></div>
            <div class="wing wing-right"></div>
        </div>
        <div class="bird bird2">
            <div class="wing wing-left"></div>
            <div class="wing wing-right"></div>
        </div>
        <div class="bird bird3">
            <div class="wing wing-left"></div>
            <div class="wing wing-right"></div>
        </div>
        <div class="bird bird4">
            <div class="wing wing-left"></div>
            <div class="wing wing-right"></div>
        </div>
    </div>`;
}

function buildClouds(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        const topPct = 5 + Math.random() * 30;
        const delay = Math.random() * -20;
        const duration = 18 + Math.random() * 20;
        const scale = 0.5 + Math.random() * 0.8;
        const opacity = 0.6 + Math.random() * 0.4;
        html += `<div class="cloud" style="
            top:${topPct}%;
            animation-delay:${delay}s;
            animation-duration:${duration}s;
            transform:scale(${scale});
            opacity:${opacity};
        "></div>`;
    }
    return html;
}

function buildRain(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        const left = Math.random() * 100;
        const delay = Math.random() * -2;
        const duration = 0.6 + Math.random() * 0.8;
        const height = 10 + Math.random() * 15;
        html += `<div class="raindrop" style="
            left:${left}%;
            animation-delay:${delay}s;
            animation-duration:${duration}s;
            height:${height}px;
        "></div>`;
    }
    return html;
}

function buildLightning() {
    return `
    <div class="lightning bolt1"></div>
    <div class="lightning bolt2"></div>`;
}

function buildSnow(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        const left = Math.random() * 100;
        const delay = Math.random() * -8;
        const duration = 4 + Math.random() * 6;
        const size = 4 + Math.random() * 6;
        const drift = (Math.random() - 0.5) * 60;
        html += `<div class="snowflake" style="
            left:${left}%;
            animation-delay:${delay}s;
            animation-duration:${duration}s;
            width:${size}px;
            height:${size}px;
            --drift:${drift}px;
        "></div>`;
    }
    return html;
}

function buildFog(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        const topPct = 10 + i * 15;
        const delay = i * -3;
        const duration = 10 + i * 4;
        html += `<div class="fog-layer" style="
            top:${topPct}%;
            animation-delay:${delay}s;
            animation-duration:${duration}s;
            opacity:${0.3 + i * 0.05};
        "></div>`;
    }
    return html;
}

function buildTornado() {
    return `
    <div class="tornado">
        <div class="tornado-ring r1"></div>
        <div class="tornado-ring r2"></div>
        <div class="tornado-ring r3"></div>
        <div class="tornado-ring r4"></div>
        <div class="tornado-ring r5"></div>
    </div>`;
}