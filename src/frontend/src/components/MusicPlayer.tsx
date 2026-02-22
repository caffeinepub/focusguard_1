import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, VolumeX, Volume1, Repeat, Upload, Plus, Trash2, List } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface MusicPlayerProps {
  isSessionActive: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAutoPlayChange?: (isPlaying: boolean) => void;
}

export default function MusicPlayer({ isSessionActive, isOpen, onOpenChange, onAutoPlayChange }: MusicPlayerProps) {
  const [showPlaylistCreator, setShowPlaylistCreator] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { 
    isPlaying, 
    volume, 
    category, 
    loopMode,
    currentTrack,
    customPlaylists,
    play, 
    pause, 
    setVolume, 
    setCategory,
    toggleLoop,
    importAudioFiles,
    createPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
  } = useAudioPlayer();

  useEffect(() => {
    if (onAutoPlayChange) {
      onAutoPlayChange(isPlaying);
    }
  }, [isPlaying, onAutoPlayChange]);

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 50) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || 
      /\.(mp3|wav|aac|ogg|flac)$/i.test(file.name)
    );
    
    if (audioFiles.length === 0) {
      alert('Please select valid audio files');
      return;
    }

    await importAudioFiles(audioFiles);
    e.target.value = '';
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowPlaylistCreator(false);
    }
  };

  const currentPlaylist = customPlaylists.find(p => p.id === category);
  const isCustomPlaylist = !!currentPlaylist;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col rounded-2xl">
        <DialogHeader>
          <DialogTitle>Focus Music</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lofi">Lo-fi</SelectItem>
                <SelectItem value="instrumental">Instrumental</SelectItem>
                <SelectItem value="white-noise">White Noise</SelectItem>
                <SelectItem value="nature-sounds">Nature Sounds</SelectItem>
                <SelectItem value="soft-classical">Soft Classical</SelectItem>
                {customPlaylists.length > 0 && <Separator className="my-2" />}
                {customPlaylists.map(playlist => (
                  <SelectItem key={playlist.id} value={playlist.id}>
                    {playlist.name} ({playlist.tracks.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentTrack && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium truncate">{currentTrack.name}</p>
              <p className="text-xs text-muted-foreground">Now playing</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="outline"
              onClick={isPlaying ? pause : play}
              disabled={!isSessionActive}
              className="h-10 w-10 rounded-lg transition-all duration-200 hover:scale-105"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button
              size="icon"
              variant={loopMode ? "default" : "outline"}
              onClick={toggleLoop}
              className="h-10 w-10 rounded-lg"
            >
              <Repeat className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center gap-2">
              {getVolumeIcon()}
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">{volume}%</span>
            </div>
          </div>

          {!isSessionActive && (
            <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-2">
              Start a study session to play music
            </p>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Custom Music</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPlaylistCreator(!showPlaylistCreator)}
                  className="gap-2 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById('audio-file-input')?.click()}
                  className="gap-2 rounded-lg"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>

            <input
              id="audio-file-input"
              type="file"
              accept="audio/*,.mp3,.wav,.aac,.ogg,.flac"
              multiple
              onChange={handleFileImport}
              className="hidden"
            />

            {showPlaylistCreator && (
              <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                <Input
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                  className="rounded-lg"
                />
                <Button size="sm" onClick={handleCreatePlaylist} className="rounded-lg">
                  Create
                </Button>
              </div>
            )}

            {isCustomPlaylist && currentPlaylist && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Tracks</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deletePlaylist(currentPlaylist.id)}
                    className="h-7 gap-1 text-destructive hover:text-destructive rounded-lg"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
                <ScrollArea className="h-[150px] rounded-lg border p-2">
                  {currentPlaylist.tracks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tracks yet
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {currentPlaylist.tracks.map((track, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group transition-colors duration-200"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <List className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{track.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTrackFromPlaylist(currentPlaylist.id, index)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
