# Country Explorer

A lightweight, responsive web application to search and inspect key facts, demographics, and geographical data for 250 countries. Built with vanilla JavaScript, HTML5, and CSS3.

## Features

- **Instant Search & Autocomplete**: Real-time country suggestions as you type, matching by common name, official name, country codes (e.g., `BD`, `US`, `UK`), or capital city.
- **Keyboard Navigation**: Full arrow-key navigation (`ArrowUp` / `ArrowDown`) with `Enter` to select and `Escape` to dismiss.
- **Detailed Country Cards**: Displays national flag, official name, region, capital, population, currency (with symbols), languages, timezones, calling codes, and land area.
- **Offline Capable**: Bundled with a local dataset (`countries-data.js`) so the app works reliably without external API dependencies or API keys.
- **Responsive Layout**: Clean CSS Grid layout adapted for desktop, tablet, and mobile screens.

## Project Structure

```
countryinfo_search/
├── index.html          # Main application markup
├── style.css           # Styling, themes, and responsive grid layout
├── script.js           # Search algorithm, autocomplete, and DOM rendering
├── countries-data.js   # Bundled country dataset
├── countries.json      # Raw JSON country dataset
└── images/
    ├── logo.svg        # Application icon
    └── picture1.jpg    # Header background graphic
```

## Getting Started

No build tools, package managers, or external dependencies are required.

### Option 1: Open Directly
Double-click `index.html` to open it in any modern web browser.

### Option 2: Run with a Local Server
If you prefer running through a local development server:

```bash
# Using Python
python3 -m http.server 8000

# Or using Node (serve)
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Data Source

Country information is sourced from the [REST Countries](https://gitlab.com/restcountries/restcountries) open dataset.

## Author

**Redoan Haq**  
Student ID: 2220086  
Independent University, Bangladesh (IUB)  
Email: 2220086@iub.edu.bd
