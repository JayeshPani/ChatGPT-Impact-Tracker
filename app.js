let sessionId = 0;
let interactionStartTime;
let beforeScoreLogged = false;
const reportData = [];
const feedbackRecords = [];
const sessionDurations = [];
const useCaseCount = { education: 0, business: 0, "mental-health": 0 };

// Initialize user segment data
const userSegmentData = {
  student: { count: 0, totalDuration: 0 },
  professional: { count: 0, totalDuration: 0 },
  patient: { count: 0, totalDuration: 0 }
};

// Initialize domain outcomes data
const domainOutcomes = {
  education: { improvements: [] },
  business: { resolutionTimes: [] },
  "mental-health": { satisfactionScores: [] }
};

// Function to start an interaction session
function startSession() {
  sessionId++;
  interactionStartTime = new Date();
  beforeScoreLogged = false;

  const userType = document.getElementById("userType").value;
  const conversationType = document.getElementById("conversationType").value;

  useCaseCount[conversationType] = (useCaseCount[conversationType] || 0) + 1;

  logInteraction({
    userId: sessionId,
    sessionId: sessionId,
    userType: userType,
    conversationType: conversationType,
    startTime: interactionStartTime,
  });

  console.log(`Session started for User Type: ${userType}, Conversation Type: ${conversationType}`);
}

// Function to log interaction details
function logInteraction(details) {
  const logList = document.getElementById("logList");
  const logItem = document.createElement("li");
  logItem.innerText = `Session ID: ${details.sessionId}, User Type: ${details.userType}, Conversation Type: ${details.conversationType}, Start Time: ${details.startTime}`;
  logList.appendChild(logItem);

  // Update user segment data
  userSegmentData[details.userType].count++;
  userSegmentData[details.userType].totalDuration += 0; // Placeholder for actual duration
}

// Function to end an interaction session
function endSession() {
  const interactionEndTime = new Date();
  const duration = Math.round((interactionEndTime - interactionStartTime) / 1000); // in seconds
  sessionDurations.push(duration);

  // Update user segment data for duration
  const userType = document.getElementById("userType").value;
  userSegmentData[userType].totalDuration += duration;

  const logList = document.getElementById("logList");
  const logItem = document.createElement("li");
  logItem.innerText = `Session ID: ${sessionId}, End Time: ${interactionEndTime}, Duration: ${duration} seconds`;
  logList.appendChild(logItem);

  // Show feedback section
  document.getElementById("feedbackSection").style.display = "block";
}

// Function to submit user feedback
function submitFeedback() {
  const satisfactionLevel = document.getElementById("satisfactionLevel").value;
  const sentimentScore = document.getElementById("sentimentScore").value;
  const feedbackText = document.getElementById("feedbackText").value;

  feedbackRecords.push({
    sessionId: sessionId,
    satisfactionLevel: parseInt(satisfactionLevel),
    sentimentScore: parseInt(sentimentScore),
    feedbackText: feedbackText,
  });

  console.log("Feedback recorded:", feedbackRecords[feedbackRecords.length - 1]);

  document.getElementById("feedbackSection").style.display = "none";
  document.getElementById("outcomeFeedbackSection").style.display = "block"; // Show next feedback section
}

// Function to submit session outcome feedback
async function submitOutcomeFeedback() {
  const outcomeStatus = document.getElementById("outcomeStatus").value;
  const qualityOfAnswers = document.getElementById("qualityOfAnswers").value;

  // Prepare data for submission
  const outcomeFeedback = {
    sessionId: sessionId,
    outcomeStatus: outcomeStatus,
    qualityOfAnswers: parseInt(qualityOfAnswers),
  };

  try {
    const response = await fetch('/session/outcome-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outcomeFeedback)
    });

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    console.log("Outcome feedback submitted:", data);
  } catch (error) {
    console.error('Error submitting outcome feedback:', error);
  }

  // Clear the outcome feedback section
  document.getElementById("outcomeFeedbackSection").style.display = "none";
  document.getElementById("impactMetricsSection").style.display = "block"; // Show next section
}

// Function to log domain outcomes based on user selection
function logDomainOutcome(outcomeStatus, qualityOfAnswers) {
  const domainType = document.getElementById("domainType").value;
  const outcomeValue = parseInt(qualityOfAnswers);

  if (outcomeStatus === "resolved") {
    domainOutcomes[domainType].improvements.push(outcomeValue);
  } else if (outcomeStatus === "unresolved") {
    domainOutcomes[domainType].resolutionTimes.push(outcomeValue);
  }

  console.log(`Domain outcome logged for ${domainType}:`, domainOutcomes[domainType]);
}

// Function to log the before score
function logBeforeScore() {
  const beforeScore = document.getElementById("beforeScore").value;
  beforeScoreLogged = true;

  console.log(`Before score logged: ${beforeScore}`);

  // Show after score input and button
  document.getElementById("afterScore").style.display = "block";
  document.getElementById("logAfterScoreButton").style.display = "inline";
}

// Function to log the after score
function logAfterScore() {
  const afterScore = document.getElementById("afterScore").value;
  console.log(`After score logged: ${afterScore}`);

  // Prepare to calculate impact and reset fields
  document.getElementById("impactMetricsSection").style.display = "none"; // Hide this section
}

// Function to show user segments
function showUserSegments() {
  const userSegmentsList = document.getElementById("userSegmentsList");
  userSegmentsList.innerHTML = ""; // Clear previous segments

  for (const [userType, data] of Object.entries(userSegmentData)) {
    const listItem = document.createElement("li");
    listItem.innerText = `${userType.charAt(0).toUpperCase() + userType.slice(1)}: Count = ${data.count}, Total Duration = ${data.totalDuration} seconds`;
    userSegmentsList.appendChild(listItem);
  }

  document.getElementById("userSegmentsContent").style.display = "block"; // Show the user segments
}

// Function to fetch domain outcomes from the API
async function fetchDomainOutcomes() {
  try {
    const response = await fetch('/domain/outcomes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    displayDomainOutcomes(data);
  } catch (error) {
    console.error('Error fetching domain outcomes:', error);
    document.getElementById("domainOutcomesDisplay").innerText = "Error fetching domain outcomes. Please try again.";
  }
}

// Function to display fetched domain outcomes
function displayDomainOutcomes(outcomes) {
  const displayContainer = document.getElementById("domainOutcomesDisplay");
  displayContainer.innerHTML = ""; // Clear previous outcomes

  for (const [domain, outcomeData] of Object.entries(outcomes)) {
    const domainItem = document.createElement("p");
    domainItem.innerText = `${domain.charAt(0).toUpperCase() + domain.slice(1)}: ${JSON.stringify(outcomeData)}`;
    displayContainer.appendChild(domainItem);
  }
}

// Function to show domain outcomes section
function showDomainOutcomes() {
  const domainOutcomesContent = document.getElementById("domainOutcomesContent");
  domainOutcomesContent.style.display = domainOutcomesContent.style.display === "none" ? "block" : "none";
}

// Function to generate a custom report
function generateCustomReport() {
  const timeframe = document.getElementById("reportTimeframe").value;
  const userGroup = document.getElementById("reportUserGroup").value;
  const region = document.getElementById("reportRegion").value;

  const reportOutput = `Report for ${userGroup} in ${region} during ${timeframe}: \n\nFeedback Records: ${JSON.stringify(feedbackRecords)}`;

  document.getElementById("reportOutput").innerText = reportOutput;
  document.getElementById("reportContent").style.display = "block"; // Show the report content
}

// Function to show usage analytics
function showUsageAnalytics() {
  const totalSessions = sessionId;
  const averageDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length || 0;

  document.getElementById("totalSessions").innerText = totalSessions;
  document.getElementById("averageDuration").innerText = averageDuration.toFixed(2);
  document.getElementById("popularUseCases").innerText = JSON.stringify(useCaseCount);

  document.getElementById("usageAnalyticsContent").style.display = "block"; // Show the analytics content
}

// Function to show feedback summary
function showFeedbackSummary() {
  const totalSatisfaction = feedbackRecords.reduce((acc, record) => acc + record.satisfactionLevel, 0);
  const averageSatisfaction = totalSatisfaction / feedbackRecords.length || 0;
  
  const totalSentiment = feedbackRecords.reduce((acc, record) => acc + record.sentimentScore, 0);
  const averageSentiment = totalSentiment / feedbackRecords.length || 0;

  document.getElementById("averageSatisfaction").innerText = averageSatisfaction.toFixed(2);
  document.getElementById("averageSentiment").innerText = averageSentiment.toFixed(2);
  document.getElementById("totalInteractions").innerText = feedbackRecords.length;

  document.getElementById("summaryContent").style.display = "block"; // Show the summary content
}
document.addEventListener("DOMContentLoaded", () => {
  const titleText = "ChatGPT Impact Tracker";
  const titleElement = document.querySelector(".title");
  const circleElement = document.querySelector(".typing-circle");
  let charIndex = 0;

  function typeTitle() {
    if (charIndex < titleText.length) {
      titleElement.childNodes[0].textContent = titleText.slice(0, charIndex + 1); // Reveal next character
      charIndex++;
      setTimeout(typeTitle, 150); // Delay between characters
    } else {
      circleElement.style.display = "none"; // Hide dot once typing is complete
    }
  }

  typeTitle(); // Start typing effect
});
