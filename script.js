class CountrySearch {
    constructor() {
        this.searchInput = document.getElementById('country-input');
        this.searchBtn = document.getElementById('search-btn');
        this.resultsContainer = document.getElementById('results-container');
        this.suggestionsContainer = document.getElementById('suggestions-container');
        this.errorMessage = document.getElementById('error-message');
        this.loadingIndicator = document.querySelector('.loading-indicator');
        
        this.countries = [];
        this.timeout = null;
        this.debounceDelay = 200;
        this.activeSuggestionIndex = -1;

        this.init();
    }

    async init() {
        this.initEventListeners();
        await this.loadCountries();
    }

    initEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchCountry());
        this.searchInput.addEventListener('input', () => this.handleInput());
        this.searchInput.addEventListener('focus', () => {
            const query = this.searchInput.value.trim();
            if (query.length > 0) this.fetchSuggestions(query);
        });
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.activeSuggestionIndex >= 0) {
                    this.selectSuggestion(this.activeSuggestionIndex);
                } else {
                    this.searchCountry();
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSuggestions(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSuggestions(-1);
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });

        this.suggestionsContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.suggestion-item');
            if (!item) return;
            this.searchInput.value = item.dataset.name;
            this.hideSuggestions();
            this.searchCountry();
        });

        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    async loadCountries() {
        if (typeof window !== 'undefined' && Array.isArray(window.COUNTRIES_DATA) && window.COUNTRIES_DATA.length > 0) {
            this.countries = window.COUNTRIES_DATA;
            return;
        }

        this.showLoading(true);
        try {
            const response = await fetch('countries.json');
            if (response.ok) {
                this.countries = await response.json();
                return;
            }
        } catch (_) {
            // Local fetch failed (e.g. file:// protocol restriction), try remote fallback
        }

        try {
            const remoteRes = await fetch('https://raw.githubusercontent.com/restcountries/restcountries/master/src/main/resources/countriesV3.1.json');
            if (remoteRes.ok) {
                this.countries = await remoteRes.json();
            }
        } catch (error) {
            console.error('Failed to load countries data:', error);
        } finally {
            this.showLoading(false);
        }
    }

    handleInput() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            const query = this.searchInput.value.trim();
            if (query.length > 0) {
                this.fetchSuggestions(query);
            } else {
                this.hideSuggestions();
            }
        }, this.debounceDelay);
    }

    fetchSuggestions(query) {
        if (!this.countries.length) return;
        const matches = this.filterCountries(query).slice(0, 8);
        this.showSuggestions(matches);
    }

    filterCountries(query) {
        if (!query) return [];
        const q = query.toLowerCase().trim();
        if (!q) return [];

        const scoredResults = [];

        for (const country of this.countries) {
            const common = (country.name?.common || '').toLowerCase();
            const official = (country.name?.official || '').toLowerCase();
            const cca2 = (country.cca2 || '').toLowerCase();
            const cca3 = (country.cca3 || '').toLowerCase();
            const capitals = (country.capital || []).map(c => String(c).toLowerCase());
            const altSpellings = (country.altSpellings || []).map(s => String(s).toLowerCase());
            const commonWords = common.split(/\s+/);

            let score = -1;

            if (common === q || official === q || cca2 === q || cca3 === q || altSpellings.includes(q)) {
                score = 0; // Exact match on name, code, or alt spelling
            } else if (common.startsWith(q)) {
                score = 1; // Common name starts with query
            } else if (commonWords.some(w => w.startsWith(q))) {
                score = 2; // Word in common name starts with query
            } else if (common.includes(q)) {
                score = 3; // Common name contains query
            } else if (official.startsWith(q) || official.split(/\s+/).some(w => w.startsWith(q))) {
                score = 4; // Official name starts with query
            } else if (official.includes(q)) {
                score = 5; // Official name contains query
            } else if (capitals.some(cap => cap === q || cap.startsWith(q))) {
                score = 6; // Capital matches or starts with query
            } else if (capitals.some(cap => cap.includes(q))) {
                score = 7; // Capital contains query
            } else if (altSpellings.some(alt => alt.includes(q))) {
                score = 8; // Alt spelling contains query
            }

            if (score !== -1) {
                scoredResults.push({ score, commonLen: common.length, common, country });
            }
        }

        scoredResults.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            if (a.commonLen !== b.commonLen) return a.commonLen - b.commonLen;
            return a.common.localeCompare(b.common);
        });

        return scoredResults.map(item => item.country);
    }

    showSuggestions(countries) {
        if (!countries || countries.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.activeSuggestionIndex = -1;
        this.suggestionsContainer.innerHTML = countries.map((country, index) => {
            const flag = country.flags?.svg || country.flags?.png || '';
            const name = this.escapeHtml(country.name?.common || '');
            return `
                <div class="suggestion-item" data-index="${index}" data-name="${name}">
                    <img src="${flag}" 
                         alt="${name} flag" 
                         class="suggestion-flag"
                         onerror="this.style.display='none'">
                    <span class="suggestion-text">${name}</span>
                </div>
            `;
        }).join('');

        this.suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
        this.suggestionsContainer.innerHTML = '';
        this.activeSuggestionIndex = -1;
    }

    navigateSuggestions(direction) {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        if (!items.length) return;

        if (this.activeSuggestionIndex >= 0 && items[this.activeSuggestionIndex]) {
            items[this.activeSuggestionIndex].classList.remove('active');
        }

        this.activeSuggestionIndex += direction;
        if (this.activeSuggestionIndex < 0) this.activeSuggestionIndex = items.length - 1;
        if (this.activeSuggestionIndex >= items.length) this.activeSuggestionIndex = 0;

        const current = items[this.activeSuggestionIndex];
        if (current) {
            current.classList.add('active');
            current.scrollIntoView({ block: 'nearest' });
        }
    }

    selectSuggestion(index) {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        const item = items[index];
        if (item) {
            this.searchInput.value = item.dataset.name;
            this.hideSuggestions();
            this.searchCountry();
        }
    }

    handleClickOutside(e) {
        if (!this.suggestionsContainer.contains(e.target) && 
            !this.searchInput.contains(e.target)) {
            this.hideSuggestions();
        }
    }

    async searchCountry() {
        const countryName = this.searchInput.value.trim();
        if (!countryName) return;

        this.hideSuggestions();
        this.showLoading(true);
        this.clearResults();
        this.errorMessage.style.display = 'none';

        if (!this.countries.length) {
            await this.loadCountries();
        }

        const matches = this.filterCountries(countryName);

        this.showLoading(false);

        if (matches && matches.length > 0) {
            this.displayResults(matches);
            this.errorMessage.style.display = 'none';
        } else {
            this.showError();
        }
    }

    displayResults(countries) {
        this.resultsContainer.innerHTML = countries.map(country => {
            const commonName = this.escapeHtml(country.name?.common || 'N/A');
            const officialName = this.escapeHtml(country.name?.official || commonName);
            const flagUrl = country.flags?.png || country.flags?.svg || '';

            const currencies = country.currencies ? 
                Object.values(country.currencies)
                    .map(c => c.symbol ? `${c.name} (${c.symbol})` : c.name)
                    .filter(Boolean) : [];

            const languages = country.languages ? 
                Object.values(country.languages) : [];

            const timezones = country.timezones || [];
            const idd = country.idd || {};
            const callingCode = idd.root ? 
                (idd.suffixes && idd.suffixes.length === 1 ? `${idd.root}${idd.suffixes[0]}` : idd.root) : 'N/A';

            const capitals = country.capital && country.capital.length ? country.capital.join(', ') : 'N/A';
            const population = country.population != null ? Number(country.population).toLocaleString() : 'N/A';
            const area = country.area != null ? Number(country.area).toLocaleString() + ' km²' : 'N/A';
            const region = country.region || 'N/A';

            return `
                <div class="country-card">
                    <div class="flag-container">
                        <img src="${flagUrl}" 
                             alt="${commonName} flag" 
                             class="flag-image"
                             loading="lazy"
                             onerror="this.style.display='none'">
                    </div>
                    <div class="country-info">
                        <h2 class="country-title">${commonName}</h2>
                        <div class="info-item">
                            <span class="info-icon">🌐</span>
                            Official Name: ${officialName}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🌍</span>
                            Region: ${region}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🏛️</span>
                            Capital: ${this.escapeHtml(capitals)}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">👥</span>
                            Population: ${population}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">💵</span>
                            Currency: ${this.escapeHtml(currencies.join(', ') || 'N/A')}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🗣️</span>
                            Languages: ${this.escapeHtml(languages.join(', ') || 'N/A')}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">⏰</span>
                            Time Zone: ${this.escapeHtml(timezones.join(', ') || 'N/A')}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📞</span>
                            Calling Code: ${this.escapeHtml(callingCode)}
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            Area: ${area}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'block' : 'none';
        }
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
