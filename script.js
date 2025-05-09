// script.js
function searchCountry() {
    const countryName = document.getElementById('countryInput').value.trim();
    const resultsContainer = document.getElementById('results-container');
    const errorMessage = document.querySelector('.error-message');
    const loadingIndicator = document.querySelector('.loading-indicator');

    if (!countryName) return;

    // Show loading indicator
    loadingIndicator.style.display = 'block';
    resultsContainer.innerHTML = '';
    errorMessage.style.display = 'none';

    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(response => {
            if (!response.ok) throw new Error('Country not found');
            return response.json();
        })
        .then(data => {
            const country = data[0];
            resultsContainer.innerHTML = `
                <div class="card country-card">
                    <img src="${country.flags.png}" class="card-img-top country-flag" alt="${country.name.common} Flag">
                    <div class="card-body">
                        <h2 class="card-title">${country.name.common}</h2>
                        <div class="row mt-4">
                            <div class="col-6">
                                <p><strong>Official Name:</strong> ${country.name.official}</p>
                                <p><strong>Capital:</strong> ${country.capital}</p>
                                <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                                <p><strong>Region:</strong> ${country.region}</p>
                            </div>
                            <div class="col-6">
                                <p><strong>Languages:</strong> ${Object.values(country.languages).join(', ')}</p>
                                <p><strong>Currency:</strong> ${Object.values(country.currencies).map(c => `${c.name} (${c.symbol})`).join(', ')}</p>
                                <p><strong>Time Zones:</strong> ${country.timezones.join(', ')}</p>
                                <p><strong>Start of Week:</strong> ${country.startOfWeek}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            errorMessage.style.display = 'block';
            resultsContainer.innerHTML = '';
        })
        .finally(() => {
            loadingIndicator.style.display = 'none';
        });
}

// Add event listener for Enter key
document.getElementById('countryInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchCountry();
});