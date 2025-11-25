    // Face API models and elements
    const moodEmojis = {
      happy:    "😄",
      sad:      "😢",
      Energetic: "😃",
      surprised: "😮",
      fearful:  "😱",
      Reflective: "🤔",
      neutral:  "😐"
    };

    const startBtn = document.getElementById('startBtn');
    const video = document.getElementById('video');
    const result = document.getElementById('result');
    const moodLabel = document.getElementById('mood-label');
    const emoji = result.querySelector(".emoji");
    const webcamStatus = document.getElementById('webcamStatus');
    const progress = document.getElementById('progress');
    let scanActive = false;
    let detectionInterval;
    let streamRef;

    // Multi-step mood analyzer vars
    const stepsDiv = document.getElementById('steps');
    const stepIndicator = document.getElementById('step-indicator').children;

    let step = 0;
    let moodSelected = null;
    let energyLevel = 5;
    let socialLevel = 5;
    let adventureLevel = 5;

    const moods = [
  {emoji:"😊", label:"Happy & Excited"},
  {emoji: "😐", label: "Calm & Peaceful"},
  {emoji: "😮", label: "Curious & Explorative"},
  {emoji: "😢", label: "sad"},
  {emoji: "😃", label: "Energetic & Active"},
  {emoji: "🤔", label: "Reflective & Mindful"},
  {emoji: "😁", label: "Celebratory & Social"}
];

    // Map face-api moods to your mood indices to sync
    // faceapi expressions: happy, sad, angry, surprised, fearful, disgusted, neutral
    // Your moods: 0=Happy,1=Calm,2=Curious,3=Energetic,4=Reflective,5=Social/Celebratory
    // Approximate mapping:
    const faceToMoodIndex = {
      happy:    0,
      sad:      1,
      Energetic: 2,
      surprised: 2,
      fearful:  4,
      Reflective: 3,
      neutral:  1
    };

    // UTILS: Show webcam message and reset UI
    function setWebcamStatus(msg) {
      webcamStatus.textContent = msg || "";
    }

    // PROGRESS display
    function setProgress(msg) {
      progress.innerHTML = msg || "";
    }

    // Show mood on face scanner box
    function showMood(mood, confidence) {
      const topMood = moodEmojis[mood] ? mood : "neutral";
      result.classList.add("show");
      emoji.textContent = moodEmojis[topMood] || "😐";
      if (confidence !== undefined) {
        moodLabel.innerHTML = `Mood: ${topMood.charAt(0).toUpperCase() + topMood.slice(1)} <span style="color:#8f37fb;font-size:0.75em;">(${Math.round(confidence * 100)}%)</span>`;
      } else {
        moodLabel.textContent = "Mood: " + (topMood.charAt(0).toUpperCase() + topMood.slice(1));
      }
      // Try linking detected mood to mood selector if on mood selection step and not manually overridden
      if(step === 0 && !manualMoodOverride) {
        const mappedIdx = faceToMoodIndex[topMood];
        if(mappedIdx !== null && mappedIdx !== undefined) {
          if(moodSelected !== mappedIdx) {
            moodSelected = mappedIdx;
            renderStep();
          }
        }
      }
    }

    // Mood not detected
    function noMood() {
      result.classList.add("show");
      emoji.textContent = "😐";
      moodLabel.textContent = "Mood: Not detected";
    }

    // Load face-api models with progress
    async function loadModels() {
      setProgress("<span>Loading AI Models...</span>");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/')
      ]);
      setProgress("<span style='color:#00bd7e;'>AI Ready!</span>");
    }

    // Start webcam for face scan
    async function startWebcam() {
      try {
        streamRef = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = streamRef;
        video.play();
        setWebcamStatus('<span class="live-dot"></span>Webcam Active');
        video.classList.remove("paused");
        return true;
      } catch (err) {
        setWebcamStatus("Camera access denied or not found.");
        setProgress("");
        video.classList.add("paused");
        return false;
      }
    }

    // Start face mood scanning loop
    async function startScan() {
      startBtn.disabled = true;
      startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Starting...';
      setWebcamStatus('Starting camera...');
      setProgress('');
      scanActive = true;

      const camOk = await startWebcam();
      if (!camOk) {
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Face Scan';
        return;
      }
      setWebcamStatus('<span class="live-dot"></span>Webcam Active');
      setProgress('');

      // Run detection loop
      video.onplaying = () => {
        if (detectionInterval) clearInterval(detectionInterval);
        detectionInterval = setInterval(async () => {
          if (!scanActive) return;
          try {
            const det = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();
            if (det && det.expressions) {
              const sorted = Object.entries(det.expressions).sort((a, b) => b[1] - a[1]);
              let [top, confidence] = sorted[0];
              showMood(top, confidence);
            } else {
              noMood();
            }
          } catch (e) {
            noMood();
          }
        }, 450);
      };
    }

    // Stop face scan and clean up
    function cleanup() {
      scanActive = false;
      clearInterval(detectionInterval);
      if (streamRef && streamRef.getTracks) {
        streamRef.getTracks().forEach(t => t.stop());
        video.srcObject = null;
      }
      setWebcamStatus('');
      noMood();
    }

    // Button to toggle scan start/stop
    let manualMoodOverride = false; // track if user manually selected mood to prevent overwriting by face scan

    startBtn.onclick = async () => {
      if (!scanActive) {
        manualMoodOverride = false;
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading Models...';
        result.classList.remove("show");
        await loadModels();
        setProgress('');
        startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Starting Camera...';
        await startScan();
        startBtn.style.opacity = "0.65";
        startBtn.innerHTML = '<i class="fa-solid fa-circle-stop"></i> Stop Scan';
        startBtn.disabled = false;
        startBtn.setAttribute('aria-pressed', 'true');
      } else {
        cleanup();
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Face Scan';
        startBtn.style.opacity = "0.95";
        webcamStatus.textContent = '';
        progress.textContent = '';
        result.classList.remove("show");
        startBtn.setAttribute('aria-pressed', 'false');
      }
    };

    // Multi-step mood analyzer code (with integrated moodSelected update from face scan)
    // Destination data
    const destinationPool = [
      {
        title: "Rishikesh, Uttarakhand",
        label: "Spiritual",
        moods: [1, 4], // Calm, Reflective
        img: "https://t4.ftcdn.net/jpg/03/01/35/03/360_F_301350326_5gAQhd0fH2faDncnsGBJqCxroCUCsQVn.jpg",
        tags: ["Yoga", "River Rafting", "Temple Visits"],
        energy: [4,10], social: [1,7], adventure: [2,8]
      },
      {
        title: "Goa Beaches",
        label: "Relaxation",
        moods: [0, 5], // Happy, Social
        img: "https://t3.ftcdn.net/jpg/02/43/24/76/360_F_243247620_Clg6rXsX4K0lhPWip3oo9Oee28J30L23.jpg",
        tags: ["Beach", "Water Sports", "Nightlife"],
        energy: [5,10], social: [4,10], adventure: [1,7]
      },
      {
        title: "Ladakh, J&K",
        label: "Adventure",
        moods: [2, 3], // Curious, Energetic
        img: "https://media.istockphoto.com/id/1391003874/photo/scenic-landscape-view-of-himalaya-mountain.jpg?s=612x612&w=0&k=20&c=IoGJQ3NPucbZqmKaej7fgB7iYkmEnhsDhPZySsU3agw=",
        tags: ["Trekking", "Motorcycle Tours", "Camping"],
        energy: [7,10], social: [3,8], adventure: [8,10]
      },
      {
        title: "Varanasi, UP",
        label: "Culture",
        moods: [1, 4], // Calm, Reflective
        img: "https://media.istockphoto.com/id/537988165/photo/varanasi.jpg?s=612x612&w=0&k=20&c=fFpEL17MiQJx5NkkNIVrTsesd2E8b04SCgzjfhUmQ7g=",
        tags: ["Ganga Aarti", "Temples", "Ghats"],
        energy: [1,6], social: [2,8], adventure: [1,4]
      },
      {
        title: "Jaipur, Rajasthan",
        label: "Heritage",
        moods: [0,2], // Happy, Curious
        img: "https://e1.pxfuel.com/desktop-wallpaper/649/470/desktop-wallpaper-rajasthan-culture-rajasthan.jpg",
        tags: ["Palaces", "Forts", "Food"],
        energy: [5,10], social: [1,10], adventure: [3,8]
      },
      {
        title: "Kerala Backwaters",
        label: "Nature",
        moods: [1, 4], // Calm, Reflective
        img: "https://t3.ftcdn.net/jpg/12/61/62/58/360_F_1261625896_moxQeeYntW01yx5WtChl5kNRrRnn6Hmg.jpg",
        tags: ["Houseboat", "Ayurveda", "Lakes"],
        energy: [1,5], social: [1,7], adventure: [1,5]
      },
      {
        title: "Mumbai",
        label: "Urban Life",
        moods: [0, 5], // Happy, Social
        img: "https://t4.ftcdn.net/jpg/01/46/43/87/360_F_146438747_3XYwVkfnYZuukBZYmDM8xeoqENzyhAqa.jpg",
        tags: ["Nightlife", "Bollywood", "Street Food"],
        energy: [5,10], social: [5,10], adventure: [1,6]
      },
    ];

    function renderStep() {
      // Update indicator dots
      if (stepIndicator) {
        [...stepIndicator].forEach((dot, idx) => dot.className = 'dot' + (idx === step ? ' active' : ''));
      }
      // Steps logic
      if(step === 0){
        stepsDiv.innerHTML = `
          <h1>AI Mood Analyzer</h1>
          <div class="subtitle">Let our AI understand your current mood to suggest perfect destinations</div>
          <h2>How are you feeling today?</h2>
          <div class="mood-options" role="list">
            ${moods.map((m, i) =>
              `<div class="mood-option${moodSelected===i?' selected':''}" role="listitem" tabindex="0" aria-pressed="${moodSelected===i}" 
                onclick="selectMood(${i})" onkeydown="if(event.key==='Enter' || event.key===' ') { event.preventDefault(); selectMood(${i});}" >
                  <span aria-hidden="true">${m.emoji}</span>
                  ${m.label}
                </div>`
            ).join('')}
          </div>
          <div class="btn-row">
            <button class="btn-outline" disabled>Previous</button>
            <button class="btn-outline"${moodSelected===null?' disabled':''} onclick="nextStep()">Next</button>
          </div>
          <p style="font-size:0.9rem;color:#666;margin-top:0.6rem;">
            <em>You can also <strong>start face scan above</strong> to auto-detect your mood.</em>
          </p>
        `;
      }
      else if(step === 1){
        let levelText = energyLevel < 3 ? "Low" : (energyLevel < 7 ? "Moderate" : "High");
        stepsDiv.innerHTML = `
          <h1>AI Mood Analyzer</h1>
          <div class="subtitle">Let our AI understand your current mood to suggest perfect destinations</div>
          <div class="slider-section">
            <div class="slider-title">What's your energy level?</div>
            <div class="emoji-large">😊</div>
            <div class="slider-value">${levelText}</div>
            <input type="range" min="1" max="10" value="${energyLevel}" id="energy-slider" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${energyLevel}" />
            <div class="slider-labels">
              <span>Low</span>
              <span>High</span>
            </div>
            <div style="margin-top:10px;"><span style="color:#888;">Energy Level: ${energyLevel}/10</span></div>
          </div>
          <div class="btn-row">
            <button class="btn-outline" onclick="prevStep()">Previous</button>
            <button class="btn-outline" onclick="nextStep()">Next</button>
          </div>
        `;
        setTimeout(()=>{
          document.getElementById('energy-slider').addEventListener("input", e=>{
            energyLevel = parseInt(e.target.value);
            renderStep();
          });
        }, 0);
      }
      else if(step === 2){
        let levelText = socialLevel < 4 ? "Solo" : (socialLevel < 7 ? "Small Groups" : "Groups");
        stepsDiv.innerHTML = `
          <h1>AI Mood Analyzer</h1>
          <div class="subtitle">Let our AI understand your current mood to suggest perfect destinations</div>
          <div class="slider-section">
            <div class="slider-title">How social do you want to be?</div>
            <div class="emoji-large">👥</div>
            <div class="slider-value">${levelText}</div>
            <input type="range" min="1" max="10" value="${socialLevel}" id="social-slider" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${socialLevel}" />
            <div class="slider-labels">
              <span>Solo</span>
              <span>Group</span>
            </div>
            <div style="margin-top:10px;"><span style="color:#888;">Social Level: ${socialLevel}/10</span></div>
          </div>
          <div class="btn-row">
            <button class="btn-outline" onclick="prevStep()">Previous</button>
            <button class="btn-outline" onclick="nextStep()">Next</button>
          </div>
        `;
        setTimeout(()=>{
          document.getElementById('social-slider').addEventListener("input", e=>{
            socialLevel = parseInt(e.target.value);
            renderStep();
          });
        }, 0);
      }
      else if(step === 3){
        let text = adventureLevel < 4 ? "Safe" : (adventureLevel < 7 ? "Mild Adventure" : "Adventurous");
        stepsDiv.innerHTML = `
          <h1>AI Mood Analyzer</h1>
          <div class="subtitle">Let our AI understand your current mood to suggest perfect destinations</div>
          <div class="slider-section">
            <div class="slider-title">How adventurous are you feeling?</div>
            <div class="emoji-large">🚶</div>
            <div class="slider-value">${text}</div>
            <input type="range" min="1" max="10" value="${adventureLevel}" id="adventure-slider" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${adventureLevel}" />
            <div class="slider-labels">
              <span>Safe</span>
              <span>Adventurous</span>
            </div>
            <div style="margin-top:10px;"><span style="color:#888;">Adventure Level: ${adventureLevel}/10</span></div>
          </div>
          <div class="btn-row">
            <button class="btn-outline" onclick="prevStep()">Previous</button>
            <button class="btn-outline" onclick="showRecommendations()">Analyze My Mood</button>
          </div>
        `;
        setTimeout(()=>{
          document.getElementById('adventure-slider').addEventListener("input", e=>{
            adventureLevel = parseInt(e.target.value);
            renderStep();
          });
        }, 0);
      }
    }

    window.selectMood = function(idx){
      manualMoodOverride = true; // user manually selected mood - prevent face scanning override
      moodSelected = idx;
      renderStep();
    }

    window.nextStep = function(){
      if(step < 3) step++;
      renderStep();
    }

    window.prevStep = function(){
      if(step > 0) step--;
      renderStep();
    }

    // Filter destinations dynamically based on all params
    function getPersonalizedDestinations() {
      let mood = moodSelected;
      let energy = energyLevel;
      let social = socialLevel;
      let adventure = adventureLevel;
      let results = destinationPool.filter(place => {
        let moodMatch = place.moods.includes(mood);
        let energyMatch = (energy >= place.energy[0] && energy <= place.energy[1]);
        let socialMatch = (social >= place.social[0] && social <= place.social[1]);
        let adventureMatch = (adventure >= place.adventure[0] && adventure <= place.adventure[1]);
        return moodMatch && energyMatch && socialMatch && adventureMatch;
      });
      if (results.length === 0){
        results = destinationPool.filter(place=>place.moods.includes(mood)).slice(0,3);
      }
      if(results.length === 0){
        results = destinationPool.slice(0,3);
      }
      results = results.sort(()=>Math.random()-0.5).slice(0,3);
      return results;
    }

    let selectedPlaceIdx = null;

    window.showRecommendations = function() {
      if (stepIndicator) {
        [...stepIndicator].forEach((dot) => dot.className = 'dot');
      }
      let recommendations = getPersonalizedDestinations();
      selectedPlaceIdx = null;
      stepsDiv.innerHTML = `
        <h1>Your Personalized Recommendations</h1>
        <div class="subtitle">Based on your current mood and preferences</div>
        <div class="card-recommend">
          ${recommendations.map((dest, idx) => `
            <div class="recommend-card${selectedPlaceIdx===idx?' selected':''}" 
                 onclick="selectPlaceToBook(${idx}, this)" role="button" tabindex="0"
                 onkeydown="if(event.key==='Enter' || event.key===' ') {event.preventDefault(); selectPlaceToBook(${idx}, this);}" aria-pressed="false" aria-label="Select destination ${dest.title}">
              <img src="${dest.img}" alt="${dest.title} image">
              <div class="rc-info">
                <div class="rc-title">${dest.title}</div>
                <div class="rc-label">${dest.label}</div>
                <div class="rc-tags">
                  ${dest.tags.map(tag=>`<span class="rc-tag">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="btn-row">
          <button class="btn-outline" onclick="restartMood()">Analyze Again</button>
          <button class="btn-outline" id="paySelectBtn" onclick="payForTrip()" disabled>Pay & Select Date</button>
        </div>
        <style>.recommend-card.selected{border:2px solid #3366ff;box-shadow:0 2px 8px #3366ff33;}</style>
      `;
    };

    window.selectPlaceToBook = function(idx, el) {
      selectedPlaceIdx = idx;
      [...document.querySelectorAll('.recommend-card')].forEach(card => card.classList.remove('selected'));
      el.classList.add('selected');
      document.getElementById('paySelectBtn').disabled = false;
    };

    window.payForTrip = function() {
      let recommendations = getPersonalizedDestinations();
      if (selectedPlaceIdx === null) return;
      const dest = recommendations[selectedPlaceIdx];
      let amount = 5000 + (energyLevel * 120) + (adventureLevel * 180) + (socialLevel * 100);
      stepsDiv.innerHTML = `
        <h1>Trip Booking Details</h1>
        <form id="tripForm" onsubmit="event.preventDefault(); showTicket(${amount});">
          <div class="trip-summary">
            <img src="${dest.img}" style="width:120px;float:right;margin-left:1em;" alt="${dest.title} image">
            <b>Destination: </b>${dest.title}<br>
            <b>Mood: </b>${moods[moodSelected].label}<br>
            <b>Energy: </b>${energyLevel}/10<br>
            <b>Social: </b>${socialLevel < 4 ? "Solo" : (socialLevel < 7 ? "Small Group" : "Group")} (${socialLevel}/10)<br>
            <b>Adventure: </b>${adventureLevel < 4 ? "Safe" : (adventureLevel < 7 ? "Mild" : "Adventurous")} (${adventureLevel}/10)<br>
          </div>
          <fieldset style="margin-top:2em;">
            <legend>User Details</legend>
            <label>Name: <input name="uname" type="text" required></label>
            <label>Age: <input name="uage" type="number" min="1" max="120" required></label>
            <label>DOB: <input name="udob" type="date" required></label>
            <label>Address: <input name="uaddress" type="text" required></label>
          </fieldset>
          <div style="margin-top:1em;">
            <label><b>Trip Date:</b> <input name="tripdate" type="date" min="${getToday()}" required></label>
          </div>
          <div style="margin:1.5em 0;font-size:1.2em;">
            <b>Trip Price:</b> ₹${amount}
          </div>
          <button type="submit" class="btn-outline" style="margin-right:1em;">Pay & Confirm</button>
          <button type="button" class="btn-outline" onclick="restartMood()">Cancel</button>
        </form>
      `;
    };

    function getToday(){
      let today = new Date();
      let m = String(today.getMonth()+1).padStart(2,'0');
      let d = String(today.getDate()).padStart(2,'0');
      return `${today.getFullYear()}-${m}-${d}`;
    }

    window.showTicket = function(amount) {
      let f = document.getElementById('tripForm');
      let name = f.uname.value;
      let age = f.uage.value;
      let dob = f.udob.value;
      let address = f.uaddress.value;
      let tripdate = f.tripdate.value;

      let recommendations = getPersonalizedDestinations();
      const dest = recommendations[selectedPlaceIdx];

      stepsDiv.innerHTML = `
        <div style="max-width:375px;margin:2em auto;padding:2em 2.2em 1.6em;border-radius:16px;background:#f6f7fb;box-shadow:0 4px 16px #0053af12;color:#212d49;">
          <div style="text-align:center;margin-bottom:0.9em;">
            <img src="${dest.img}" style="width:85px;border-radius:7px;border:2px solid #1947b5;" alt="${dest.title} image">
            <h2 style="margin:0.8em 0 0.1em;font-size:1.5em;">DarShana AI Trip Ticket</h2>
            <small style="color:#777;">Your Mood-Powered Experience</small>
          </div>
          <div style="margin:1em 0 1.2em;line-height:1.5;">
            <b>Name:</b> ${name}<br>
            <b>Age:</b> ${age} <br>
            <b>DOB:</b> ${dob}<br>
            <b>Address:</b> ${address}<br>
            <b>Date of Trip:</b> ${tripdate}
          </div>
          <div style="background:#dde6f9;padding:10px 12px 8px;border-radius:7px;">
            <b>Destination:</b> ${dest.title} <br>
            <b>Mood:</b> ${moods[moodSelected].label}<br>
            <b>Energy:</b> ${energyLevel}/10 &nbsp;
            <b>Social:</b> ${socialLevel < 4 ? "Solo" : (socialLevel < 7 ? "Small Group" : "Group")} (${socialLevel}/10) <br>
            <b>Adventure:</b> ${adventureLevel < 4 ? "Safe" : (adventureLevel < 7 ? "Mild" : "Adventurous")} (${adventureLevel}/10) <br>
          </div>
          <div style="margin:1em 0;font-size:1.2em;">
            <b>Amount Paid: ₹${amount}</b>
          </div>
          <div style="text-align:center;margin-bottom:1em;">
            <span style="font-size:1.35em;color:#009944;"><b>Booking Confirmed</b></span><br>
            <span style="font-size:1em;color:#2a67f5;">Enjoy your AI-powered journey!</span>
          </div>
          <button class="btn-outline" style="display:block;margin:10px auto 0;" onclick="restartMood()">Plan Another Trip</button>
          <button class="btn-outline" style="display:block;margin:16px auto 0;" onclick="downloadTicketPDF()">Download PDF Slip</button>
        </div>
      `;
    };

    // Generate PDF ticket using jsPDF
    window.downloadTicketPDF = function() {
      let recommendations = getPersonalizedDestinations();
      const dest = recommendations[selectedPlaceIdx];
      let amountElem = document.querySelector("div[style*='font-size:1.2em;'] b");
      let amountMatch = amountElem ? amountElem.textContent.match(/\d+/) : null;
      let amount = amountMatch ? amountMatch[0] : "N/A";

      // Use last booking info stored globally for better UX
      // Otherwise prompt user for data (simple solution here)
      let name = prompt("Enter Name (for PDF):", "");
      let age = prompt("Enter Age (for PDF):", "");
      let dob = prompt("Enter DOB (YYYY-MM-DD):", "");
      let address = prompt("Enter Address:", "");
      let tripdate = prompt("Enter Trip Date (YYYY-MM-DD):", "");

      const { jsPDF } = window.jspdf;
      let doc = new jsPDF();
      let y = 20;

      doc.setFontSize(16);
      doc.text('DarShana AI Trip Ticket', 20, y); y+=11;
      doc.setFontSize(10);
      doc.text('Your Mood-Powered Experience', 20, y); y+=12;
      doc.setFontSize(12);
      doc.text(`Name: ${name}`, 20, y); y+=7;
      doc.text(`Age: ${age}`, 20, y); y+=7;
      doc.text(`DOB: ${dob}`, 20, y); y+=7;
      doc.text(`Address: ${address}`, 20, y); y+=7;
      doc.text(`Trip Date: ${tripdate}`, 20, y); y+=8;
      doc.text(`Destination: ${dest.title}`, 20, y); y+=7;
      doc.text(`Mood: ${moods[moodSelected].label}`, 20, y); y+=7;
      doc.text(`Energy: ${energyLevel}/10`, 20, y); y+=7;
      doc.text(`Social: ${socialLevel < 4 ? "Solo" : (socialLevel < 7 ? "Small Group" : "Group")} (${socialLevel}/10)`, 20, y); y+=7;
      doc.text(`Adventure: ${adventureLevel < 4 ? "Safe" : (adventureLevel < 7 ? "Mild" : "Adventurous")} (${adventureLevel}/10)`, 20, y); y+=8;
      doc.setFontSize(13);
      doc.text(`Amount Paid: ₹${amount}`, 20, y); y+=9;
      doc.setFontSize(11);
      doc.text('Booking Confirmed | Enjoy your AI-powered journey!', 20, y);

      doc.save('Darshana_Trip_Ticket.pdf');
    };

    window.restartMood = function(){
      step = 0;
      moodSelected = null;
      energyLevel = 5;
      socialLevel = 5;
      adventureLevel = 5;
      manualMoodOverride = false;
      renderStep();
    };

    // Initial render
    renderStep();
    noMood();



// Cultural recommandation of enevt and fastivals
const festivals = [
  {
    name: "Diwali Festival",
    type: "religious",
    region: "Across India",
    image: "https://thumbs.dreamstime.com/b/decorated-diya-oil-lamp-happy-diwali-sign-set-bed-rose-petals-celebration-hindu-festival-diwali-deepavali-festival-389588303.jpg",
    month: ["oct", "nov"],
    desc: "Festival of lights celebrated with diyas, fireworks, and sweets.",
    experiences: ["Light Ceremonies", "Traditional Sweets", "Fireworks", "Family Gatherings"]
  },
  {
    name: "Holi Festival",
    type: "cultural",
    region: "North India",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1MRfFmaRAMNu_A4EodxJHsKyv-PGmMK7i5w&s",
    month: ["mar"],
    desc: "Festival of colors celebrating the arrival of spring.",
    experiences: ["Color Play", "Traditional Music", "Street Celebrations", "Special Foods"]
  },
  {
    name: "Durga Puja",
    type: "religious",
    region: "West Bengal",
    image: "https://i0.wp.com/www.tusktravel.com/blog/wp-content/uploads/2023/07/Durga-Puja.jpg?fit=1024%2C683&ssl=1",
    month: ["sep", "oct"],
    desc: "Grand celebration honoring Goddess Durga.",
    experiences: ["Pandal Hopping", "Cultural Programs", "Traditional Food", "Art Exhibitions"]
  },
  {
    name: "Eid-ul-Fitr",
    type: "religious",
    region: "Pan India",
    image: "https://media.citizen.co.za/wp-content/uploads/2025/03/Eid-al-Fitr.jpg",
    month: ["apr", "may"],
    desc: "Celebration marking the end of Ramadan fasting.",
    experiences: ["Prayer Gatherings", "Sweets", "Charity"]
  },
  {
    name: "Christmas",
    type: "religious",
    region: "Major Cities",
    image: "https://images.indianexpress.com/2024/02/Christmas-2024-Date-Christmas-2024-will-be-celebrated-on-25th-December-that-is-Wednesday.-Source-Freepik.jpg",
    month: ["dec"],
    desc: "Celebration of the birth of Jesus Christ, with decor and events.",
    experiences: ["Mass Prayers", "Decorations", "Music", "Santa Parade"]
  },
  {
    name: "Navratri Festival",
    type: "religious",
    region: "Gujarat",
    image: "https://www.gujarattourism.com/content/dam/gujrattourism/images/home_page/Navratri.jpg",
    month: ["sep", "oct"],
    desc: "Nine-day festival celebrating the goddess Durga.",
    experiences: ["Garba Dance", "Puja Ceremonies", "Traditional Foods"]
  },
  {
    name: "Ganesh Chaturthi",
    type: "religious",
    region: "Maharashtra",
    image: "https://www.nobrokerhood.com/blog/wp-content/uploads/2024/08/shutterstock_2351499283.jpg",
    month: ["aug", "sep"],
    desc: "Festival in honor of Lord Ganesha with vibrant processions.",
    experiences: ["Pandals", "Visarjan", "Sweets"]
  },
  {
    name: "Pushkar Fair",
    type: "cultural",
    region: "Rajasthan",
    image: "https://cdn.rajasthanstudio.com/2024/11/Pushkar-Mela-2024-11-09-18-07-15-384706-2024-11-09_18-07-16_156274.jpg.webp",
    month: ["nov"],
    desc: "India's largest camel fair with cultural events, markets, and competitions.",
    experiences: ["Camel Parade", "Folk Music", "Handicrafts"]
  }
];

const monthNames = {
  jan:"January", feb:"February", mar:"March", apr:"April", may:"May", jun:"June",
  jul:"July", aug:"August", sep:"September", oct:"October", nov:"November", dec:"December"
};

const cardsDiv = document.getElementById('festival-cards');
const filterBtns = document.querySelectorAll('.filter-btn');
const monthSelect = document.getElementById('month-select');

let festivalType = "all";
let festivalMonth = "all";

filterBtns.forEach(btn => {
  btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    festivalType = btn.dataset.type;
    renderFestivals();
  });
});

monthSelect.addEventListener('change', ()=>{
  festivalMonth = monthSelect.value;
  renderFestivals();
});

function renderFestivals(){
  let filtered = festivals.filter(f=>{
    let typeMatch = (festivalType === "all") || (festivalType === f.type);
    let monthMatch = (festivalMonth === "all") || (f.month.includes(festivalMonth));
    return typeMatch && monthMatch;
  });
  cardsDiv.innerHTML = filtered.map(f=>`
    <div class="festival-card">
      <div style="position:relative;">
        <img src="${f.image}" alt="${f.name}" class="festival-img"/>
        <div class="festival-type ${f.type}">${f.type.charAt(0).toUpperCase() + f.type.slice(1)}</div>
      </div>
      <div class="festival-content">
        <div class="festival-title">${f.name}</div>
        <div class="festival-meta">
          <span>📍 ${f.region}</span>
          <span>📅 ${f.month.map(m=>monthNames[m]).join(" - ")}</span>
        </div>
        <div class="festival-desc">${f.desc}</div>
        <div class="festival-experiences">
          <span class="exp-title">Festival Experiences:</span>
          ${f.experiences.map(exp=>`<span class="exp-tag">${exp}</span>`).join("")}
        </div>
        <button class="learn-btn">🔎 Learn More</button>
      </div>
    </div>
  `).join('');
}

renderFestivals();

// Sustainable & responsinable 

const carbonForm = document.getElementById('carbonForm');
const carbonResult = document.getElementById('carbonResult');

const emissionRates = {
  flight: 0.25, // kg CO2 per km per day (example)
  train: 0.06,
  bus: 0.08,
  car: 0.18,
};

carbonForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const days = parseInt(document.getElementById('tripdays').value);
  const type = document.getElementById('transporttype').value;

  // For demonstration, assume trip averages 100km/day
  const distance = days * 100;
  const rate = emissionRates[type] || 0.1;
  const totalCO2 = (distance * rate).toFixed(2);

  carbonResult.textContent =
    `Estimated Carbon Footprint: ${totalCO2} kg CO₂ for a ${days}-day trip by ${type.charAt(0).toUpperCase()+type.slice(1)}.`;
});

// AI ASSISTENT FEATURE

// Simple chat history + emergency button demos
const chatHistory = document.getElementById('chatHistory');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

// Initial welcome message
function addAssistantMsg(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg';
  msgDiv.textContent = text;
  chatHistory.appendChild(msgDiv);
}
addAssistantMsg("Hello! I'm your AI travel assistant. I can help you with real-time traffic updates, translate languages, provide emergency assistance, and suggest the best routes. How can I help you today?");

chatForm.addEventListener('submit', function(e){
  e.preventDefault();
  const userText = chatInput.value.trim();
  if(!userText) return;
  addAssistantMsg("You: " + userText);
  setTimeout(()=>{
    addAssistantMsg("Assistant: " + getBotReply(userText));
  }, 1200);
  chatInput.value = "";
});

function getBotReply(msg) {
  if(msg.toLowerCase().includes('traffic')) return "Current traffic to Red Fort is moderate.";
  if(msg.toLowerCase().includes('hospital')) return "Nearest hospital is AIIMS Delhi (4.5 km).";
  if(msg.toLowerCase().includes('translate')) return "Translation: 'Thank you' → 'धन्यवाद'";
  return "I'm here to assist! Please ask about traffic, hospitals, translation, or emergency help.";
}

// Emergency button: sends location and details (simulated)
window.sendEmergency = function(type) {
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(pos){
      const {latitude, longitude} = pos.coords;
      addAssistantMsg(
        `[EMERGENCY] ${type}: Location sent (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Help is on the way!`
      );
      alert(`${type} - Location sent. Emergency services contacted!`);
    }, function(){
      addAssistantMsg(
        `[EMERGENCY] ${type}: Location unavailable. Sending alert without location.`
      );
      alert(`${type} - Unable to get location. Emergency services contacted!`);
    });
  } else {
    addAssistantMsg(
      `[EMERGENCY] ${type}: Geolocation unsupported. Sending alert without location.`
    );
    alert(`${type} - Geolocation not supported. Emergency services contacted!`);
  }
};


   // Add your luxury train details below:
// script.js
const trains = [
  {
    name: "Deccan Odyssey",
    img: "https://deccan-odyssey.in/wp-content/uploads/2024/12/train-deccan-odyssey18.jpg",
    link: "https://www.irctc.co.in/nget/train-search"
  },
  {
    name: "The Golden Chariot",
    img: "https://www.tripsavvy.com/thmb/1ohjZcqgoCy1MU0aTeLSMa2V6_Q=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/golden-chariot-train-lg1-5a0303edda271500373e6ead.jpg",
    link: "https://www.goldenchariot.org/"
  },
  {
    name: "Palace on Wheels",
    img: "https://preview.redd.it/indian-railways-palace-on-wheels-v0-96wnngxu0ssa1.png?width=602&format=png&auto=webp&s=af5b96576808fee62ccb34311ebb1d747bf4e4a5",
    link: "https://www.thepalaceonwheels.com/"
  },
  {
    name: "Maharajas' Express",
    img: "https://www.peakadventuretour.com/assets/images/maharaja-express-train_banner.webp",
    link: "https://www.the-maharajas.com/"
  },
  {
    name: "Royal Rajasthan on Wheels",
    img: "https://www.luxurytrainsindia.org/images/royal-rajasthan-on-wheels-images/image-1.jpg",
    link: "https://www.indianluxurytrains.com/royal-rajasthan-on-wheels/"
  }
];

const trainTrack = document.getElementById("trainTrack");
let current = 0;
const cardWidth = 362; // card width + gap

function renderTrains() {
  trainTrack.innerHTML = trains
    .map(
      (train) => `
    <div class="train-card" onclick="window.open('${train.link}', '_blank')">
      <img src="${train.img}" alt="${train.name}" class="train-img" />
      <div class="train-name">${train.name}</div>
    </div>
  `
    )
    .join("");
  updateCarousel();
}

function updateCarousel() {
  trainTrack.style.transform = `translateX(${-current * cardWidth}px)`;
}

document.getElementById("prevBtn").onclick = () => {
  if (current > 0) current--;
  updateCarousel();
};

document.getElementById("nextBtn").onclick = () => {
  if (current < trains.length - 1) current++;
  updateCarousel();
};

// Initial render
renderTrains();

  // Trip & Travel Registration POrtal Logic

  const photoUploadInput = document.getElementById('photoUpload');
  const photoPreview = document.getElementById('photoPreview');
  const form = document.getElementById('tripRegistrationForm');
  const registrationMessage = document.getElementById('registrationMessage');
  const slipContainer = document.getElementById('slipContainer');

  // Slip Elements
  const slipPhoto = document.getElementById('slipPhoto');
  const slipName = document.getElementById('slipName');
  const slipEmail = document.getElementById('slipEmail');
  const slipPhone = document.getElementById('slipPhone');
  const slipState = document.getElementById('slipState');
  const slipDestination = document.getElementById('slipDestination');
  const slipTripDate = document.getElementById('slipTripDate');
  const slipDuration = document.getElementById('slipDuration');
  const slipPreferences = document.getElementById('slipPreferences');
  const slipDrive = document.getElementById('slipDrive');
  const payConfirmBtn = document.getElementById('payConfirmBtn');
  const downloadPDFBtn = document.getElementById('downloadPDFBtn');
  const printMessage = document.getElementById('printMessage');

  // Photo preview handler
  photoUploadInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      photoPreview.src = '';
      photoPreview.style.display = 'none';
    }
  });

  // Store photo base64 from preview for slip display and pdf
  let userPhotoBase64 = '';

  photoUploadInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        userPhotoBase64 = e.target.result;
        photoPreview.src = userPhotoBase64;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      userPhotoBase64 = '';
      photoPreview.src = '';
      photoPreview.style.display = 'none';
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    registrationMessage.textContent = '';
    if (!form.checkValidity()) {
      registrationMessage.style.color = '#dc2626';
      registrationMessage.textContent = 'Please fill out all required fields correctly.';
      form.reportValidity();
      return;
    }
    registrationMessage.textContent = '';

    // Collect form data
    const formData = new FormData(form);

    // Populate slip
    slipName.textContent = formData.get('fullName');
    slipEmail.textContent = formData.get('email');
    slipPhone.textContent = formData.get('phone');
    slipState.textContent = formData.get('state');
    slipDestination.textContent = formData.get('destination');
    slipTripDate.textContent = formData.get('tripDate');
    slipDuration.textContent = formData.get('duration');
    slipPreferences.textContent = formData.get('preferences') || 'None';
    slipDrive.textContent = formData.get('selfDrive') ? 'Yes' : 'No';

    if(userPhotoBase64){
      slipPhoto.src = userPhotoBase64;
      slipPhoto.style.display = 'block';
    } else {
      slipPhoto.style.display = 'none';
    }

    // Hide form, Show slip
    form.style.display = 'none';
    slipContainer.style.display = 'block';

    // Reset pay & download UI
    payConfirmBtn.style.display = 'inline-block';
    downloadPDFBtn.style.display = 'none';
    printMessage.textContent = '';
    registrationMessage.textContent = '';
  });

  // Payment confirmation click handler
  payConfirmBtn.addEventListener('click', () => {
    payConfirmBtn.style.display = 'none';
    downloadPDFBtn.style.display = 'inline-block';
    printMessage.textContent = 'Payment successful! You can now download your trip slip.';
    printMessage.style.color = '#16a34a';
  });

  // Download PDF slip button handler
  downloadPDFBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('DarShana Trip Registration Slip', 14, 20);
    doc.setFontSize(12);

    // Add photo if exists
    if(userPhotoBase64){
      const imgProps = doc.getImageProperties(userPhotoBase64);
      const pdfWidth = 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(userPhotoBase64, 'JPEG', 150, 10, pdfWidth, pdfHeight);
    }

    // Text fields
    let y = 40;
    function addLine(label, value){
      doc.text(`${label}: ${value}`, 14, y);
      y += 8;
    }
    addLine('Name', slipName.textContent);
    addLine('Email', slipEmail.textContent);
    addLine('Phone', slipPhone.textContent);
    addLine('State', slipState.textContent);
    addLine('Destination', slipDestination.textContent);
    addLine('Trip Date', slipTripDate.textContent);
    addLine('Duration (days)', slipDuration.textContent);
    addLine('Preferences', slipPreferences.textContent);
    addLine('Driving Self', slipDrive.textContent);
    addLine('Amount Paid', '₹10,000');

    doc.setFontSize(14);
    doc.text('Payment Confirmed - Enjoy your trip!', 14, y + 15);

    doc.save('Darshana_Trip_Registration_Slip.pdf');
  });

  document.getElementById('downloadMapBtn').addEventListener('click', () => {
    const mapNode = document.getElementById('mapContainer');
    domtoimage.toPng(mapNode)
      .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = 'festival-map.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        alert('Map image download failed: ' + error);
      });
  });