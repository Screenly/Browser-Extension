import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPlaylists, setSelectedPlaylists } from '@/features/popup-slice';

interface Playlist {
  id: string;
  title: string;
}

export const PlaylistSelection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const playlists = useSelector((state: RootState) => state.popup.playlists);
  const selectedPlaylistIds = useSelector((state: RootState) => state.popup.selectedPlaylistIds);

  useEffect(() => {
    dispatch(fetchPlaylists());
  }, [dispatch]);

  const handlePlaylistChange = (playlistId: string) => {
    const updatedSelection = selectedPlaylistIds.includes(playlistId)
      ? selectedPlaylistIds.filter((id: string) => id !== playlistId)
      : [...selectedPlaylistIds, playlistId];
    dispatch(setSelectedPlaylists(updatedSelection));
  };

  return (
    <>
      <label className="form-label">Playlist Selection</label>
      <p>Select the playlists you want to add this asset to.</p>
      <div className="playlist-checkboxes">
        {playlists.map((playlist: Playlist) => (
          <div key={playlist.id} className="form-check">
            <input
              type="checkbox"
              className="form-check-input shadow-none"
              id={`playlist-${playlist.id}`}
              checked={selectedPlaylistIds.includes(playlist.id)}
              onChange={() => handlePlaylistChange(playlist.id)}
            />
            <label
              className="form-check-label"
              htmlFor={`playlist-${playlist.id}`}
            >
              {playlist.title}
            </label>
          </div>
        ))}
      </div>
    </>
  );
};
