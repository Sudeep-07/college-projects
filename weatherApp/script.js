const apiKey = "411058640105e3f9dd52bddd25924ac6"; // Replace with your OpenWeatherMap API Key

async function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (city === "") return;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("cityName").textContent = `Weather in ${data.name}`;
        document.getElementById("temperature").textContent = `${data.main.temp}°C`;
        document.getElementById("description").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("windSpeed").textContent = `${data.wind.speed} km/h`;
    } catch (error) {
        alert("City not found. Please try again.");
    }
}
