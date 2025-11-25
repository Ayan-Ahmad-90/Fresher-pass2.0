window.addEventListener("load", () => {
  // Splash elements
  const splash = document.getElementById("splash");
  const circleContainer = splash.querySelector(".circle-image-container");
  const circleText = splash.querySelector(".circle-text");
  const loadingBarFill = splash.querySelector(".loading-bar-fill");

  // Destination images data (use your images or import dynamically)
  const images = [
    { alt: "Udaipur", src: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/731645090.jpg?k=8e61095816002085898b2b028400849a3eba751db7e7f34b3915a8cf57f8c6fc&o=&hp=1" },
    { alt: "Jaipur", src: "https://www.tourism.rajasthan.gov.in/content/dam/rajasthan-tourism/english/city/explore/SRPG01.jpg" },
    { alt: "Varanasi", src: "https://servdharm.com/cdn/shop/articles/Wallpaper_900x.jpg?v=1694405183" },
    { alt: "Darjeeling", src: "https://thumbs.dreamstime.com/b/darjeeling-india-apr-ghum-railway-station-himalayan-west-bengal-part-world-heritage-site-mountain-railways-188479982.jpg" },
    { alt: "Munnar", src: "https://www.fabhotels.com/blog/wp-content/uploads/2018/07/featureImage600x400-5.jpg" },
    { alt: "Rishikesh", src: "https://media.holidify.com/images/cmsuploads/compressed/laxman-jhula-rishikesh_20241205131202.jpg" },
    { alt: "leh", src: "https://res.cloudinary.com/ddjuftfy2/image/upload/f_webp,c_fill,q_auto/memphis/xlarge/300049555_Leh-Ladakh.jpg"},
    { alt: "Amritsar", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiAS5uiPHNbQ6-JcP_f10nVuuA_cC4kz4ipg&s"},
   { alt: "Goa", src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/f0/goa.jpg?w=600&h=500&s=1"},
  {  alt: "Khajuraho", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNemzzVQ4UCMR-JvvNhQcDqnq2FYJ2oi2weA&s"},
  { alt: "Delhi", src: "https://www.competitiveness.in/wp-content/uploads/2017/09/SCR_2012_Press_Release.jpg"},
  { alt: "Ajmer", src: "https://c.ndtvimg.com/2020-10/oedsacsc_ajmer-dargah-eidemiladunnabi-pti-photo_625x300_29_October_20.jpg"}
  ];

  // Create and insert images into circle container
  images.forEach(({ alt, src }) => {
    const img = document.createElement("img");
    img.alt = alt;
    img.src = src;
    img.style.opacity = "0";
    circleContainer.insertBefore(img, circleText);
  });

  const imgElements = circleContainer.querySelectorAll("img");
  let currentIndex = 0;
  const totalImages = imgElements.length;

  // Function to show image by index
  function showImage(index) {
    imgElements.forEach((img, i) => {
      img.style.opacity = i === index ? '1' : '0';
    });
  }

  // Animate image slideshow every 4 seconds
  showImage(currentIndex);
  setInterval(() => {
    currentIndex = (currentIndex + 1) % totalImages;
    showImage(currentIndex);
  }, 4000);

  // Animate loading bar fill coordinated with slideshow duration
  loadingBarFill.style.animation = `fillLoad ${totalImages * 4}s linear infinite`;

  // After splash animation, hide splash and show main page content and navbar
  setTimeout(() => {
    splash.style.transition = "opacity 0.5s ease";
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.style.display = "none";
      const navbar = document.querySelector("nav.navbar");
      const mainContent = document.getElementById("main-content");
      if (navbar) navbar.style.display = "flex";
      if (mainContent) mainContent.style.display = "block";
    }, 500);
  }, totalImages * 4000 + 2000); // Show splash for image cycle plus 2 seconds buffer
});

// Chatbot initialization on-demand after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const chatbotIcon = document.getElementById('chatbot-icon');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSendBtn = document.getElementById('chatbot-send-btn');

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  chatbotIcon.addEventListener('click', () => {
    chatbotWindow.style.display = 'flex';
    chatbotInput.focus();
    chatbotIcon.style.display = 'none';
  });

  chatbotClose.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
    chatbotIcon.style.display = 'flex';
  });

  function processUserInput(input) {
    const cleanInput = input.toLowerCase().trim();
    let response = chatbotQA["default"];
    for (const key in chatbotQA) {
      if (cleanInput.includes(key)) {
        response = chatbotQA[key];
        break;
      }
    }
    return response;
  }

  function sendMessage() {
    const userText = chatbotInput.value.trim();
    if (!userText) return;
    appendMessage(userText, 'user');
    chatbotInput.value = '';
    const botReply = processUserInput(userText);
    setTimeout(() => appendMessage(botReply, 'bot'), 600);
  }

  chatbotSendBtn.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
});

