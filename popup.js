// Popup script for extension toggle
const TOGGLE_KEY = 'extension_enabled';
const FLAG_TOGGLE_KEY = 'show_flags';
const BLOCKED_COUNTRIES_KEY = 'blocked_countries';
const DEFAULT_ENABLED = true;
const DEFAULT_SHOW_FLAGS = true;

// Get elements
const toggleSwitch = document.getElementById('toggleSwitch');
const flagToggleSwitch = document.getElementById('flagToggleSwitch');
const status = document.getElementById('status');
const countriesList = document.getElementById('countriesList');
const countrySearch = document.getElementById('countrySearch');
const tabs = document.querySelectorAll('.tab');

// State
let blockedCountries = new Set();
let activeTab = 'all'; // 'all' or 'blocked'
let currentFilter = '';

// Load current state
chrome.storage.local.get([TOGGLE_KEY, FLAG_TOGGLE_KEY, BLOCKED_COUNTRIES_KEY], (result) => {
  const isEnabled = result[TOGGLE_KEY] !== undefined ? result[TOGGLE_KEY] : DEFAULT_ENABLED;
  const showFlags = result[FLAG_TOGGLE_KEY] !== undefined ? result[FLAG_TOGGLE_KEY] : DEFAULT_SHOW_FLAGS;

  updateToggle(toggleSwitch, isEnabled, 'Extension');
  updateToggle(flagToggleSwitch, showFlags, 'Flags');

  if (result[BLOCKED_COUNTRIES_KEY]) {
    blockedCountries = new Set(result[BLOCKED_COUNTRIES_KEY]);
  }

  renderCountriesList();
});

// Extension Toggle click handler
toggleSwitch.addEventListener('click', () => {
  chrome.storage.local.get([TOGGLE_KEY], (result) => {
    const currentState = result[TOGGLE_KEY] !== undefined ? result[TOGGLE_KEY] : DEFAULT_ENABLED;
    const newState = !currentState;

    chrome.storage.local.set({ [TOGGLE_KEY]: newState }, () => {
      updateToggle(toggleSwitch, newState, 'Extension');
      notifyContentScript({ type: 'extensionToggle', enabled: newState });
    });
  });
});

// Flag Toggle click handler
flagToggleSwitch.addEventListener('click', () => {
  chrome.storage.local.get([FLAG_TOGGLE_KEY], (result) => {
    const currentState = result[FLAG_TOGGLE_KEY] !== undefined ? result[FLAG_TOGGLE_KEY] : DEFAULT_SHOW_FLAGS;
    const newState = !currentState;

    chrome.storage.local.set({ [FLAG_TOGGLE_KEY]: newState }, () => {
      updateToggle(flagToggleSwitch, newState, 'Flags');
      notifyContentScript({ type: 'flagToggle', showFlags: newState });
    });
  });
});

// Tab click handlers
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab UI
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update state
    activeTab = tab.dataset.tab;
    renderCountriesList(currentFilter);
  });
});

// Search handler
countrySearch.addEventListener('input', (e) => {
  currentFilter = e.target.value;
  renderCountriesList(currentFilter);
});

function updateToggle(element, isEnabled, label) {
  if (isEnabled) {
    element.classList.add('enabled');
    if (label === 'Extension') {
      status.textContent = 'Extension is enabled';
      status.style.color = '#1d9bf0';
    }
  } else {
    element.classList.remove('enabled');
    if (label === 'Extension') {
      status.textContent = 'Extension is disabled';
      status.style.color = '#536471';
    }
  }
}

function renderCountriesList(filter = '') {
  countriesList.innerHTML = '';
  const filterLower = filter.toLowerCase();

  // Get countries based on tab
  let countriesToShow = Object.keys(COUNTRY_FLAGS);

  if (activeTab === 'blocked') {
    countriesToShow = countriesToShow.filter(country => blockedCountries.has(country));
  }

  // Sort countries by name
  countriesToShow.sort();

  if (countriesToShow.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.padding = '16px';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = '#536471';
    emptyMsg.textContent = activeTab === 'blocked' ? 'No blocked countries' : 'No countries found';
    countriesList.appendChild(emptyMsg);
    return;
  }

  for (const country of countriesToShow) {
    if (filter && !country.toLowerCase().includes(filterLower)) {
      continue;
    }

    const flag = COUNTRY_FLAGS[country];
    const isBlocked = blockedCountries.has(country);

    const item = document.createElement('div');
    item.className = 'country-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isBlocked;
    checkbox.addEventListener('change', () => toggleCountryBlock(country, checkbox.checked));

    const flagSpan = document.createElement('span');
    flagSpan.className = 'country-flag';
    flagSpan.textContent = flag;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'country-name';
    nameSpan.textContent = country;

    item.appendChild(checkbox);
    item.appendChild(flagSpan);
    item.appendChild(nameSpan);

    // Allow clicking the row to toggle
    item.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        toggleCountryBlock(country, checkbox.checked);
      }
    });

    countriesList.appendChild(item);
  }
}

function toggleCountryBlock(country, isBlocked) {
  if (isBlocked) {
    blockedCountries.add(country);
  } else {
    blockedCountries.delete(country);
  }

  const blockedArray = Array.from(blockedCountries);

  chrome.storage.local.set({ [BLOCKED_COUNTRIES_KEY]: blockedArray }, () => {
    notifyContentScript({
      type: 'blockedCountriesUpdate',
      countries: blockedArray
    });
  });
}

function notifyContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {
        // Tab might not have content script loaded yet
      });
    }
  });
}

