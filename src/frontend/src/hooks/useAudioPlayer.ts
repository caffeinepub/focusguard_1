import { useState, useRef, useEffect } from 'react';
import { saveAudioFile, getAudioFile, deleteAudioFile, listPlaylistFiles, initDB } from '../utils/audioStorage';

type MusicCategory = 'lofi' | 'instrumental' | 'white-noise' | 'nature-sounds' | 'soft-classical' | string;

interface Track {
  name: string;
  url: string;
}

interface CustomPlaylist {
  id: string;
  name: string;
  tracks: Track[];
}

const musicLibrary: Record<string, Track[]> = {
  'lofi': [
    { name: 'Lofi Study Beat 1', url: '/assets/music/lofi/track1.mp3' },
    { name: 'Lofi Study Beat 2', url: '/assets/music/lofi/track2.mp3' },
  ],
  'instrumental': [
    { name: 'Piano Focus', url: '/assets/music/instrumental/track1.mp3' },
    { name: 'Guitar Ambient', url: '/assets/music/instrumental/track2.mp3' },
  ],
  'white-noise': [
    { name: 'White Noise', url: '/assets/music/white-noise/track1.mp3' },
    { name: 'Pink Noise', url: '/assets/music/white-noise/track2.mp3' },
  ],
  'nature-sounds': [
    { name: 'Rain Sounds', url: '/assets/music/nature-sounds/track1.mp3' },
    { name: 'Forest Ambience', url: '/assets/music/nature-sounds/track2.mp3' },
  ],
  'soft-classical': [
    { name: 'Classical Piano', url: '/assets/music/soft-classical/track1.mp3' },
    { name: 'String Quartet', url: '/assets/music/soft-classical/track2.mp3' },
  ],
};

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('focusguard-music-volume');
    return saved ? parseInt(saved) : 50;
  });
  const [category, setCategory] = useState<MusicCategory>('lofi');
  const [loopMode, setLoopMode] = useState(() => {
    const saved = localStorage.getItem('focusguard-music-loop');
    return saved === 'true';
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>([]);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize IndexedDB and load custom playlists
  useEffect(() => {
    initDB().then(() => {
      loadCustomPlaylists();
    });
  }, []);

  const loadCustomPlaylists = () => {
    const saved = localStorage.getItem('focusguard-custom-playlists');
    if (saved) {
      try {
        const playlists = JSON.parse(saved);
        setCustomPlaylists(playlists);
      } catch (e) {
        console.error('Failed to load custom playlists:', e);
      }
    }
  };

  const saveCustomPlaylists = (playlists: CustomPlaylist[]) => {
    localStorage.setItem('focusguard-custom-playlists', JSON.stringify(playlists));
    setCustomPlaylists(playlists);
  };

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    // Handle track end
    const handleEnded = () => {
      if (loopMode) {
        const tracks = getCurrentTracks();
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        setCurrentTrackIndex(nextIndex);
      } else {
        setIsPlaying(false);
        setIsAutoPlayEnabled(false);
      }
    };
    
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    localStorage.setItem('focusguard-music-volume', volume.toString());
  }, [volume]);

  // Update loop mode
  useEffect(() => {
    localStorage.setItem('focusguard-music-loop', loopMode.toString());
  }, [loopMode]);

  const getCurrentTracks = (): Track[] => {
    const playlist = customPlaylists.find(p => p.id === category);
    if (playlist) {
      return playlist.tracks;
    }
    return musicLibrary[category] || [];
  };

  // Update track when category or index changes
  useEffect(() => {
    if (audioRef.current) {
      const tracks = getCurrentTracks();
      if (tracks.length === 0) {
        setIsPlaying(false);
        return;
      }
      const track = tracks[currentTrackIndex];
      audioRef.current.src = track.url;
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Failed to play audio:', e));
      }
    }
  }, [category, currentTrackIndex]);

  const play = () => {
    if (audioRef.current) {
      const tracks = getCurrentTracks();
      if (tracks.length === 0) {
        alert('This playlist is empty. Please add tracks first.');
        return;
      }
      audioRef.current.play().catch(e => console.error('Failed to play audio:', e));
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playAuto = () => {
    setIsAutoPlayEnabled(true);
    play();
  };

  const stopAuto = () => {
    setIsAutoPlayEnabled(false);
    pause();
  };

  const toggleLoop = () => {
    setLoopMode(!loopMode);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleCategoryChange = (newCategory: MusicCategory) => {
    setCategory(newCategory);
    setCurrentTrackIndex(0);
  };

  const importAudioFiles = async (files: File[]) => {
    // Find or create "My Music" playlist
    let myMusicPlaylist = customPlaylists.find(p => p.id === 'my-music');
    
    if (!myMusicPlaylist) {
      myMusicPlaylist = {
        id: 'my-music',
        name: 'My Music',
        tracks: [],
      };
    }

    const newTracks: Track[] = [];

    for (const file of files) {
      try {
        // Save to IndexedDB
        const fileId = await saveAudioFile(file, 'my-music');
        
        // Create blob URL for playback
        const blobUrl = URL.createObjectURL(file);
        
        newTracks.push({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: blobUrl,
        });

        // Store the mapping of fileId to blobUrl for later retrieval
        localStorage.setItem(`audio-blob-${fileId}`, blobUrl);
      } catch (error) {
        console.error('Failed to import file:', file.name, error);
      }
    }

    myMusicPlaylist.tracks.push(...newTracks);

    const updatedPlaylists = customPlaylists.filter(p => p.id !== 'my-music');
    updatedPlaylists.push(myMusicPlaylist);
    
    saveCustomPlaylists(updatedPlaylists);
    
    // Switch to the playlist
    setCategory('my-music');
  };

  const createPlaylist = (name: string) => {
    const id = `playlist-${Date.now()}`;
    const newPlaylist: CustomPlaylist = {
      id,
      name,
      tracks: [],
    };
    
    const updatedPlaylists = [...customPlaylists, newPlaylist];
    saveCustomPlaylists(updatedPlaylists);
    setCategory(id);
  };

  const deletePlaylist = (playlistId: string) => {
    const updatedPlaylists = customPlaylists.filter(p => p.id !== playlistId);
    saveCustomPlaylists(updatedPlaylists);
    
    if (category === playlistId) {
      setCategory('lofi');
    }
  };

  const removeTrackFromPlaylist = (playlistId: string, trackIndex: number) => {
    const updatedPlaylists = customPlaylists.map(p => {
      if (p.id === playlistId) {
        const newTracks = [...p.tracks];
        newTracks.splice(trackIndex, 1);
        return { ...p, tracks: newTracks };
      }
      return p;
    });
    saveCustomPlaylists(updatedPlaylists);
  };

  return {
    isPlaying,
    volume,
    category,
    loopMode,
    isAutoPlayEnabled,
    customPlaylists,
    currentTrack: getCurrentTracks()[currentTrackIndex],
    play,
    pause,
    playAuto,
    stopAuto,
    setVolume: handleVolumeChange,
    setCategory: handleCategoryChange,
    toggleLoop,
    importAudioFiles,
    createPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
  };
}
