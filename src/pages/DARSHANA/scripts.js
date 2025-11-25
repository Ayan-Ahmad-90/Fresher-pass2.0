const destinationData = {
  udaipur: {
    description: "Udaipur, the City of Lakes in Rajasthan, offers beautiful palaces and serene lakes.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/731645090.jpg?k=8e61095816002085898b2b028400849a3eba751db7e7f34b3915a8cf57f8c6fc&o=&hp=1"
  },
  jaipur: {
    description: "Jaipur, the Pink City, is famous for its forts, art, culture, and cuisine.",
    image: "https://www.tourism.rajasthan.gov.in/content/dam/rajasthan-tourism/english/city/explore/SRPG01.jpg"
  },
  varanasi: {
    description: "Varanasi is an ancient spiritual city situated on the banks of the sacred Ganges river.",
    image: "https://servdharm.com/cdn/shop/articles/Wallpaper_900x.jpg?v=1694405183"
  },
  darjeeling: {
    description: "Darjeeling is a scenic hill station known for its tea gardens and panoramic Himalayan views.",
    image: "https://thumbs.dreamstime.com/b/darjeeling-india-apr-ghum-railway-station-himalayan-west-bengal-part-world-heritage-site-mountain-railways-188479982.jpg"
  },
  munnar: {
    description: "Munnar in Kerala is famous for lush green tea plantations and tranquil hill landscapes.",
    image: "https://www.fabhotels.com/blog/wp-content/uploads/2018/07/featureImage600x400-5.jpg"
  },
  rishikesh: {
    description: "Rishikesh is a spiritual hub on the Ganges, popular for yoga and river rafting.",
    image: "https://media.holidify.com/images/cmsuploads/compressed/laxman-jhula-rishikesh_20241205131202.jpg"
  },
  leh: {
    description: "Leh is a high-altitude desert town with stunning mountain views and Buddhist monasteries.",
    image: "https://res.cloudinary.com/ddjuftfy2/image/upload/f_webp,c_fill,q_auto/memphis/xlarge/300049555_Leh-Ladakh.jpg"
  },
  amritsar: {
    description: "Amritsar hosts the Golden Temple, a prime Sikh pilgrimage and architectural marvel.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiAS5uiPHNbQ6-JcP_f10nVuuA_cC4kz4ipg&s"
  },
  goa: {
    description: "Goa offers beautiful beaches, vibrant nightlife, and Portuguese heritage charm.",
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/f0/goa.jpg?w=600&h=500&s=1"
  },
  khajuraho: {
    description: "Khajuraho is world-famous for its intricately carved ancient temples and sculptures.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNemzzVQ4UCMR-JvvNhQcDqnq2FYJ2oi2weA&s"
  },
  delhi: {
    description: "Delhi, the capital city of India, is rich in history, culture, and iconic landmarks like India Gate, Red Fort, and Qutub Minar.",
    image: "https://www.competitiveness.in/wp-content/uploads/2017/09/SCR_2012_Press_Release.jpg"
  },
  ajmer: {
    description: "Ajmer is a historic city surrounded by the Aravalli Hills, famous for the Ajmer Sharif Dargah, Adhai Din Ka Jhonpra mosque, Ana Sagar Lake, and Taragarh Fort.",
    image: "https://c.ndtvimg.com/2020-10/oedsacsc_ajmer-dargah-eidemiladunnabi-pti-photo_625x300_29_October_20.jpg"
  }
};

function showDetails(destination) {
  const detailsDiv = document.getElementById('destinationDetails');
  const key = destination.toLowerCase();
  if (destinationData[key]) {
    const { description, image } = destinationData[key];
    detailsDiv.innerHTML = `
      <img src="${image}" alt="${key}" />
      <p>${description}</p>
    `;
  } else {
    detailsDiv.innerHTML = `<p>Details not available.</p>`;
  }
}

// ------------------- ROUTES -------------------

const routes = {
  "red fort-india gate": {
    distance: "8.5 km",
    options: [
      { icon: "🚶‍♂️", type: "Walking", time: "1h 35m", co2: "0 kg", pts: "+50pts" },
      { icon: "🚲", type: "Cycling", time: "35m", co2: "0 kg", pts: "+75pts" },
      { icon: "🚇", type: "Metro", time: "25m", co2: "1.8 kg", pts: "+25pts" },
      { icon: "🚗", type: "Electric", time: "20m", co2: "0.8 kg", pts: "+40pts" }
    ]
  },
  "gateway of india-marine drive": {
    distance: "3.2 km",
    options: [
      { icon: "🚶‍♂️", type: "Walking", time: "40m", co2: "0 kg", pts: "+50pts" },
      { icon: "🚲", type: "Cycling", time: "15m", co2: "0 kg", pts: "+75pts" },
      { icon: "🚌", type: "Bus", time: "12m", co2: "1.2 kg", pts: "+25pts" },
      { icon: "🚗", type: "Electric", time: "10m", co2: "0.5 kg", pts: "+40pts" }
    ]
  },
  "jaipur-ajmer": {
    distance: "130 km",
    options: [
      { icon: "🚗", type: "Car", time: "2h 30m", co2: "10 kg", pts: "+30pts" },
      { icon: "🚌", type: "Bus", time: "3h 10m", co2: "12 kg", pts: "+20pts" }
    ]
  },
  // ... keep all other routes (no duplicates) ...
  "marine drive-haji ali dargah": {
    distance: "6 km",
    options: [
      { icon: "🚗", type: "Taxi", time: "20m", co2: "2.0 kg", pts: "+30pts" },
      { icon: "🚲", type: "Cycling", time: "30m", co2: "0 kg", pts: "+60pts" }
    ]
  },
  "marine drive-chowpatty": {
    distance: "2 km",
    options: [
      { icon: "🚶‍♂️", type: "Walking", time: "25m", co2: "0 kg", pts: "+40pts" },
      { icon: "🚗", type: "Taxi", time: "10m", co2: "1.0 kg", pts: "+20pts" }
    ]
  }
};

function showRoute() {
  const from = document.getElementById('fromSelect').value.trim().toLowerCase();
  const to = document.getElementById('toSelect').value.trim().toLowerCase();
  const container = document.getElementById('routeContainer');

  if (!from || !to) {
    container.innerHTML = "<p style='text-align:center; color:#cc0000; font-weight:600;'>Please select both 'From' and 'To' destinations.</p>";
    return;
  }
  if (from === to) {
    container.innerHTML = "<p style='text-align:center; color:#cc0000; font-weight:600;'>Please select different destinations for 'From' and 'To'.</p>";
    return;
  }

  const routeKey = from + "-" + to;
  const route = routes[routeKey];

  if (!route) {
    container.innerHTML = "<p style='text-align:center; color:#cc0000; font-weight:600;'>No route data available for the selected destinations.</p>";
    return;
  }

  let optionsHtml = "";
  route.options.forEach(opt => {
    optionsHtml += `<div class="option"><span>${opt.icon}</span><br>${opt.type}<br>${opt.time}<br>${opt.co2}<br>${opt.pts}</div>`;
  });

  container.innerHTML = `
    <div class="route-card">
      <div class="route-header">
        <span class="location">${capitalizeWords(from)}</span>
        <span class="arrow">→</span>
        <span class="location">${capitalizeWords(to)}</span>
        <span class="distance">${route.distance}</span>
      </div>
      <div class="route-options">${optionsHtml}</div>
    </div>
  `;
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function swapLocations() {
  const fromSelect = document.getElementById("fromSelect");
  const toSelect = document.getElementById("toSelect");
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  showRoute();
}

// // ------------------- CHATBOT -------------------

// const knowledgeBase = {
//   "what is the traffic like to red fort?": "Traffic to Red Fort is moderate now. Expect some delays near Chandni Chowk on weekends.",
//   "translate this menu for me": "Please upload or send a photo of the menu, and I will translate it into your preferred language.",
//   "find nearest hospital": "The nearest hospital has a 24/7 emergency. It's Safdarjung Hospital, about 3 km from your current location.",
//   "download offline maps": "You can download offline maps for all major Indian cities through this app's offline access feature under Sustainable Travel.",
//   "create backup plan": "Backup plans include alternative routes, transport modes, and contact info to ensure safe travel disruptions management.",
//   "show ar information": "Point your camera at landmarks or signs to view augmented reality info overlays and historical context."
// };

// const chatForm = document.getElementById('chatForm');
// const chatInput = document.getElementById('chatInput');
// const chatHistory = document.getElementById('chatHistory');
// const voiceBtn = document.getElementById('voiceBtn');

// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// const recognition = SpeechRecognition ? new SpeechRecognition() : null;
// const synth = window.speechSynthesis;

// function speak(text) {
//   if (!synth) return;
//   const utter = new SpeechSynthesisUtterance(text);
//   utter.lang = 'en-IN';
//   synth.speak(utter);
// }

// function appendMessage(text, sender) {
//   const msg = document.createElement('div');
//   msg.className = 'chat-message ' + (sender === 'user' ? 'user-msg' : 'bot-msg');
//   msg.textContent = text;
//   chatHistory.appendChild(msg);
//   chatHistory.scrollTop = chatHistory.scrollHeight;
//   if (sender === 'bot') {
//     speak(text);
//   }
// }

// function processQuestion(question) {
//   const normalized = question.trim().toLowerCase();

//   if (["hello", "hi", "hey", "good morning", "good afternoon", "good evening"].includes(normalized)) {
//     return "Hello! How can I assist you today with your travel plans?";
//   }

//   if (normalized === "who are you" || normalized === "who are you?") {
//     return "I am DarShana's AI Travel Assistant, here to help you explore destinations, plan safe and sustainable journeys, and answer your travel queries.";
//   }

//   if (knowledgeBase[normalized]) {
//     return knowledgeBase[normalized];
//   }

//   if (normalized.includes('emergency')) {
//     return "In case of emergency, dial 108 immediately or use the emergency buttons provided.";
//   }

//   if (normalized.includes('weather')) {
//     return "You can check real-time weather updates for your destination via the AI assistant.";
//   }

//   return "Sorry, I don't have the answer to that right now. Please try asking about travel, safety, or festivals.";
// }

// chatForm.addEventListener('submit', e => {
//   e.preventDefault();
//   const userMsg = chatInput.value;
//   if (!userMsg) return;
//   appendMessage(userMsg, 'user');
//   chatInput.value = '';
//   setTimeout(() => {
//     const botReply = processQuestion(userMsg);
//     appendMessage(botReply, 'bot');
//   }, 600);
// });

// if (recognition) {
//   recognition.lang = 'en-IN';
//   recognition.interimResults = false;
//   recognition.maxAlternatives = 1;

//   voiceBtn.addEventListener('click', () => {
//     recognition.start();
//     voiceBtn.textContent = '🎙️...';
//     voiceBtn.disabled = true;
//   });

//   recognition.onresult = event => {
//     const speechResult = event.results[0][0].transcript;
//     chatInput.value = speechResult;
//     voiceBtn.textContent = '🎤';
//     voiceBtn.disabled = false;
//     chatInput.focus();
//   };

//   recognition.onerror = () => {
//     voiceBtn.textContent = '🎤';
//     voiceBtn.disabled = false;
//   };

//   recognition.onend = () => {
//     voiceBtn.textContent = '🎤';
//     voiceBtn.disabled = false;
//   };
// } else {
//   voiceBtn.style.display = 'none';
// }

// ------------------- SETTINGS -------------------

document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');

  // Open menu with focus trap
  function openMenu() {
    settingsMenu.classList.remove('hidden');
    settingsMenu.setAttribute('aria-expanded', 'true');
    settingsMenu.focus();
    trapFocus(settingsMenu);
  }

  // Close menu and release focus trap
  function closeMenu() {
    settingsMenu.classList.add('hidden');
    settingsMenu.setAttribute('aria-expanded', 'false');
    releaseFocusTrap();
  }

  function toggleMenu() {
    if (settingsMenu.classList.contains('hidden')) openMenu();
    else closeMenu();
  }

  settingsBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (!settingsMenu.classList.contains('hidden') &&
        !settingsMenu.contains(e.target) && e.target !== settingsBtn) {
      closeMenu();
    }
  });

  // Close menu on Escape key and return focus to button
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !settingsMenu.classList.contains('hidden')) {
      closeMenu();
      settingsBtn.focus();
    }
  });

  // Focus trap implementation
  let focusableElements = [];
  let firstFocusable, lastFocusable;

  function trapFocus(element) {
    focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length) {
      firstFocusable = focusableElements[0];
      lastFocusable = focusableElements[focusableElements.length - 1];
      element.addEventListener('keydown', handleFocusTrap);
    }
  }

  function releaseFocusTrap() {
    settingsMenu.removeEventListener('keydown', handleFocusTrap);
  }

  function handleFocusTrap(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
});


