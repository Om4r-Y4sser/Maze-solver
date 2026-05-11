// Use your own OpenWeatherMap API Key below
// const apiKey = '{{OpenWeatherMap_API_KEY_HERE}};'

const weatherContainer = document.getElementById("weather");
const city = document.getElementById("city");
const error = document.getElementById('error');

const units = 'imperial'; //can be imperial or metric
let temperatureSymobol = units == 'imperial' ? "°F" : "°C";

async function fetchWeather() {
    try {
        weatherContainer.innerHTML = '';
        error.innerHTML = '';
        city.innerHTML = '';


        const cnt = 10;
        const cityInputtedByUser = document.getElementById('cityInput').value;

        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInputtedByUser}&appid=${apiKey}&units=${units}&cnt=${cnt}`;


        const response = await fetch(apiUrl);
        const data = await response.json();

        //Display error if user types invalid city or no city
        if (data.cod == '400' || data.cod == '404') {
            error.innerHTML = `Not valid city. Please input another city`;
            return;
        }
        //Display weather data for each 3 hour increment
        data.list.forEach(hourlyWeatherData => {
            const hourlyWeatherDataDiv = createWeatherDescription(hourlyWeatherData);
            weatherContainer.appendChild(hourlyWeatherDataDiv);
        });

        // Display city name based on latitude and longitude
        city.innerHTML = `Hourly Weather for ${data.city.name}`;

    } catch (error) {
        console.log(error);
    }
}

function convertToLocalTime(dt) {

    // Create a new Date object by multiplying the Unix timestamp by 1000 to convert it to milliseconds
    // Will produce a time in the local timezone of user's computer
    const date = new Date(dt * 1000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours() % 12 || 12).padStart(2, '0'); // Convert 24-hour to 12-hour format
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const period = date.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM

    // Formatted date string in the format: YYYY-MM-DD hh:mm:ss AM/PM
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${period}`;

}

function createWeatherDescription(weatherData) {
    const { main, dt } = weatherData;

    const description = document.createElement("div");
    const convertedDateAndTime = convertToLocalTime(dt);

    // '2023-11-07 07:00:00 PM'
    description.innerHTML = `
        <div class = "weather_description">${main.temp}${temperatureSymobol} - ${convertedDateAndTime.substring(10)} - ${convertedDateAndTime.substring(5, 10)} </div>
    `;
    return description;
}

