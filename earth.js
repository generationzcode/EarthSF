let gramsEarthSFUsed = 0;
let pestsEliminated = 0;
let sulfurRemnants = [];
let earthSFeffectiveness = 0; // Track effectiveness of EarthSF


  let season = "Spring";
  let gameYear = 1;
  let money = 100;
  let yieldQuality = 0;
  let totalLeaves = 0;
  let premiumLeaves = 0;
  let pestsBeforeSulfur = 0;

  let pests = [];
  let leaves = [];
  let maxPests = 20;

  let sulfurApplied = false;
  let sulfurEffectTimer = 0;
  let showSulfurText = false;

  let seasonTime = 15; // 15 seconds per season
  let seasonCountdown = seasonTime * 60;
  let nextSeasonText = "";

  function calculateEarthSFeffectiveness() {
    if (gramsEarthSFUsed > 0) {
      earthSFeffectiveness = (pestsEliminated / gramsEarthSFUsed) * 100;
    } else {
      earthSFeffectiveness = 0;
    }
  }


  function applySulfur(x, y) {
    if (season === "Spring") {
      gramsEarthSFUsed += 50;
      money -= 10;
      sulfurRemnants.push({ x, y, opacity: 255 }); // Track sulfur remnants with full opacity
      feedbackMessages.push("EarthSF applied!");
    }
  }function displaySulfurRemnants() {
  for (let i = sulfurRemnants.length - 1; i >= 0; i--) {
    let remnant = sulfurRemnants[i];
    fill(255, 223, 0, remnant.opacity); // Yellow color with transparency
    noStroke();
    rect(remnant.x - 5, remnant.y - 5, 10, 10); // Small 10x10 square

    // Fade sulfur over time
    if (season === "Summer") {
      remnant.opacity -= 2;
    }

    // Remove remnant if opacity is fully gone or season changes
    if (remnant.opacity <= 0 || season === "Winter") {
      sulfurRemnants.splice(i, 1);
    }
  }
}


  // Feedback Messages
  let mapBuffer;

  function setup() {
    createCanvas(windowWidth, windowHeight);
    mapBuffer = createGraphics(width, height);
    drawPixelArtMap();
  }

  function drawPixelArtMap() {
    let tileSize = 20;

    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        // Base grass color with slight variations
        let grassColor = color(random(90, 120), random(150, 180), random(90, 120));

        // Introduce dirt patches
        let isDirt = random() < 0.05;
        if (isDirt) {
          grassColor = color(random(140, 160), random(110, 90), random(50, 30));
        }

        // Add some bushes or rocks
        let isBushOrRock = random() < 0.02;
        if (isBushOrRock) {
          grassColor = random() < 0.5 ? color(30, 80, 30) : color(100, 100, 100);
        }

        // Draw the tile on the buffer
        mapBuffer.fill(grassColor);
        mapBuffer.noStroke();
        mapBuffer.rect(x, y, tileSize, tileSize);
      }
    }
  }

  function draw() {
    background("#a3c585");
    image(mapBuffer, 0, 0); // Draw the generated map

    // Other game elements
    displayUI();
    displaySulfurRemnants();

    if (season === "Spring") drawSpring();
    if (season === "Summer") drawSummer();
    if (season === "Autumn") drawAutumn();
    if (season === "Winter") evaluateHarvest();

    updateSeasonTimer();
    displayFeedback();
  }

  function responsiveTextSize(baseSize) {
    // Scale text based on screen size, ensuring it remains readable
    return max(baseSize * 0.7, windowWidth * 0.02);
  }



  function resetSeason() {
    pests = [];
    leaves = [];
    sulfurApplied = false;


    // Prepare the next season text
    if (season === "Spring"){ nextSeasonText = "Next: Summer - Protect your crops!";
    let earnings = premiumLeaves * 50 + (totalLeaves - premiumLeaves) * 20;
    yieldQuality = 0;
    totalLeaves = 0;
    premiumLeaves = 0;
};
    if (season === "Summer") nextSeasonText = "Next: Autumn - Time to harvest!";
    if (season === "Autumn") nextSeasonText = "Next: Winter - See your results!";
    if (season === "Winter") {
      nextSeasonText = "Next: Spring - Start a new year!";
      gameYear++;
    }

    // Generate pests in the summer
    if (season === "Summer") {
      let pestCount = sulfurApplied ? 5 : maxPests;
      for (let i = 0; i < pestCount; i++) {
        pests.push({ x: random(width), y: random(height / 2, height), speed: random(1, 3) });
      }
      reducePests();
    }

    // Generate leaves in autumn
    if (season === "Autumn") {
      // Calculate premium leaf chance based on sulfur remnants
      let premiumChance = constrain(0.1 + sulfurRemnants.length * 0.1, 0.1, 0.8);
      // Starts at 10%, maxes out at 80%

      for (let i = 0; i < 30; i++) {
        leaves.push({
          x: random(width),
          y: random(height / 2, height),
          isPremium: random() < premiumChance
        });
      }

      console.log("Premium Leaves Generated: ", leaves.filter(leaf => leaf.isPremium).length);
    }

  }


  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }

  function reducePests() {
    if (season === "Summer") {
      pests = pests.filter(pest => {
        // Check if any sulfur application is within radius
        for (let sulfur of sulfurRemnants) {
          let distance = dist(pest.x, pest.y, sulfur.x, sulfur.y);
          if (distance < sulfur.radius) {
            pestsEliminated++;
            return false; // Pest eliminated
          }
        }
        return true; // Pest remains
      });
    }
  }


  function displayUI() {
    fill(0);
    textSize(responsiveTextSize(24));
    textAlign(LEFT);/*
    text(`Season: ${season}`, 20, 30);
    text(`Money: $${money}`, 20, 60);
    text(`Year: ${gameYear}`, 20, 90);
*/
    // Countdown timer and next season
    textAlign(RIGHT);
    text(`Time Left: ${Math.ceil(seasonCountdown / 60)}s`, width - 20, 30);
    text(`${nextSeasonText}`, width - 20, 60);

    // Display status messages for player
    textAlign(LEFT);
    if (season === "Spring") text("Drag sulfur over the field to apply it!", 20, height - 40);
    if (season === "Summer") text("Click pests to eliminate them!", 20, height - 40);
    if (season === "Autumn") text("Tap leaves to harvest! Premium leaves earn more.", 20, height - 40);
  }

  // Spring actions
  function drawSpring() {
    drawSquare(mouseX, mouseY, 50, "Sulfur", "#FFD700");

    if (sulfurApplied) {
      sulfurEffectTimer--;
      fill(255, 255, 100, map(sulfurEffectTimer, 0, 60, 0, 150));
      rect(0, 0, width, height);

      if (sulfurEffectTimer <= 0) sulfurApplied = false;
    }

    if (showSulfurText) {
      fill(0);
      textSize(24);
      textAlign(CENTER, CENTER);
      text("✅ Sulfur Applied! Your plants are protected.", width / 2, height / 2 - 50);
    }
  }

  // Summer actions
  function drawSummer() {
    fill(200, 0, 0);
    for (let pest of pests) {
      image(beetle,pest.x, pest.y, 40,40);
      pest.x += random(-1, 1) * pest.speed;
      pest.y += random(-1, 1) * pest.speed;
    }
    if (sulfurApplied) {
      fill(0);
      text("Your plants are resistant to pests! Reduced pests.", width / 2, height / 2);
    }
  }

  // Autumn actions
  function drawAutumn() {
    for (let leaf of leaves) {
      fill(leaf.isPremium ? "gold" : "green");
      ellipse(leaf.x, leaf.y, 20);
    }
  }
  function evaluateHarvest() {
    let earnings = premiumLeaves * 50 + (totalLeaves - premiumLeaves) * 20;

    fill(0);
    textSize(responsiveTextSize(32));
    textAlign(CENTER, CENTER);

    // Calculate Pest Resistance Improvement
    let pestResistanceImprovement = pestsBeforeSulfur > 0
      ? Math.min((pestsEliminated / pestsBeforeSulfur) * 100, 100)
      : 0;

    // Calculate Yield Improvement based on Premium Leaves
    let yieldImprovement = totalLeaves > 0
      ? (premiumLeaves / totalLeaves) * 100
      : 0;

    // Display the winter summary
    text(`Winter Summary:`, width / 2, height / 2 - 100);
    text(`🌿 Yield Improvement (Premium Leaves): ${yieldImprovement.toFixed(1)}%`, width / 2, height / 2 - 60);
    text(`🐞 Pests Eliminated: ${pestsEliminated}`, width / 2, height / 2 - 20);
    text(`🍃 Premium Leaves: ${premiumLeaves}`, width / 2, height / 2 + 20);
    text(`💰 Total Money Earned: $${money}`, width / 2, height / 2 + 60);
  }

  // Update season timer and transition
  function updateSeasonTimer() {
    seasonCountdown--;
    if (seasonCountdown <= 0) {
      seasonCountdown = seasonTime * 60;
      season = nextSeason(season);
      resetSeason();
    }
  }

  function preload() {
    plant = loadImage('plant1.png');
    beetle = loadImage('beetle.png');
  }
  let feedbackMessages = []; // New feedback array
  function displayFeedback() {
    // Adjust text sizes
    let titleFontSize = responsiveTextSize(12);
    let textFontSize = responsiveTextSize(10);
    textSize(textFontSize);

    // Calculate the maximum text width
    let maxTextWidth = max(
      textWidth("📢 Feedback & Metrics:"),
      textWidth(`📅 Season: ${season}`),
      textWidth(`🗓 Year: ${gameYear}`),
      textWidth(`💰 Money: $${money}`),
      textWidth(`🌿 Sulfur Used: ${gramsEarthSFUsed}g`),
      textWidth(`🐞 Pests Eliminated: ${pestsEliminated}`),
      textWidth(`🍃 Total Leaves: ${totalLeaves} (Premium: ${premiumLeaves})`)
    );

    // Responsive and constrained panel width
    let panelPadding = 15;
    let panelWidth = constrain(maxTextWidth + panelPadding * 2, 180, windowWidth * 0.25);

    // Adjust panel height
    let textHeight = textAscent() + textDescent();
    let lines = 7; // Number of text lines
    let panelHeight = (textHeight + 8) * lines + panelPadding * 2;

    // Panel Position
    let panelX = 10;
    let panelY = 20;

    // Draw Panel
    fill(30, 30, 30, 220); // Dark semi-transparent background
    stroke(200, 200, 200, 180); // Light border for contrast
    strokeWeight(1);
    rect(panelX, panelY, panelWidth, panelHeight, 12);

    // Display Text
    fill(255);
    noStroke();
    textAlign(LEFT);

    // Title
    textSize(titleFontSize);
    text("📢 Feedback & Metrics:", panelX + panelPadding, panelY + panelPadding + titleFontSize);

    // Other Feedback Data
    textSize(textFontSize);
    let ySpacing = textHeight + 8;
    let startY = panelY + panelPadding + titleFontSize + ySpacing;

    text(`📅 Season: ${season}`, panelX + panelPadding, startY);
    text(`🗓 Year: ${gameYear}`, panelX + panelPadding, startY + ySpacing);
    text(`💰 Money: $${money}`, panelX + panelPadding, startY + 2 * ySpacing);
    text(`🌿 Sulfur Used: ${gramsEarthSFUsed}g`, panelX + panelPadding, startY + 3 * ySpacing);
    text(`🐞 Pests Eliminated: ${pestsEliminated}`, panelX + panelPadding, startY + 4 * ySpacing);
    text(`🍃 Total Leaves: ${totalLeaves}`, panelX + panelPadding, startY + 5 * ySpacing);
  }
  function mousePressed() {
    if (season === "Spring") {
      if (!sulfurApplied) {
        sulfurApplied = true;
        sulfurEffectTimer = 60;
        gramsEarthSFUsed += 100; // Example: 100g per application
        applySulfur(mouseX,mouseY);
      }
    }

    if (season === "Summer") {
      for (let i = pests.length - 1; i >= 0; i--) {
        if (dist(mouseX, mouseY, pests[i].x, pests[i].y) < 40) {
          pests.splice(i, 1);
          pestsEliminated++;
        }
      }
    }

    if (season === "Autumn") {
      for (let i = leaves.length - 1; i >= 0; i--) {
        if (dist(mouseX, mouseY, leaves[i].x, leaves[i].y) < 20) {
          totalLeaves++;
          if (leaves[i].isPremium) {
            premiumLeaves++;
            money += 50; // Premium leaves earn more
          } else {
            money += 20;
          }
          leaves.splice(i, 1);
        }
      }
    }
  }


  // Determine next season
  function nextSeason(season) {
    return season === "Spring"
      ? "Summer"
      : season === "Summer"
      ? "Autumn"
      : season === "Autumn"
      ? "Winter"
      : "Spring";
  }

  // Draw square with text
  function drawSquare(x, y, size, label, color) {
    fill(color);
    rect(x - size / 2, y - size / 2, size, size, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    text(label, x, y);
  }


  // Determine next season
  function nextSeason(season) {
    return season === "Spring"
      ? "Summer"
      : season === "Summer"
      ? "Autumn"
      : season === "Autumn"
      ? "Winter"
      : "Spring";
  }

  // Draw square with text
  function drawSquare(x, y, size, label, color) {
    fill(color);
    rect(x - size / 2, y - size / 2, size, size, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    text(label, x, y);
  }
