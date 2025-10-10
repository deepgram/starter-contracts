// TTS Interface Usage Examples
// These examples show how to integrate with TTS starter apps using actual Deepgram API parameters

const BASE_URL = 'http://localhost:3000'; // Your starter app URL

// Example 1: Basic text synthesis
async function basicSynthesis() {
  const response = await fetch(`${BASE_URL}/tts/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': 'basic-synthesis-001'
    },
    body: JSON.stringify({
      text: 'Hello world, this is a basic text-to-speech test.'
    })
  });

  if (response.ok) {
    const audioBlob = await response.blob();
    // Play the audio or save to file
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }
}

// Example 2: Custom model and container format
async function customModelSynthesis() {
  const response = await fetch(`${BASE_URL}/tts/synthesize?model=aura-asteria-en&container=wav&bit_rate=44100`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': 'custom-model-002'
    },
    body: JSON.stringify({
      text: 'This text uses a custom model with WAV container format and specific bitrate.'
    })
  });

  if (response.ok) {
    const audioBuffer = await response.arrayBuffer();
    const duration = response.headers.get('X-Audio-Duration');
    console.log(`Generated audio duration: ${duration} seconds`);

    // Save as file (Node.js example)
    // const fs = require('fs');
    // fs.writeFileSync('output.wav', Buffer.from(audioBuffer));
  }
}

// Example 3: SSML markup
async function ssmlSynthesis() {
  const ssmlText = `
    <speak>
      <prosody rate="slow" pitch="low">
        This text is spoken slowly and with low pitch.
      </prosody>
      <break time="1s"/>
      <prosody rate="fast" pitch="high">
        While this part is fast and high-pitched!
      </prosody>
    </speak>
  `;

  const response = await fetch(`${BASE_URL}/tts/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': 'ssml-synthesis-003'
    },
    body: JSON.stringify({
      text: ssmlText,
      ssml: true
    })
  });

  if (response.ok) {
    const audioBlob = await response.blob();
    return audioBlob;
  }
}

// Example 4: Callback webhook integration
async function callbackSynthesis() {
  const response = await fetch(`${BASE_URL}/tts/synthesize?callback=https://my-app.com/webhook&callback_method=POST`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': 'callback-synthesis-004'
    },
    body: JSON.stringify({
      text: 'This synthesis will trigger a webhook callback when complete.'
    })
  });

  if (response.ok) {
    console.log('Synthesis started - callback will be triggered when ready');
    // In this case, response might be immediate or the actual audio might come via callback
  }
}

// Example 5: Error handling with actual error codes
async function handleErrors() {
  try {
    // Try to synthesize text that's too long
    const longText = 'A'.repeat(6000); // Exceeds typical limits

    const response = await fetch(`${BASE_URL}/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': 'error-handling-005'
      },
      body: JSON.stringify({
        text: longText
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('TTS Error:', error.error.code, '-', error.error.message);

      switch (error.error.code) {
        case 'TEXT_TOO_LONG':
          console.log('Text is too long. Consider breaking it into smaller chunks');
          break;
        case 'UNSUPPORTED_MODEL':
          console.log('The requested model is not available');
          break;
        case 'UNSUPPORTED_CONTAINER':
          console.log('The requested container format is not supported');
          break;
        case 'UNSUPPORTED_ENCODING':
          console.log('The requested encoding is not supported');
          break;
        default:
          console.log('Unknown error occurred');
      }
    }
  } catch (err) {
    console.error('Network or parsing error:', err);
  }
}

// Example 6: Multiple container format support
async function containerComparison() {
  const text = 'Comparing different container formats.';
  const containers = ['mp3', 'wav', 'ogg'];

  for (const container of containers) {
    const response = await fetch(`${BASE_URL}/tts/synthesize?container=${container}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': `container-test-${container}`
      },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      const contentType = response.headers.get('Content-Type');
      const contentLength = response.headers.get('Content-Length');

      console.log(`${container.toUpperCase()}: ${contentType}, ${contentLength} bytes`);
    }
  }
}

// Example 7: Privacy-conscious synthesis (opt out of model improvement)
async function privacySynthesis() {
  const response = await fetch(`${BASE_URL}/tts/synthesize?mip_opt_out=true&model=aura-asteria-en`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': 'privacy-synthesis-007'
    },
    body: JSON.stringify({
      text: 'This synthesis opts out of the Deepgram Model Improvement Program.'
    })
  });

  if (response.ok) {
    const audioBlob = await response.blob();
    console.log('Privacy-conscious synthesis complete');
    return audioBlob;
  }
}

// Example 8: React component integration
function TTSComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const synthesizeText = async (text) => {
    setIsPlaying(true);

    try {
      const response = await fetch(`${BASE_URL}/tts/synthesize?model=aura-asteria-en&container=mp3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': `react-component-${Date.now()}`
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        await audio.play();
      }
    } catch (error) {
      console.error('TTS synthesis failed:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => synthesizeText('Hello from React!')}
        disabled={isPlaying}
      >
        {isPlaying ? 'Playing...' : 'Synthesize Text'}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}

export {
  basicSynthesis,
  customModelSynthesis,
  ssmlSynthesis,
  callbackSynthesis,
  handleErrors,
  containerComparison,
  privacySynthesis,
  TTSComponent
};