// A generated silent WAV for playback tests; no third-party recording.
export function audioFixture() {
  const rate = 8000,
    bytes = rate * 120 * 2;
  const buffer = Buffer.alloc(44 + bytes);
  buffer.write('RIFF');
  buffer.writeUInt32LE(36 + bytes, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(bytes, 40);
  return { name: 'test.wav', mimeType: 'audio/wav', buffer };
}

