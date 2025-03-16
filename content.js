/* global chrome */

// This script will be injected into YouTube pages
console.log('YouTube AI Assistant loaded');

function createAIContainer() {
  const container = document.createElement('div');
  container.style.margin = '10px 0';
  container.style.display = 'flex';
  container.style.gap = '10px';
  container.style.alignItems = 'flex-start';

  // AI Button
  const button = document.createElement('button');
  button.textContent = 'Ask AI Assistant';
  button.style.cssText = `
    background: #4285f4;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
  `;

  // Input Area
  const inputArea = document.createElement('div');
  inputArea.style.flexGrow = '1';
  inputArea.style.display = 'none'; // Start hidden
  inputArea.style.flexDirection = 'column';
  inputArea.style.gap = '10px';

  // Add click handler to main button
  button.addEventListener('click', () => {
    // Toggle visibility
    inputArea.style.display = inputArea.style.display === 'none' ? 'flex' : 'none';
    
    // If showing, set up the appropriate UI
    if (inputArea.style.display === 'flex') {
      // Clear existing content
      inputArea.innerHTML = '';
      
      if (localStorage.getItem('geminiApiKey')) {
        // If API key exists, show question UI
        createQuestionUI(inputArea);
      } else {
        // If no API key, show API key input
        const apiKeyContainer = document.createElement('div');
        apiKeyContainer.style.display = 'flex';
        apiKeyContainer.style.gap = '10px';
        
        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'password';
        apiKeyInput.placeholder = 'Enter Gemini API Key';
        apiKeyInput.style.flexGrow = '1';
        apiKeyInput.style.padding = '8px';
        
        const saveKeyButton = document.createElement('button');
        saveKeyButton.textContent = 'Save Key';
        saveKeyButton.style.cssText = `
          background: #34a853;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        
        saveKeyButton.onclick = () => {
          if (apiKeyInput.value.trim()) {
            localStorage.setItem('geminiApiKey', apiKeyInput.value.trim());
            apiKeyContainer.remove();
            createQuestionUI(inputArea);
          }
        };
        
        apiKeyContainer.appendChild(apiKeyInput);
        apiKeyContainer.appendChild(saveKeyButton);
        inputArea.appendChild(apiKeyContainer);
      }
    }
  });

  container.appendChild(button);
  container.appendChild(inputArea);
  return container;
}

function createQuestionUI(container) {
  // Clear existing content
  container.innerHTML = '';

  // Create input row with text area
  const inputRow = document.createElement('div');
  inputRow.style.cssText = `
    display: flex;
    gap: 10px;
    width: 100%;
    align-items: flex-start;
  `;

  // Question Input
  const questionInput = document.createElement('textarea');
  questionInput.placeholder = 'Ask your question...';
  questionInput.style.cssText = `
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
    min-height: 40px;
  `;

  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 8px;
  `;

  // Submit Button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Ask';
  submitButton.style.cssText = `
    background: #4285f4;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;

  // Microphone Button
  const micButton = document.createElement('button');
  micButton.title = 'Speak your question';
  micButton.style.cssText = `
    background: white;
    width: 40px;
    height: 40px;
    border: 2px solid #ea4335;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    padding: 0;
    margin-left: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;

  // Update micImg source with proper path handling
  const micImg = document.createElement('img');
  micImg.src = chrome.runtime.getURL('image.png');
  micImg.alt = 'Microphone';
  micImg.style.cssText = `
    width: 28px;
    height: 28px;
    object-fit: contain;
    pointer-events: none;
    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
  `;

  // Add error handling for the image
  micImg.onerror = () => {
    console.error('Failed to load microphone icon');
    micImg.style.backgroundColor = '#ea4335';
    micImg.style.padding = '4px';
    micImg.style.borderRadius = '50%';
    micImg.innerHTML = '🎤'; // Fallback emoji
  };

  // Add the image to the button
  micButton.appendChild(micImg.cloneNode(true));

  // Assemble button container
  buttonContainer.appendChild(submitButton);
  buttonContainer.appendChild(micButton);

  // Response Area
  const responseDiv = document.createElement('div');
  responseDiv.style.cssText = `
    margin-top: 10px;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: #f8f9fa;
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    font-size: 14px;
    line-height: 1.4;
    box-sizing: border-box;
  `;

  // Voice recognition setup
  let recognition = null;
  let isListening = false;

  // Check if browser supports speech recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';  // Can make this configurable

    // Handle recognition results
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      questionInput.value = transcript;
      stopVoiceRecognition();
    };

    // Handle recognition end
    recognition.onend = () => {
      stopVoiceRecognition();
    };

    // Handle recognition errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      stopVoiceRecognition();
    };

    // Toggle voice recognition
    micButton.addEventListener('click', () => {
      if (isListening) {
        stopVoiceRecognition();
      } else {
        startVoiceRecognition();
      }
    });
  } else {
    // Disable mic button if speech recognition is not supported
    micButton.disabled = true;
    micButton.title = 'Speech recognition not supported in this browser';
    micButton.style.backgroundColor = '#ccc';
    micButton.style.cursor = 'not-allowed';
  }

  function startVoiceRecognition() {
    if (recognition) {
      isListening = true;
      recognition.start();
      micButton.style.backgroundColor = '#34a853'; // Green when recording
      micButton.style.borderColor = '#34a853';
      
      // Change to recording indicator
      micButton.innerHTML = '';
      const recordingIndicator = document.createElement('div');
      recordingIndicator.style.cssText = `
        width: 18px;
        height: 18px;
        background-color: #ea4335;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.3);
      `;
      micButton.appendChild(recordingIndicator);
      
      micButton.title = 'Stop listening';
      
      // Add pulsing animation
      micButton.style.animation = 'pulse 1.5s infinite';
      
      // Create and append style for pulse animation if it doesn't exist
      if (!document.getElementById('micAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'micAnimationStyle';
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  function stopVoiceRecognition() {
    if (recognition) {
      isListening = false;
      recognition.stop();
      micButton.style.backgroundColor = 'white'; // Back to original color
      micButton.style.borderColor = '#ea4335';
      
      // Restore mic icon properly
      micButton.innerHTML = '';
      const newMicImg = micImg.cloneNode(true); // Use cloned image
      micButton.appendChild(newMicImg);
      
      micButton.title = 'Speak your question';
      micButton.style.animation = 'none';
    }
  }

  // Add output mode toggle
  const outputControls = document.createElement('div');
  outputControls.style.cssText = `
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
  `;

  const outputModeButton = document.createElement('button');
  outputModeButton.title = 'Toggle Text/Voice Output';
  outputModeButton.style.cssText = `
    background: #666;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
  `;

  // Get stored preference or default to text
  let outputMode = localStorage.getItem('responseMode') || 'text';
  const speakerIcon = '🔊';
  const textIcon = '📄';

  // Set initial button state
  outputModeButton.innerHTML = `
    <span>${outputMode === 'voice' ? speakerIcon : textIcon}</span>
    ${outputMode === 'voice' ? 'Voice' : 'Text'}
  `;

  // Add stop button to outputControls
  const stopButton = document.createElement('button');
  stopButton.textContent = '⏹️';
  stopButton.title = 'Stop playback';
  stopButton.style.cssText = `
    background: #666;
    color: white;
    padding: 6px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: ${outputMode === 'voice' ? 'block' : 'none'};
  `;

  stopButton.onclick = () => {
    if (synth) {
      synth.cancel();
    }
  };

  // Update output mode toggle to show/hide stop button
  outputModeButton.onclick = () => {
    outputMode = outputMode === 'voice' ? 'text' : 'voice';
    localStorage.setItem('responseMode', outputMode);
    outputModeButton.innerHTML = `
      <span>${outputMode === 'voice' ? speakerIcon : textIcon}</span>
      ${outputMode === 'voice' ? 'Voice' : 'Text'}
    `;
    stopButton.style.display = outputMode === 'voice' ? 'block' : 'none';
  };

  outputControls.appendChild(outputModeButton);
  outputControls.appendChild(stopButton);
  container.appendChild(outputControls);

  // Add speech synthesis functionality
  const synth = window.speechSynthesis;
  let currentUtterance = null;

  function speakText(text) {
    if (synth && outputMode === 'voice') {
      if (currentUtterance) {
        synth.cancel();
      }
      currentUtterance = new SpeechSynthesisUtterance(text);
      currentUtterance.rate = 1.0;
      currentUtterance.pitch = 1.0;
      synth.speak(currentUtterance);
    }
  }

  // Assemble elements
  inputRow.appendChild(questionInput);
  container.appendChild(inputRow);
  container.appendChild(buttonContainer);
  container.appendChild(responseDiv);

  // Submit handler
  submitButton.onclick = async () => {
    const question = questionInput.value.trim();
    if (!question) return;

    responseDiv.textContent = 'Analyzing video context...';
    
    try {
      // Get video metadata
      const metadata = getVideoMetadata();
      
      // Get video context using the more robust method
      const transcript = await fetchYouTubeTranscript();
      const currentTime = getCurrentVideoTime();
      
      const relevantTranscript = transcript.filter(entry => {
        const entryTime = parseYouTubeTime(entry.time);
        return entryTime <= currentTime;
      });

      if (relevantTranscript.length === 0) {
        responseDiv.textContent = 'Analyzing question with general knowledge...';
      } else {
        responseDiv.textContent = `Analyzing with context from ${metadata.title}...`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${localStorage.getItem('geminiApiKey')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `You are a concise educational assistant helping with YouTube video content.
              
              Video: "${metadata.title}" by ${metadata.channel}
              Current timestamp: ${formatTime(currentTime)}
              
              ${relevantTranscript.length > 0 ? 
                `===TRANSCRIPT UP TO CURRENT TIMESTAMP===\n${relevantTranscript.map(t => `[${t.time}] ${t.text}`).join('\n')}\n===END TRANSCRIPT===\n\n` : 
                'No transcript available.\n'
              }
              
              Question: ${question}
              
              Instructions:
              1. Answer the question directly and concisely, focusing only on what was asked
              2. When referencing video content, use brief quotes with timestamps
              3. If video context isn't relevant, provide a short, clear answer from general knowledge
              4. Avoid unnecessary background information unless specifically requested
              5. Use bullet points for complex explanations
              6. Keep responses brief but complete - focus on clarity over comprehensiveness`
            }]
          }]
        })
      });

      const data = await response.json();
      const responseText = data.candidates?.[0].content.parts[0].text || 'No response generated';
      responseDiv.textContent = responseText;
      speakText(responseText);
      
    } catch (error) {
      responseDiv.textContent = `Error: ${error.message}`;
      if (error.message.includes(401)) {
        localStorage.removeItem('geminiApiKey');
        location.reload();
      }
    }
  };
}

// Main function
function addAIInterface() {
  const target = document.querySelector('#below');
  if (target && !document.querySelector('[data-ai-container]')) {
    const container = createAIContainer();
    container.setAttribute('data-ai-container', 'true');
    target.insertBefore(container, target.firstChild);
  }
}

// Mutation Observer for SPA
const observer = new MutationObserver((mutations) => {
  addAIInterface();
  // Check for transcript container changes
  mutations.forEach(mutation => {
    if (mutation.target.matches('ytd-transcript-renderer')) {
      console.log('Transcript updated');
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true
});

// Initial setup
addAIInterface();

// Function to extract transcript from DOM
function getVideoTranscriptFromDOM() {
  try {
    const transcriptItems = Array.from(document.querySelectorAll('ytd-transcript-segment-renderer'));
    return transcriptItems.map(item => {
      const timeElement = item.querySelector('#time');
      const textElement = item.querySelector('#text');
      return {
        time: timeElement ? timeElement.textContent.trim() : '0:00',
        text: textElement ? textElement.textContent.trim() : ''
      };
    }).filter(entry => entry.text.length > 0);
  } catch (error) {
    console.error('Error retrieving transcript from DOM:', error);
    return [];
  }
}

// Function to get transcript from YouTube's initial data
function getVideoTranscriptFromInitialData() {
  try {
    // Try to get transcript from YouTube's initial data
    const scriptTag = document.querySelector('script#ytInitialData');
    if (scriptTag) {
      const data = JSON.parse(scriptTag.textContent);
      const segments = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents
        ?.find(c => c.videoSecondaryInfoRenderer)
        ?.videoSecondaryInfoRenderer?.metadataRowContainer?.metadataRowContainerRenderer?.rows
        ?.find(r => r.metadataRowRenderer?.title?.simpleText === 'Transcript')
        ?.metadataRowRenderer?.contents[0]
        ?.expandableMetadataRenderer?.content?.transcriptContentRenderer?.content
        ?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments;

      if (segments) {
        return segments.map(segment => ({
          time: segment.transcriptSegmentRenderer?.startTimeText?.simpleText || '0:00',
          text: segment.transcriptSegmentRenderer?.snippet?.runs[0]?.text || ''
        })).filter(entry => entry.text.length > 0);
      }
    }
    return [];
  } catch (error) {
    console.error('Error retrieving transcript from initial data:', error);
    return [];
  }
}

// Add a function to fetch transcripts directly from YouTube API
async function fetchYouTubeTranscript() {
  try {
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (!videoId) {
      console.log('No video ID found');
      return [];
    }
    
    // Method 1: Try direct transcript API first (most reliable)
    try {
      console.log('Trying direct API method...');
      const transcriptTrackUrl = `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`;
      
      const response = await fetch(transcriptTrackUrl);
      if (response.ok && response.status === 200) {
        const xmlText = await response.text();
        if (xmlText && xmlText.length > 0) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          const textElements = xmlDoc.getElementsByTagName('text');
          
          if (textElements && textElements.length > 0) {
            console.log(`Found ${textElements.length} transcript segments via API`);
            const transcript = Array.from(textElements).map(text => ({
              time: formatTime(parseFloat(text.getAttribute('start') || 0)),
              duration: parseFloat(text.getAttribute('dur') || '0'),
              text: text.textContent.trim()
            })).filter(entry => entry.text.length > 0);
            
            if (transcript.length > 0) {
              return transcript;
            }
          }
        }
      }
      console.log('API method failed or returned empty transcript');
    } catch (apiError) {
      console.error('Error using direct API method:', apiError);
    }
    
    // Method 2: Try YouTube's internal data if API fails
    try {
      console.log('Trying initial data method...');
      const initialDataTranscript = getVideoTranscriptFromInitialData();
      if (initialDataTranscript.length > 0) {
        console.log(`Found ${initialDataTranscript.length} transcript segments via initial data`);
        return initialDataTranscript;
      }
      console.log('Initial data method failed or returned empty transcript');
    } catch (dataError) {
      console.error('Error using initial data method:', dataError);
    }
    
    // Method 3: Last resort - DOM method
    try {
      console.log('Trying DOM scraping method...');
      const domTranscript = getVideoTranscriptFromDOM();
      if (domTranscript.length > 0) {
        console.log(`Found ${domTranscript.length} transcript segments via DOM scraping`);
        return domTranscript;
      }
      console.log('DOM method failed or returned empty transcript');
    } catch (domError) {
      console.error('Error using DOM method:', domError);
    }
    
    // If all methods fail
    console.warn('All transcript extraction methods failed');
    return [];
    
  } catch (error) {
    console.error('General error fetching transcript:', error);
    return [];
  }
}

// Extract video metadata for better context
function getVideoMetadata() {
  try {
    const titleElement = document.querySelector('h1.ytd-watch-metadata');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    const channelElement = document.querySelector('#channel-name a');
    const channel = channelElement ? channelElement.textContent.trim() : '';
    
    // Get topic/category if available
    const categoryElement = document.querySelector('meta[itemprop="genre"]');
    const category = categoryElement ? categoryElement.getAttribute('content') : '';

    // Get video ID
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v') || '';
    
    return {
      title,
      channel,
      category,
      url: window.location.href,
      videoId
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return {
      title: '',
      channel: '',
      category: '',
      url: window.location.href,
      videoId: ''
    };
  }
}

function getCurrentVideoTime() {
  const video = document.querySelector('video');
  return video ? Math.floor(video.currentTime) : 0;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Function to parse YouTube timestamp
function parseYouTubeTime(timeString) {
  try {
    const parts = timeString.split(':').reverse();
    return parts.reduce((acc, part, index) => {
      return acc + parseInt(part, 10) * Math.pow(60, index);
    }, 0);
  } catch (error) {
    console.error('Error parsing time:', error, timeString);
    return 0;
  }
}

// This replaces the submit handler implementation inside createQuestionUI
function createSubmitHandler(questionInput, responseDiv, speakText) {
  return async function() {
    const question = questionInput.value.trim();
    if (!question) return;

    responseDiv.textContent = 'Analyzing video context...';
    
    try {
      // Get video metadata
      const metadata = getVideoMetadata();
      
      // Get video context using the more robust method
      const transcript = await fetchYouTubeTranscript();
      const currentTime = getCurrentVideoTime();
      
      const relevantTranscript = transcript.filter(entry => {
        const entryTime = parseYouTubeTime(entry.time);
        return entryTime <= currentTime;
      });

      if (relevantTranscript.length === 0) {
        responseDiv.textContent = 'Analyzing question with general knowledge...';
      } else {
        responseDiv.textContent = `Analyzing with context from ${metadata.title || 'this video'}...`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${localStorage.getItem('geminiApiKey')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `You are a concise educational assistant helping with YouTube video content.
              
              Video: "${metadata.title}" by ${metadata.channel}
              Current timestamp: ${formatTime(currentTime)}
              
              ${relevantTranscript.length > 0 ? 
                `===TRANSCRIPT UP TO CURRENT TIMESTAMP===\n${relevantTranscript.map(t => `[${t.time}] ${t.text}`).join('\n')}\n===END TRANSCRIPT===\n\n` : 
                'No transcript available.\n'
              }
              
              Question: ${question}
              
              Instructions:
              1. Answer the question directly and concisely, focusing only on what was asked
              2. When referencing video content, use brief quotes with timestamps
              3. If video context isn't relevant, provide a short, clear answer from general knowledge
              4. Avoid unnecessary background information unless specifically requested
              5. Use bullet points for complex explanations
              6. Keep responses brief but complete - focus on clarity over comprehensiveness`
            }]
          }]
        })
      });

      const data = await response.json();
      const responseText = data.candidates?.[0].content.parts[0].text || 'No response generated';
      responseDiv.textContent = responseText;
      speakText(responseText);
      
    } catch (error) {
      responseDiv.textContent = `Error: ${error.message}`;
      if (error.message.includes(401)) {
        localStorage.removeItem('geminiApiKey');
        location.reload();
      }
    }
  };
}

// Add this to the createQuestionUI function after all UI elements are created
function updateCreateQuestionUI(createQuestionUI) {
  return function(container) {
    // Call the original function first
    const result = createQuestionUI(container);
    
    // Find the elements we need to update
    const submitButton = container.querySelector('button:not([title*="Speak"]):not([title*="Toggle"])');
    const questionInput = container.querySelector('textarea');
    const responseDiv = container.querySelector('div[style*="overflow-y: auto"]');
    
    // Get the speakText function from the original scope
    const synth = window.speechSynthesis;
    const outputModeToggle = container.querySelector('button[title*="Toggle"]');
    const outputModeText = outputModeToggle ? outputModeToggle.textContent : '';
    const outputMode = outputModeText.includes('Voice') ? 'voice' : 'text';
    
    let currentUtterance = null;
    
    function speakText(text) {
      if (synth && outputMode === 'voice') {
        if (currentUtterance) {
          synth.cancel();
        }
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 1.0;
        currentUtterance.pitch = 1.0;
        synth.speak(currentUtterance);
      }
    }
    
    // Create a new submit handler
    if (submitButton && questionInput && responseDiv) {
      const newSubmitHandler = createSubmitHandler(questionInput, responseDiv, speakText);
      submitButton.onclick = newSubmitHandler;
    }
    
    return result;
  };
}

// IMPORTANT: Create function pointers first to avoid reference errors
const enhancedCreateQuestionUI = updateCreateQuestionUI(createQuestionUI);
export { enhancedCreateQuestionUI as createQuestionUI }; 