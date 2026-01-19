import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioProcessor from './services/AudioProcessor';
import { BarsVisualizer, CircularVisualizer, WaveVisualizer, ParticlesVisualizer } from './components/Visualizers';

const THEMES = [
  { name: 'Purple Dream', color1: '#667eea', color2: '#764ba2' },
  { name: 'Pink Sunset', color1: '#f093fb', color2: '#f5576c' },
  { name: 'Ocean Blue', color1: '#4facfe', color2: '#00f2fe' },
  { name: 'Mint Green', color1: '#43e97b', color2: '#38f9d7' },
  { name: 'Fire Orange', color1: '#fa709a', color2: '#fee140' },
];

const VISUALIZERS = [
  { name: 'Bars', component: BarsVisualizer, icon: '📊' },
  { name: 'Circular', component: CircularVisualizer, icon: '⭕' },
  { name: 'Wave', component: WaveVisualizer, icon: '🌊' },
  { name: 'Particles', component: ParticlesVisualizer, icon: '✨' },
];

function App() {
  const [audioProcessor] = useState(() => new AudioProcessor());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [useMicrophone, setUseMicrophone] = useState(false);
  const [visualizerIndex, setVisualizerIndex] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState('');
  const audioElementRef = useRef(null);
  const fileInputRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  useEffect(() => {
    audioProcessor.initialize();

    return () => {
      audioProcessor.destroy();
    };
  }, [audioProcessor]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setUseMicrophone(false);

    try {
      const audioElement = await audioProcessor.loadAudioFile(file);
      audioElementRef.current = audioElement;
      setCurrentFile(file.name);
      audioElement.play();
      setIsPlaying(true);
      audioProcessor.resume();
    } catch (err) {
      setError('Failed to load audio file. Please try a different file.');
      console.error(err);
    }
  };

  const handleMicrophone = async () => {
    setError('');
    
    if (useMicrophone) {
      // Stop microphone
      setUseMicrophone(false);
      setIsPlaying(false);
      audioProcessor.disconnect();
    } else {
      // Start microphone
      try {
        await audioProcessor.loadMicrophone();
        setUseMicrophone(true);
        setIsPlaying(true);
        setCurrentFile(null);
        audioProcessor.resume();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
      audioProcessor.resume();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `music-visualizer-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    if (isFullscreen) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const CurrentVisualizer = VISUALIZERS[visualizerIndex].component;
  const currentTheme = THEMES[themeIndex];

  return (
    <div 
      className="relative w-screen h-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Visualizer Canvas */}
      {isPlaying && (
        <CurrentVisualizer 
          audioProcessor={audioProcessor} 
          theme={currentTheme}
        />
      )}

      {/* Welcome Screen */}
      {!isPlaying && !useMicrophone && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-2xl px-8"
          >
            <motion.h1 
              className="text-7xl font-bold text-white mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎵 Music Visualizer
            </motion.h1>
            <p className="text-2xl text-white/80 mb-12">
              Experience your music in a whole new way
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl"
              >
                📁 Upload Audio File
              </button>
              
              <button
                onClick={handleMicrophone}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-2xl"
              >
                🎤 Use Microphone
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8"
          >
            {/* Current Track Info */}
            <div className="text-center mb-6">
              <p className="text-white text-lg font-semibold">
                {currentFile || (useMicrophone ? '🎤 Live Microphone' : 'No audio')}
              </p>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {!useMicrophone && audioElementRef.current && (
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all flex items-center justify-center text-3xl"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all flex items-center justify-center text-xl"
              >
                📁
              </button>

              <button
                onClick={handleMicrophone}
                className={`w-12 h-12 rounded-full backdrop-blur-lg hover:bg-white/30 transition-all flex items-center justify-center text-xl ${
                  useMicrophone ? 'bg-red-500/50' : 'bg-white/20'
                }`}
              >
                🎤
              </button>

              <button
                onClick={takeScreenshot}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all flex items-center justify-center text-xl"
              >
                📸
              </button>

              <button
                onClick={toggleFullscreen}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all flex items-center justify-center text-xl"
              >
                {isFullscreen ? '🗗' : '⛶'}
              </button>
            </div>

            {/* Visualizer Selection */}
            <div className="flex justify-center gap-2 mb-4">
              {VISUALIZERS.map((viz, index) => (
                <button
                  key={viz.name}
                  onClick={() => setVisualizerIndex(index)}
                  className={`px-4 py-2 rounded-lg backdrop-blur-lg transition-all ${
                    visualizerIndex === index
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {viz.icon} {viz.name}
                </button>
              ))}
            </div>

            {/* Theme Selection */}
            <div className="flex justify-center gap-2">
              {THEMES.map((theme, index) => (
                <button
                  key={theme.name}
                  onClick={() => setThemeIndex(index)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    themeIndex === index ? 'scale-125 ring-4 ring-white/50' : 'hover:scale-110'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.color1}, ${theme.color2})`,
                  }}
                  title={theme.name}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar with Instructions */}
      {showControls && isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6 text-center"
        >
          <p className="text-white/60 text-sm">
            Move mouse to show controls • Press F11 for fullscreen
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default App;
