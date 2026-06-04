const WEATHER_API = "d042e0530507d870529b18602fc5d26b";

function getCountry() {
    const name = document.getElementById("country").value.trim();
    const result = document.getElementById("result");

    if (!name) {
        result.innerHTML = "⚠️ Enter a country name!";
        return;
    }

    result.innerHTML = "⏳ Loading...";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://restcountries.com/v3.1/name/${name}`);

    xhr.onload = function () {
        if (xhr.status !== 200) {
            result.innerHTML = "❌ Country not found!";
            return;
        }

        const data = JSON.parse(xhr.responseText)[0];

        const nativeName = Object.values(data.name.nativeName || {})[0]?.common || "N/A";
        const domain = data.tld?.[0] || "N/A";
        const calling = data.idd?.root + (data.idd?.suffixes?.[0] || "");
        const subregion = data.subregion || "N/A";
        const altNames = data.altSpellings?.join(", ") || "N/A";

        const currencyObj = Object.values(data.currencies || {})[0] || {};
        const currencyName = currencyObj.name || "N/A";
        const currencySymbol = currencyObj.symbol || "";
        const currencyCode = Object.keys(data.currencies || {})[0] || "N/A";

        const languagesArr = Object.values(data.languages || {});
        const mainLang = languagesArr[0] || "N/A";
        const otherLang = languagesArr.slice(1).join(", ") || "None";

        const lat = data.latlng[0];
        const lon = data.latlng[1];

        const weatherXHR = new XMLHttpRequest();
        weatherXHR.open("GET",
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API}&units=metric`
        );

        weatherXHR.onload = function () {
            let weatherHTML = "Tuesday, 10:00 pm Clear  27°C°F  Precipitation: 0% Humidity: 73% Wind: 10 km/h";
            console.log(weatherXHR.responseText);
            if (weatherXHR.status === 200) {
                const weather = JSON.parse(weatherXHR.responseText);
                weatherHTML = `
                    <p>${weather.weather[0].description}</p>
                    <p>🌡️ Temp: ${weather.main.temp}°C</p>
                    <p>💧 Humidity: ${weather.main.humidity}%</p>
                `;
            }

            const map = `
                <iframe width="100%" height="200"
                src="https://www.google.com/maps?q=${data.name.common}&output=embed">
                </iframe>
            `;

            result.innerHTML = `
            <div class="grid">

                <div class="card">
                    <h3>🌍 Basic Info</h3>
                    <p><b>Name:</b> ${data.name.common}</p>
                    <p><b>Native:</b> ${nativeName}</p>
                    <p><b>Capital:</b> ${data.capital?.[0]}</p>
                    <p><b>Region:</b> ${data.region}</p>
                    <p><b>Subregion:</b> ${subregion}</p>
                    <p><b>Alt Names:</b> ${altNames}</p>
                </div>

                <div class="card">
                    <h3>📞 Contact</h3>
                    <p><b>Calling Code:</b> ${calling}</p>
                    <p><b>Domain:</b> ${domain}</p>
                </div>

                <div class="card">
                    <h3>💰 Economy</h3>
                    <p><b>Currency:</b> ${currencyName}</p>
                    <p><b>Symbol:</b> ${currencySymbol}</p>
                    <p><b>Code:</b> ${currencyCode}</p>
                </div>

                <div class="card">
                    <h3>🗣️ Languages</h3>
                    <p><b>Main:</b> ${mainLang}</p>
                    <p><b>Others:</b> ${otherLang}</p>
                </div>

                <div class="card">
                    <h3>📊 Population</h3>
                    <p>${data.population.toLocaleString()}</p>
                </div>

                <div class="card">
                    <h3>🌦️ Weather</h3>
                    ${weatherHTML}
                </div>

                <div class="card">
                    <h3>🗺️ Map</h3>
                    ${map}
                </div>

            </div>

            <button onclick="addFav('${data.name.common}')">
                ❤️ Add to Favorites
            </button>
            `;
        };

        weatherXHR.send();
    };

    xhr.send();
}

/* FAVORITES */
function addFav(country) {
    let fav = JSON.parse(localStorage.getItem("fav")) || [];
    if (!fav.includes(country)) {
        fav.push(country);
        localStorage.setItem("fav", JSON.stringify(fav));
        showFav();
    }
}

function showFav() {
    const div = document.getElementById("favorites");
    let fav = JSON.parse(localStorage.getItem("fav")) || [];

    div.innerHTML = "";

    fav.forEach(c => {
        const btn = document.createElement("button");
        btn.innerText = c;

        btn.onclick = () => {
            document.getElementById("country").value = c;
            getCountry();
        };

        btn.ondblclick = () => {
            fav = fav.filter(f => f !== c);
            localStorage.setItem("fav", JSON.stringify(fav));
            showFav();
        };

        div.appendChild(btn);
    });
}

document.getElementById("country").addEventListener("keypress", function(e) {
    if (e.key === "Enter") getCountry();
});

window.onload = showFav;