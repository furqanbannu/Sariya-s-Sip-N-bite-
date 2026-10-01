import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain,
  Flame,
  Music,
  Sparkles,
  Sliders,
} from 'lucide-react';

export type AmbientTrack = 'rain' | 'fireplace';

interface TrackMeta {
  id: AmbientTrack;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TRACKS: TrackMeta[] = [
  {
    id: 'rain',
    title: 'Mountain Rain',
    subtitle: 'Highland Pine & Terrace Patter (2,291m)',
    icon: CloudRain,
    description: 'Gentle mountain rain falling on cedar pine needles and glass terrace railings',
  },
  {
    id: 'fireplace',
    title: 'Cozy Fireplace',
    subtitle: 'Lucky Kabana Cedar Hearth',
    icon: Flame,
    description: 'Warm glowing stone hearth with crackling deodar cedar logs and glowing embers',
  },
];

export const AmbientSoundController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<AmbientTrack>('rain');
  const [volume, setVolume] = useState(0.4); // 0.0 to 1.0
  const [isMuted, setIsMuted] = useState(false);

  // Web Audio API references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const trackNodesRef = useRef<{
    stop: () => void;
  } | null>(null);

  // Equalizer visual animation frame
  const [eqLevels, setEqLevels] = useState<number[]>([15, 30, 20, 45, 25]);

  // Animate visual equalizer bars when playing
  useEffect(() => {
    if (!isPlaying) {
      setEqLevels([8, 8, 8, 8, 8]);
      return;
    }

    const interval = setInterval(() => {
      setEqLevels([
        Math.floor(15 + Math.random() * 55),
        Math.floor(25 + Math.random() * 65),
        Math.floor(35 + Math.random() * 60),
        Math.floor(20 + Math.random() * 70),
        Math.floor(15 + Math.random() * 50),
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Initialize or get Web Audio Context
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }
    return audioCtxRef.current;
  };

  // Build Mountain Rain Synthesizer
  const startRainSound = (ctx: AudioContext, destination: GainNode) => {
    // 1. Continuous pink noise for steady mountain rain patter
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    // Filters for atmospheric mountain pine mist rain
    const lowPass = ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.setValueAtTime(1100, ctx.currentTime);

    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.setValueAtTime(140, ctx.currentTime);

    // Subtle LFO for gentle wind/rain swell
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow swell
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.15, ctx.currentTime);
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.65, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(rainGain.gain);

    rainSource.connect(highPass);
    highPass.connect(lowPass);
    lowPass.connect(rainGain);
    rainGain.connect(destination);

    rainSource.start();
    lfo.start();

    // 2. Randomized droplet patter (water drops on stone & leaves)
    let dropletTimer: number | null = null;
    const playDroplet = () => {
      if (ctx.state === 'closed') return;
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const dropFilter = ctx.createBiquadFilter();

      const freq = 1200 + Math.random() * 1800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.04);

      dropFilter.type = 'bandpass';
      dropFilter.frequency.setValueAtTime(freq, ctx.currentTime);
      dropFilter.Q.setValueAtTime(8, ctx.currentTime);

      dropGain.gain.setValueAtTime(0.001, ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.06 + Math.random() * 0.07, ctx.currentTime + 0.005);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06);

      const nextDelay = 80 + Math.random() * 220;
      dropletTimer = window.setTimeout(playDroplet, nextDelay);
    };

    playDroplet();

    return {
      stop: () => {
        try {
          if (dropletTimer) clearTimeout(dropletTimer);
          rainSource.stop();
          lfo.stop();
          rainSource.disconnect();
          lfo.disconnect();
        } catch {
          // ignore
        }
      },
    };
  };

  // Build Cozy Fireplace Synthesizer
  const startFireplaceSound = (ctx: AudioContext, destination: GainNode) => {
    // 1. Deep warm roar of the hearth (low-frequency brown noise)
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 1.4; // boost warmth
    }

    const roarSource = ctx.createBufferSource();
    roarSource.buffer = noiseBuffer;
    roarSource.loop = true;

    const roarFilter = ctx.createBiquadFilter();
    roarFilter.type = 'lowpass';
    roarFilter.frequency.setValueAtTime(320, ctx.currentTime);

    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.7, ctx.currentTime);

    roarSource.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(destination);

    roarSource.start();

    // 2. Cedar wood crackles, pops, and snaps
    let crackleTimer: number | null = null;
    const playCrackle = () => {
      if (ctx.state === 'closed') return;
      const isBigPop = Math.random() < 0.25;

      const clickBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
      const clickData = clickBuffer.getChannelData(0);
      for (let i = 0; i < clickData.length; i++) {
        clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
      }

      const clickSource = ctx.createBufferSource();
      clickSource.buffer = clickBuffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(
        isBigPop ? 1600 + Math.random() * 800 : 2500 + Math.random() * 2000,
        ctx.currentTime
      );
      clickFilter.Q.setValueAtTime(isBigPop ? 4 : 8, ctx.currentTime);

      const clickGain = ctx.createGain();
      const popVolume = isBigPop ? 0.35 + Math.random() * 0.25 : 0.08 + Math.random() * 0.12;
      clickGain.gain.setValueAtTime(popVolume, ctx.currentTime);

      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(destination);

      clickSource.start(ctx.currentTime);

      // Random scheduling for natural sporadic crackles
      const nextDelay = isBigPop ? 150 + Math.random() * 400 : 40 + Math.random() * 180;
      crackleTimer = window.setTimeout(playCrackle, nextDelay);
    };

    playCrackle();

    return {
      stop: () => {
        try {
          if (crackleTimer) clearTimeout(crackleTimer);
          roarSource.stop();
          roarSource.disconnect();
        } catch {
          // ignore
        }
      },
    };
  };

  // Start sound for selected track
  const playSound = (track: AmbientTrack) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (trackNodesRef.current) {
      trackNodesRef.current.stop();
      trackNodesRef.current = null;
    }

    if (!masterGainRef.current) return;

    if (track === 'rain') {
      trackNodesRef.current = startRainSound(ctx, masterGainRef.current);
    } else {
      trackNodesRef.current = startFireplaceSound(ctx, masterGainRef.current);
    }
  };

  // Toggle playback
  const handleTogglePlay = () => {
    if (isPlaying) {
      if (trackNodesRef.current) {
        trackNodesRef.current.stop();
        trackNodesRef.current = null;
      }
      setIsPlaying(false);
    } else {
      playSound(activeTrack);
      setIsPlaying(true);
    }
  };

  // Switch track
  const handleSwitchTrack = (newTrack: AmbientTrack) => {
    setActiveTrack(newTrack);
    if (isPlaying) {
      playSound(newTrack);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (isMuted && newVal > 0) {
      setIsMuted(false);
    }
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(newVal, audioCtxRef.current.currentTime, 0.05);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        nextMuted ? 0 : volume,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackNodesRef.current) {
        trackNodesRef.current.stop();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const currentMeta = TRACKS.find((t) => t.id === activeTrack) || TRACKS[0];
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="w-full bg-[#0c0e13] border border-[#1f2330] p-4 sm:p-5 relative overflow-hidden my-6">
      {/* Subtle Ambient Glow */}
      <div
        className="absolute top-0 right-0 w-64 h-32 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{
          backgroundColor: activeTrack === 'fireplace' ? '#e07a38' : '#60a5fa',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Atmosphere Information & Equalizer Animation */}
        <div className="flex items-center gap-3.5">
          {/* Play/Pause Luxury Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-none flex items-center justify-center transition-all shrink-0 ${
              isPlaying
                ? activeTrack === 'fireplace'
                  ? 'bg-[#e07a38] text-[#0e0f12] shadow-[0_0_18px_rgba(224,122,56,0.45)]'
                  : 'bg-[#c5a880] text-[#0e0f12] shadow-[0_0_18px_rgba(197,168,128,0.45)]'
                : 'bg-[#151822] text-[#c5a880] border border-[#2c3244] hover:border-[#c5a880]'
            }`}
            aria-label={isPlaying ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Title & Track Details */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a880] font-semibold flex items-center gap-1">
                <Music className="w-3 h-3" />
                Hotel Atmosphere Soundscape
              </span>

              {/* Live Audio Equalizer Waves */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3.5 px-1.5 py-0.5 bg-[#141722] border border-[#272c3d]">
                  {eqLevels.map((lvl, idx) => (
                    <span
                      key={idx}
                      className={`w-1 transition-all duration-100 ${
                        activeTrack === 'fireplace' ? 'bg-[#f97316]' : 'bg-[#c5a880]'
                      }`}
                      style={{ height: `${lvl}%` }}
                    />
                  ))}
                </div>
              )}
            </div>

            <h4 className="font-display text-base sm:text-lg text-[#f3ede4] leading-tight flex items-center gap-2 mt-0.5">
              <span>{currentMeta.title}</span>
              <span className="text-xs text-[#8a857b] font-normal font-sans hidden sm:inline">
                · {currentMeta.subtitle}
              </span>
            </h4>
            <p className="text-[11px] text-[#8a857b] max-w-md hidden sm:block mt-0.5">
              {currentMeta.description}
            </p>
          </div>
        </div>

        {/* Right: Sound Selector & Volume Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Track Switcher (Zero-Pill Discipline) */}
          <div className="flex items-center bg-[#13151e] border border-[#242938]">
            {TRACKS.map((t) => {
              const isSelected = activeTrack === t.id;
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSwitchTrack(t.id)}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? t.id === 'fireplace'
                        ? 'bg-[#3d1f14] text-[#f97316] font-semibold border-b-2 border-[#f97316]'
                        : 'bg-[#1e2533] text-[#c5a880] font-semibold border-b-2 border-[#c5a880]'
                      : 'text-[#8a857b] hover:text-[#ede8e1]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{t.title}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-[#13151e] border border-[#242938] px-2.5 py-1.5">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-[#8a857b] hover:text-[#ede8e1] transition-colors p-0.5"
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-[#c96a6a]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#c5a880]" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              aria-label="Atmosphere Audio Volume"
              className="w-16 sm:w-20 h-1 bg-[#222738] rounded-none accent-[#c5a880] cursor-pointer"
            />

            <span className="text-[10px] font-mono text-[#8a857b] tabular-nums w-7 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
