// Audio processing service using Web Audio API

export class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = null;
    this.source = null;
    this.audioElement = null;
  }

  async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  async loadAudioFile(file) {
    if (!this.audioContext) {
      await this.initialize();
    }

    // Disconnect previous source if exists
    if (this.source) {
      this.source.disconnect();
    }

    // Create audio element
    this.audioElement = new Audio();
    const url = URL.createObjectURL(file);
    this.audioElement.src = url;
    this.audioElement.crossOrigin = 'anonymous';

    // Create media element source
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    
    // Connect nodes: source -> analyser -> destination
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    return this.audioElement;
  }

  async loadMicrophone() {
    if (!this.audioContext) {
      await this.initialize();
    }

    try {
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      // Disconnect previous source if exists
      if (this.source) {
        this.source.disconnect();
      }

      // Create media stream source
      this.source = this.audioContext.createMediaStreamSource(stream);
      
      // Connect nodes
      this.source.connect(this.analyser);

      return stream;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      throw new Error('Microphone access denied. Please allow microphone access to use this feature.');
    }
  }

  getFrequencyData() {
    if (!this.analyser) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getTimeDomainData() {
    if (!this.analyser) return null;
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  getAverageFrequency() {
    const data = this.getFrequencyData();
    if (!data) return 0;
    
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
  }

  getBassFrequency() {
    const data = this.getFrequencyData();
    if (!data) return 0;
    
    // Get bass frequencies (first 10% of spectrum)
    const bassEnd = Math.floor(data.length * 0.1);
    const bassData = data.slice(0, bassEnd);
    const sum = bassData.reduce((a, b) => a + b, 0);
    return sum / bassData.length;
  }

  getMidFrequency() {
    const data = this.getFrequencyData();
    if (!data) return 0;
    
    // Get mid frequencies (middle 40% of spectrum)
    const midStart = Math.floor(data.length * 0.3);
    const midEnd = Math.floor(data.length * 0.7);
    const midData = data.slice(midStart, midEnd);
    const sum = midData.reduce((a, b) => a + b, 0);
    return sum / midData.length;
  }

  getTrebleFrequency() {
    const data = this.getFrequencyData();
    if (!data) return 0;
    
    // Get treble frequencies (last 20% of spectrum)
    const trebleStart = Math.floor(data.length * 0.8);
    const trebleData = data.slice(trebleStart);
    const sum = trebleData.reduce((a, b) => a + b, 0);
    return sum / trebleData.length;
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  disconnect() {
    if (this.source) {
      this.source.disconnect();
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
  }

  destroy() {
    this.disconnect();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export default AudioProcessor;
