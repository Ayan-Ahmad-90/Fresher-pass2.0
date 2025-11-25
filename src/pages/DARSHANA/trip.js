// Flight Booking FUNction Logic JS
const cities = [
  "New Delhi", "Mumbai", "Bangalore", "Chennai",
  "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
  "Jaipur", "Lucknow", "Goa", "Chandigarh",
  "Ranchi", "Guwahati", "Varanasi", "Surat"
];

const fromInput = document.getElementById('fromCity');
const toInput = document.getElementById('toCity');
const fromSuggest = document.getElementById('fromSuggest');
const toSuggest = document.getElementById('toSuggest');
const swapBtn = document.querySelector('.swap-btn');
const returnField = document.getElementById('returnField');
const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
const bookingForm = document.getElementById('bookingForm');
const bookingResult = document.getElementById('bookingResult');

function filterCities(inputVal) {
  return cities.filter(city => city.toLowerCase().startsWith(inputVal.toLowerCase()));
}

function showSuggestions(inputElem, suggestElem) {
  const val = inputElem.value.trim();
  if (!val) {
    suggestElem.innerHTML = "";
    suggestElem.hidden = true;
    inputElem.setAttribute('aria-expanded', 'false');
    return;
  }
  const filtered = filterCities(val);
  if (filtered.length === 0) {
    suggestElem.innerHTML = "<div class='suggestion-item'>No results found</div>";
    suggestElem.hidden = false;
    inputElem.setAttribute('aria-expanded', 'true');
    return;
  }
  suggestElem.innerHTML = filtered.map(city =>
    `<div class="suggestion-item" role="option" tabindex="0">${city}</div>`
  ).join('');
  suggestElem.hidden = false;
  inputElem.setAttribute('aria-expanded', 'true');
}

function selectSuggestion(e, inputElem, suggestElem) {
  if (e.target.classList.contains('suggestion-item')) {
    inputElem.value = e.target.textContent;
    suggestElem.innerHTML = "";
    suggestElem.hidden = true;
    inputElem.setAttribute('aria-expanded', 'false');
    inputElem.focus();
  }
}

fromInput.addEventListener('input', () => showSuggestions(fromInput, fromSuggest));
toInput.addEventListener('input', () => showSuggestions(toInput, toSuggest));

fromSuggest.addEventListener('click', e => selectSuggestion(e, fromInput, fromSuggest));
toSuggest.addEventListener('click', e => selectSuggestion(e, toInput, toSuggest));

fromInput.addEventListener('keydown', e => keyboardNav(e, fromInput, fromSuggest));
toInput.addEventListener('keydown', e => keyboardNav(e, toInput, toSuggest));

function keyboardNav(e, inputElem, suggestElem) {
  let active = suggestElem.querySelector('.suggestion-item[tabindex="0"]');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!active) {
      let first = suggestElem.querySelector('.suggestion-item');
      if (first) first.setAttribute('tabindex', '0');
    } else {
      active.removeAttribute('tabindex');
      let next = active.nextElementSibling || suggestElem.querySelector('.suggestion-item');
      next.setAttribute('tabindex', '0');
      next.focus();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (!active) {
      let last = suggestElem.querySelector('.suggestion-item:last-child');
      if (last) last.setAttribute('tabindex', '0');
    } else {
      active.removeAttribute('tabindex');
      let prev = active.previousElementSibling || suggestElem.querySelector('.suggestion-item:last-child');
      prev.setAttribute('tabindex', '0');
      prev.focus();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (active) {
      inputElem.value = active.textContent;
      suggestElem.innerHTML = "";
      suggestElem.hidden = true;
      inputElem.setAttribute('aria-expanded', 'false');
      inputElem.focus();
    }
  } else if (e.key === 'Escape') {
    suggestElem.innerHTML = "";
    suggestElem.hidden = true;
    inputElem.setAttribute('aria-expanded', 'false');
  }
}

swapBtn.addEventListener('click', () => {
  [fromInput.value, toInput.value] = [toInput.value, fromInput.value];
  fromInput.focus();
});

tripTypeRadios.forEach(radio => radio.addEventListener('change', e => {
  returnField.style.display = e.target.value === 'roundtrip' ? 'block' : 'none';
}));

bookingForm.addEventListener('submit', e => {
  e.preventDefault();

  let fromCity = fromInput.value.trim();
  let toCity = toInput.value.trim();
  let departDate = document.getElementById('departDate').value;
  let returnDate = document.getElementById('returnDate').value;
  let tripType = document.querySelector('input[name="tripType"]:checked').value;
  let travellers = Number(document.getElementById('travellers').value.match(/\d+/)[0]) || 1;
  let classType = document.getElementById('classType').value;
  let nonStop = document.getElementById('nonStop').checked;

  if(!fromCity || !toCity || !departDate){
    alert('Please fill all required fields.');
    return;
  }
  if(tripType==='roundtrip' && !returnDate){
    alert('Please select return date for round trip.');
    return;
  }
  if(fromCity.toLowerCase() === toCity.toLowerCase()){
    alert('Departure and destination cannot be the same.');
    return;
  }

  const flightNames = ['Air India 101', 'IndiGo 236', 'Vistara 589', 'SpiceJet 452', 'AirAsia 901'];
  const flightName = flightNames[Math.floor(Math.random()*flightNames.length)];

  const depHour = Math.floor(Math.random()*12)+6;
  const depMin = Math.floor(Math.random()*60);
  const arrHour = (depHour + Math.floor(Math.random()*4)+1) % 24;
  const arrMin = Math.floor(Math.random()*60);

  function formatTime(h,m){
    const suffix = h>=12 ? 'PM' : 'AM';
    const hour12 = h%12 || 12;
    return `${hour12.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')} ${suffix}`;
  }

  const departureTime = formatTime(depHour, depMin);
  const arrivalTime = formatTime(arrHour, arrMin);

  let baseFare = 3000;
  let classMultiplier = 1;
  switch(classType.toLowerCase()){
    case 'premium economy': classMultiplier=1.35; break;
    case 'business': classMultiplier=2.2; break;
  }
  let nonstopCharge = nonStop ? 500 : 0;
  let totalAmount = Math.round(travellers*(baseFare*classMultiplier + nonstopCharge));

  let formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  let amountDisplay = formatter.format(totalAmount);

  bookingResult.innerHTML = `
    <h3>Booking Summary</h3>
    <p><strong>Flight:</strong> ${flightName}</p>
    <p><strong>From:</strong> ${fromCity}</p>
    <p><strong>To:</strong> ${toCity}</p>
    <p><strong>Departure Date:</strong> ${departDate} at ${departureTime}</p>
    ${tripType==='roundtrip' ? `<p><strong>Return Date:</strong> ${returnDate}</p>` : ''}
    <p><strong>Arrival Time:</strong> ${arrivalTime}</p>
    <p><strong>Trip Type:</strong> ${tripType.charAt(0).toUpperCase()+tripType.slice(1)}</p>
    <p><strong>Travellers & Class:</strong> ${travellers} ${travellers>1 ? 'Travellers' : 'Traveller'}, ${classType}</p>
    <p><strong>Non-Stop Flight:</strong> ${nonStop ? 'Yes' : 'No'}</p>
    <p><strong>Total Flight Charge:</strong> ${amountDisplay}</p>
    <button onclick="alert('Redirecting to payment gateway...');" style="margin-top:15px; padding:12px 30px;
    background:#ba2a1a; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700;
    font-size:1rem;">Proceed to Payment</button>
  `;
});

// Flight specail offer letter 

const flightOffers = [
  {
    title: "Mumbai ✈ Delhi - 25% Off",
    details: "Book before Sep 30!",
    fine: "Limited seats only",
    code: "FLY25",
    image: "https://www.yatra.com/ythomepagecms/media/todayspick/2025/Jul/17de39dc1751e46e6b5e616b1b06fdaf.jpg",
    link: "https://www.yatra.com/flights/mumbai-delhi?offer=FLY25"
  },
  {
    title: "Bangalore ✈ Goa - Flat ₹1000 Off",
    details: "Weekend discount!",
    fine: "Valid till Oct 10",
    code: "GOA1000",
    image: "https://cdn.grabon.in/gograbon/images/web-images/uploads/1753449562595/Air-india-coupons.jpg",
    link: "https://www.airindia.in/goa-flights.htm?promo=GOA1000"
  },
  {
    title: "Chennai ✈ Kolkata - Save 15%",
    details: "Festive season deal",
    fine: "Offer ends Oct 5",
    code: "CHNKOL15",
    image: "https://www.icicibank.com/content/dam/icicibank/india/managed-assets/images/offer-zone/malaysia-airlines-banner.webp",
    link: "https://www.malaysiaairlines.com/chennai-kolkata-offer?code=CHNKOL15"
  },
  {
    title: "Hyderabad ✈ Jaipur - ₹500 Off",
    details: "Special Dussehra Offer!",
    fine: "Valid till Oct 15",
    code: "HYDJP500",
    image: "https://www.yatra.com/ythomepagecms/media/todayspick_home/2025/Jul/88407860a64b7037bcaeeb62e985b827.jpg",
    link: "https://www.yatra.com/flights/hyderabad-jaipur?promo=HYDJP500"
  },
  {
    title: "Delhi ✈ Dubai - Save 20%",
    details: "International offer",
    fine: "Book before Oct 12",
    code: "DELDBX20",
    image: "https://static.toiimg.com/thumb/msid-102796032,width-748,height-499,resizemode=4/.jpg",
    link: "https://www.emirates.com/in/english/book/flights/?offercode=DELDBX20"
  }
];

function renderOffers() {
  sliderTrack.innerHTML = flightOffers.map(
    (offer) => `
    <div class="offer-card" onclick="window.open('${offer.link}', '_blank')">
      <img src="${offer.image}" alt="${offer.title}" class="offer-img" />
      <div class="offer-details">
        <div class="offer-label">${offer.title}</div>
        <div class="offer-desc">${offer.details}</div>
        <div class="offer-fine">${offer.fine}</div>
        <div class="offer-code">${offer.code}</div>
        <a href="${offer.link}" class="offer-link" target="_blank" rel="noopener noreferrer">Book Now →</a>
      </div>
    </div>`).join('');
  // also update transform etc as before...
}