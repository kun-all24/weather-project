const apiKey = '4ca6ca16185496cb252cef5cdf3d3499';
const searchHistoryKey = 'weatherSearchHistory';

function showSearchModal() {
  const searchModal = document.getElementById('searchModal');
  const modalContent = searchModal.querySelector('.modal');
  searchModal.classList.remove('hidden');
  setTimeout(() => {
    modalContent.classList.remove('hide');
    modalContent.classList.add('show');
    document.getElementById('cityInput').classList.add('expanded-input');
  }, 10);
}

function closeSearchModal() {
  const searchModal = document.getElementById('searchModal');
  const modalContent = searchModal.querySelector('.modal');
  modalContent.classList.remove('show');
  modalContent.classList.add('hide');
  setTimeout(() => {
    searchModal.classList.add('hidden');
  }, 300);
}

function searchWeather() {
  const cityInput = document.getElementById('cityInput');
  const city = cityInput.value.trim();  // Trim any whitespace
  if (city) {
    addToHistory(city);
    fetchWeather(city);
    closeSearchModal();
    cityInput.value = '';
  } else {
    showError('Please enter a city name');
  }
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    });
  }
}

function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('City not found');
      }
      return response.json();
    })
    .then(data => updateWeatherToday(data))
    .catch(error => showError(error.message));
}

function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Unable to fetch weather data for the location');
      }
      return response.json();
    })
    .then(data => updateWeatherToday(data))
    .catch(error => showError(error.message));
}

function showError(message) {
  alert(message);
}

function updateWeatherToday(data) {
  const cityName = `${data.name} (${new Date().toISOString().slice(0, 10)})`;
  const temperature = `${data.main.temp}°C`;
  const wind = `Wind: ${data.wind.speed} M/S`;
  const humidity = `Humidity: ${data.main.humidity}%`;
  const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  const weatherDescription = data.weather[0].description;

  document.getElementById('cityName').innerText = cityName;
  document.getElementById('temperature').innerText = temperature;
  document.getElementById('wind').innerText = wind;
  document.getElementById('humidity').innerText = humidity;
  document.getElementById('weatherIcon').src = weatherIcon;
  document.getElementById('weatherIcon').classList.remove('hidden');
  document.getElementById('weatherDescription').innerText = weatherDescription;

  document.getElementById('weatherToday').classList.remove('hidden');
  document.getElementById('forecast').classList.remove('hidden');

  fetchForecast(data.coord.lat, data.coord.lon);
}

function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  fetch(url)
    .then(response => response.json())
    .then(data => updateForecast(data))
    .catch(error => console.error('Error fetching forecast data:', error));
}

function updateForecast(data) {
  const forecastContainer = document.getElementById('forecast');
  forecastContainer.innerHTML = '';

  const dailyForecasts = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = item;
    }
  });

  const dates = Object.keys(dailyForecasts).slice(1, 6);
  dates.forEach(date => {
    const day = dailyForecasts[date];
    const temp = `Temp: ${day.main.temp}°C`;
    const wind = `Wind: ${day.wind.speed} M/S`;
    const humidity = `Humidity: ${day.main.humidity}%`;
    const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
    const description = day.weather[0].description;

    const card = document.createElement('div');
    card.classList.add('bg-blue-500', 'p-4', 'rounded-lg', 'shadow-lg', 'text-center', 'border', 'border-blue-300', 'text-white');
    card.innerHTML = `
      <h3 class="text-lg font-bold">${date}</h3>
      <img src="${icon}" alt="${description}" class="w-12 h-12 mx-auto my-2">
      <p>${temp}</p>
      <p>${wind}</p>
      <p>${humidity}</p>
    `;
    forecastContainer.appendChild(card);
  });
}

function addToHistory(city) {
  const history = JSON.parse(localStorage.getItem(searchHistoryKey)) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 6) {
      history.pop();
    }
    localStorage.setItem(searchHistoryKey, JSON.stringify(history));
  }
}

function toggleHistory() {
  const searchHistoryDropdown = document.getElementById('searchHistoryDropdown');
  if (searchHistoryDropdown.classList.contains('hidden')) {
    showHistory();
  } else {
    searchHistoryDropdown.classList.add('hidden');
  }
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem(searchHistoryKey)) || [];
  const searchHistoryDropdown = document.getElementById('searchHistoryDropdown');
  searchHistoryDropdown.innerHTML = '';
  history.forEach(city => {
    const item = document.createElement('li');
    item.classList.add('px-4', 'py-2', 'hover:bg-gray-100', 'cursor-pointer');
    item.innerText = city;
    item.onclick = () => {
      document.getElementById('cityInput').value = city;
      searchWeather();
      searchHistoryDropdown.classList.add('hidden');
    };
    searchHistoryDropdown.appendChild(item);
  });
  if (history.length > 0) {
    searchHistoryDropdown.classList.remove('hidden');
  }
}
