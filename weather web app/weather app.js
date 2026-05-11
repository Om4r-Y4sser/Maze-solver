function getWeather() {
  const apiKey = "b62c11d22a70b968136e8f13cf7d5459";
  const city = document.getElementById('city').value;

  if (!city) {
    alert('Please enter a city');
    return;
  }

  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  fetch(currentUrl)
    .then(response => response.json())
    .then(data => {
      displayWeather(data);
    })
    .catch(error => {
      console.error('Error fetching current weather data:', error);
      alert('Error fetching current weather data. Please try again.');
    });

  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => {
      displayHourForecast(data.list);
    })
    .catch(error => {
      console.error('Error fetching hourly forecast data:', error);
      alert('Error fetching hourly forecast data. Please try again.');
    });
}

function displayWeather(data) {
  const tempDivInfo = document.getElementById('temp-div');
  const weatherInfoDiv = document.getElementById('weather-info');
  const weatherIcon = document.getElementById('weather-icon');
  const hourlyForecastDiv = document.getElementById('hourly-forecast');

  // Clear previous data
  weatherInfoDiv.innerHTML = '';
  hourlyForecastDiv.innerHTML = '';
  tempDivInfo.innerHTML = '';

  if (data.cod === '404' || data.cod === 404) {
    weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    weatherIcon.style.display = 'none';
    return;
  }

  // Extract all relevant weather data
  const cityName = data.name;
  const temperature = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const minTemp = Math.round(data.main.temp_min);
  const maxTemp = Math.round(data.main.temp_max);
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const windSpeed = data.wind.speed;
  const windDeg = data.wind.deg;
  const clouds = data.clouds.all;
  const visibility = data.visibility / 1000; // Convert to km
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  const description = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  // Display temperature
  tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;

  // Display all weather details
  weatherInfoDiv.innerHTML = `
    <p><strong>${cityName}</strong></p>
    <p><strong>Weather:</strong> ${description}</p>
    <p><strong>Feels Like:</strong> ${feelsLike}°C</p>
    <p><strong>Min Temp:</strong> ${minTemp}°C</p>
    <p><strong>Max Temp:</strong> ${maxTemp}°C</p>
    <p><strong>Humidity:</strong> ${humidity}%</p>
    <p><strong>Pressure:</strong> ${pressure} hPa</p>
    <p><strong>Wind Speed:</strong> ${windSpeed} m/s (${windDeg}°)</p>
    <p><strong>Cloudiness:</strong> ${clouds}%</p>
    <p><strong>Visibility:</strong> ${visibility} km</p>
    <p><strong>Sunrise:</strong> ${sunrise}</p>
    <p><strong>Sunset:</strong> ${sunset}</p>
  `;

  weatherIcon.src = iconUrl;
  weatherIcon.alt = description;
  weatherIcon.style.display = 'block';
}

function displayHourForecast(forecastData) {
  const day1 = forecastData[0];
  const day2 = forecastData[8];
  const day3 = forecastData[16];

  const formatDay = (forecast) => {
    const date = new Date(forecast.dt * 1000);
    const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

    return `
            <div class="forecast-day">
                ${date.toLocaleDateString('en', { weekday: 'short' })}
                <img src="${iconUrl}" alt="${forecast.weather[0].description}">
                ${Math.round(forecast.main.temp)}°C
            </div>
        `;

  };

  document.getElementById('day1').textContent = formatDay(day1);
  document.getElementById('day2').textContent = formatDay(day2);
  document.getElementById('day3').textContent = formatDay(day3);
}