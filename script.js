class CountrySearch {
    constructor() {
        this.searchInput = document.getElementById('country-input');
        this.searchBtn = document.getElementById('search-btn');
        this.resultsContainer = document.getElementById('results-container');
        this.suggestionsContainer = document.getElementById('suggestions-container');
        this.errorMessage = document.getElementById('error-message');
        this.loadingIndicator = document.querySelector('.loading-indicator');
        
        this.initEventListeners();
        this.setupDebounce();
    }

    initEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchCountry());
        this.searchInput.addEventListener('input', () => this.handleInput());
        this.searchInput.addEventListener('focus', () => this.showSuggestions());
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.searchCountry();
            if (e.key === 'ArrowDown') this.navigateSuggestions(1);
            if (e.key === 'ArrowUp') this.navigateSuggestions(-1);
        });
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    setupDebounce() {
        this.timeout = null;
        this.debounceDelay = 300;
    }

    handleInput() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            const query = this.searchInput.value.trim();
            if (query.length > 1) this.fetchSuggestions(query);
        }, this.debounceDelay);
    }

    async fetchSuggestions(query) {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${query}`);
            if (!response.ok) return;
            
            const countries = await response.json();
            this.showSuggestions(countries);
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }

    showSuggestions(countries) {
        this.suggestionsContainer.innerHTML = countries
            .slice(0, 8)
            .map(country => `
                <div class="suggestion-item" data-name="${country.name.common}">
                    <img src="${country.flags.svg}" 
                         alt="${country.name.common} flag" 
                         class="suggestion-flag"
                         onerror="this.style.display='none'">
                    <span class="suggestion-text">${country.name.common}</span>
                </div>
            `).join('');

        this.suggestionsContainer.style.display = 'block';
        
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.searchInput.value = e.currentTarget.dataset.name;
                this.searchCountry();
                this.suggestionsContainer.style.display = 'none';
            });
        });
    }

    navigateSuggestions(direction) {
        const suggestions = [...this.suggestionsContainer.children];
        const active = document.activeElement;
        const currentIndex = suggestions.indexOf(active);
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = suggestions.length - 1;
        if (newIndex >= suggestions.length) newIndex = 0;
        
        suggestions[newIndex]?.focus();
    }

    handleClickOutside(e) {
        if (!this.suggestionsContainer.contains(e.target) && 
            !this.searchInput.contains(e.target)) {
            this.suggestionsContainer.style.display = 'none';
        }
    }

    async searchCountry() {
        const countryName = this.searchInput.value.trim();
        if (!countryName) return;

        this.showLoading(true);
        this.clearResults();
        this.suggestionsContainer.style.display = 'none';

        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
            if (!response.ok) throw new Error('Country not found');
            
            const countries = await response.json();
            this.displayResults(countries);
            this.errorMessage.style.display = 'none';
        } catch (error) {
            this.showError();
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(countries) {
        this.resultsContainer.innerHTML = countries.map(country => `
            <div class="country-card">
                <div class="flag-container">
                    <img src="${country.flags.png}" 
                         alt="${country.name.common} flag" 
                         class="flag-image">
                </div>
                <div class="country-info">
                    <h2 class="country-title">${country.name.common}</h2>
                    <div class="info-item">
                        <i class="fas fa-landmark info-icon"></i>
                        <span><strong>Official:</strong> ${country.name.official}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-city info-icon"></i>
                        <span><strong>Capital:</strong> ${country.capital?.[0] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-globe-americas info-icon"></i>
                        <span><strong>Region:</strong> ${country.region}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users info-icon"></i>
                        <span><strong>Population:</strong> ${country.population.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-coins info-icon"></i>
                        <span><strong>Currency:</strong> ${this.getCurrency(country.currencies)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getCurrency(currencies) {
        return currencies ? Object.values(currencies)
            .map(c => `${c.name} (${c.symbol})`)
            .join(', ') : 'N/A';
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'block' : 'none';
    }

    showError() {
        this.errorMessage.style.display = 'flex';
        this.resultsContainer.innerHTML = '';
    }

    clearResults() {
        this.resultsContainer.innerHTML = '';
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => new CountrySearch());

// Add this JavaScript
const searchInput = document.getElementById('country-input');
const searchButton = document.querySelector('.search-button');
const resultsGrid = document.querySelector('.results-grid');
const errorMessage = document.querySelector('.error-message');
const loadingIndicator = document.querySelector('.loading-indicator');

async function fetchCountryData(countryName) {
    try {
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
        if (!response.ok) throw new Error('Country not found');
        
        const data = await response.json();
        resultsGrid.innerHTML = ''; // Clear previous results
        
        data.forEach(country => {
            // Extract required information
            const currencies = country.currencies ? 
                Object.values(country.currencies).map(c => c.name) : [];
            const languages = country.languages ? 
                Object.values(country.languages) : [];
            const timezones = country.timezones || [];
            const idd = country.idd || {};

            const card = document.createElement('div');
            card.className = 'country-card';
            card.innerHTML = `
                <div class="flag-container">
                    <img src="${country.flags.png}" alt="${country.name.common} flag" class="flag-image">
                </div>
                <div class="country-info">
                    <h2 class="country-title">${country.name.common}</h2>
                    <div class="info-item">
                        <span class="info-icon">🌐</span>
                        Official Name: ${country.name.official}
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🌍</span>
                        Region: ${country.region || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🏛️</span>
                        Capital: ${country.capital?.[0] || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-icon">👥</span>
                        Population: ${country.population ? country.population.toLocaleString() : 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-icon">💵</span>
                        Currency: ${currencies.join(', ') || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🗣️</span>
                        Languages: ${languages.join(', ') || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-icon">⏰</span>
                        Time Zone: ${timezones.join(', ') || 'N/A'}
                    </div>
                    <div class="info-item">
                        <span class="info-icon">📞</span>
                        Calling Code: ${idd.root || ''}${idd.suffixes?.[0] || 'N/A'}
                    </div>
                </div>
            `;
            resultsGrid.appendChild(card);
        });
        
        window.scrollTo({ top: resultsGrid.offsetTop - 100, behavior: 'smooth' });
    } catch (error) {
        errorMessage.style.display = 'flex';
        errorMessage.innerHTML = `⚠️ Error: ${error.message}`;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Event Listeners
searchButton.addEventListener('click', () => {
    if (searchInput.value.trim()) {
        fetchCountryData(searchInput.value.trim());
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        fetchCountryData(searchInput.value.trim());
    }
});