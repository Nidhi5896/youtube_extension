document.addEventListener('DOMContentLoaded', function() {
  const questionInput = document.getElementById('questionInput');
  const askButton = document.getElementById('askButton');
  const responseDiv = document.getElementById('response');

  // Check for API key when popup opens
  let apiKey = localStorage.getItem('geminiApiKey');
  if (!apiKey) {
    // Show API key input first
    questionInput.style.display = 'none';
    askButton.style.display = 'none';
    responseDiv.textContent = 'Please enter your Gemini API key to continue:';
    
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.placeholder = 'Enter your API key';
    apiKeyInput.style.cssText = `
      width: 100%;
      padding: 8px;
      margin: 10px 0;
      border: 1px solid #ccc;
      border-radius: 4px;
    `;
    
    const submitKeyButton = document.createElement('button');
    submitKeyButton.textContent = 'Save API Key';
    submitKeyButton.style.cssText = `
      background-color: #4285f4;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
    `;
    
    responseDiv.appendChild(apiKeyInput);
    responseDiv.appendChild(submitKeyButton);
    
    submitKeyButton.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      if (key) {
        localStorage.setItem('geminiApiKey', key);
        apiKey = key;
        // Show question interface
        questionInput.style.display = 'block';
        askButton.style.display = 'block';
        responseDiv.textContent = 'API key saved. You can now ask questions!';
        // Remove API key input elements
        apiKeyInput.remove();
        submitKeyButton.remove();
      }
    });
    
    return;
  }

  askButton.addEventListener('click', async () => {
    const question = questionInput.value.trim();
    
    if (!question) {
      responseDiv.textContent = 'Please enter a question';
      return;
    }

    try {
      responseDiv.textContent = 'Loading...';
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: question
            }]
          }]
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('geminiApiKey');
          responseDiv.textContent = 'Invalid API key. Please reload the popup to enter a new key.';
          return;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        responseDiv.textContent = data.candidates[0].content.parts[0].text;
      } else {
        responseDiv.textContent = 'Sorry, I couldn\'t generate a response.';
      }
    } catch (error) {
      responseDiv.textContent = 'Error: ' + error.message;
      if (error.message.includes('401')) {
        localStorage.removeItem('geminiApiKey');
      }
    }
  });
}); 