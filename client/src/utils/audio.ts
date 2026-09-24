// Audio utility for AssemblyAI Voice Agent integration
// Captures mic audio at 24kHz (or converts to 24kHz PCM16)
// Decodes incoming base64 PCM16 and streams to AudioContext

export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    // Convert 16-bit signed integer [-32768, 32767] to [-1.0, 1.0]
    float32[i] = int16Array[i] / 32768.0;
  }
  return float32;
}

export function float32ArrayToBase64Pcm16(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const uint8 = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + chunkSize)));
  }
  return window.btoa(binary);
}

export class AgentAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextPlayTime = 0;
  private isPlaying = false;

  constructor(private sampleRate: number = 24000) {}

  public init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: this.sampleRate });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playChunk(float32Data: Float32Array) {
    if (!this.audioCtx) {
      this.init();
    }
    if (!this.audioCtx || float32Data.length === 0) return;

    const buffer = this.audioCtx.createBuffer(1, float32Data.length, this.sampleRate);
    const channelData = buffer.getChannelData(0);
    channelData.set(float32Data);

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);

    const currentTime = this.audioCtx.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime;
    }

    source.start(this.nextPlayTime);
    this.nextPlayTime += buffer.duration;
    this.isPlaying = true;

    source.onended = () => {
      if (this.audioCtx && this.audioCtx.currentTime >= this.nextPlayTime - 0.05) {
        this.isPlaying = false;
      }
    };
  }

  public stop() {
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {
        // ignore
      }
      this.audioCtx = null;
    }
    this.nextPlayTime = 0;
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
