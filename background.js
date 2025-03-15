/* global chrome */

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'buttonClicked') {
    // Show a badge on the extension icon to draw attention
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
    
    // Clear the badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 5000);
  }
  try {
    if (request.action === 'highlightExtension') {
      console.log('Starting icon animation');
      
      let counter = 0;
      const iconPaths = {
        active: "icons/icon-active.png",
        inactive: "icons/icon-inactive.png",
        normal: "icons/icon-normal.png"
      };

      const flashInterval = setInterval(() => {
        chrome.action.setIcon({
          path: counter++ % 2 === 0 ? iconPaths.active : iconPaths.inactive
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Icon set failed:', chrome.runtime.lastError);
          }
        });

        if (counter > 6) {
          clearInterval(flashInterval);
          chrome.action.setIcon({ path: iconPaths.normal }, () => {
            console.log('Icon reset to normal');
          });
        }
      }, 500);
    }
  } catch (error) {
    console.error('Background script error:', error);
  }
}); 