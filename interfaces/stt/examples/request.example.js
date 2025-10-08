// Example: How to use the STT starter app interface

import { readFile } from 'node:fs/promises';

// Example 1: Basic transcription
async function basicTranscription() {
  const audioBuffer = await readFile('./audio.wav');

  const response = await fetch('http://localhost:3000/stt:transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'audio/wav',
      'X-Request-Id': 'basic-transcription-001'
    },
    body: audioBuffer
  });

  const result = await response.json();
  console.log('Transcript:', result.transcript);
  console.log('Duration:', result.duration, 'seconds');
}

// Example 2: Transcription with diarization
async function transcriptionWithSpeakers() {
  const audioBuffer = await readFile('./meeting.wav');

  const response = await fetch('http://localhost:3000/stt:transcribe?diarize=true&punctuate=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'audio/wav',
      'X-Request-Id': 'diarization-example-001'
    },
    body: audioBuffer
  });

  const result = await response.json();
  console.log('Transcript:', result.transcript);

  // Print words with speaker information
  if (result.words) {
    result.words.forEach(word => {
      console.log(`${word.speaker}: ${word.text} [${word.start}s - ${word.end}s]`);
    });
  }
}

// Example 3: Error handling
async function handleErrors() {
  try {
    // This will trigger UNSUPPORTED_MEDIA_TYPE error
    const response = await fetch('http://localhost:3000/stt:transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': 'error-example-001'
      },
      body: JSON.stringify({ test: 'invalid' })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error.error.code, '-', error.error.message);
    }
  } catch (err) {
    console.error('Network error:', err.message);
  }
}

