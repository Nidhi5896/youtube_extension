# YouTube AI Assistant

A Chrome extension that adds an AI assistant to YouTube videos, allowing you to ask questions about video content while watching.

![YouTube AI Assistant](image.png)

## Features

- **Context-Aware AI Responses**: Ask questions about the video you're watching and get answers based on the video content up to your current timestamp.
- **Voice Input & Output**: Speak your questions and have answers read back to you.
- **Transcript Integration**: Automatically extracts and uses video transcripts for better context.
- **Simple Interface**: Clean, non-intrusive button that appears below YouTube videos.
- **Customizable**: Toggle between text and voice output modes.

## Installation

This extension is currently in development and not yet available on the Chrome Web Store. You'll need to install it manually as an unpacked extension:

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and active

**Note**: Since this is an unpacked extension, it won't automatically update. You'll need to manually update it by downloading the latest version and repeating the installation steps.

## Setup

1. You'll need a Gemini API key to use this extension:

   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create an account or sign in
   - Navigate to the API keys section
   - Create a new API key

2. When you first click the "Ask AI Assistant" button on YouTube, you'll be prompted to enter your API key.

## Usage

1. Navigate to any YouTube video
2. Look for the "Ask AI Assistant" button below the video player
3. Click the button to open the assistant interface
4. Type your question or click the microphone icon to speak it
5. Click "Ask" to get an AI-generated response based on the video content
6. Toggle between text and voice output using the button at the bottom

## Troubleshooting

If the "Ask AI Assistant" button doesn't appear:

- Make sure the extension is enabled in Chrome
- Refresh the YouTube page
- Try navigating to a different video
- Check the console for any error messages (F12 > Console)
- Try reinstalling the extension

If you get authentication errors:

- Your API key may be invalid or expired
- Click the "Ask AI Assistant" button and enter a new API key

## Privacy

- Your API key is stored locally in your browser's localStorage
- Video content and questions are processed using Google's Gemini API
- No data is stored on our servers

## Technical Details

- Uses the Gemini 2.0 Flash model for fast, accurate responses
- Extracts video transcripts using multiple fallback methods
- Implements speech recognition for voice input
- Uses speech synthesis for voice output
- Designed to work with various YouTube layouts



## Credits

- Developed by NIDHI

