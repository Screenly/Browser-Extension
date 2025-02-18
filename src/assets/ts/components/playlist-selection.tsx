import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPlaylists, setSelectedPlaylist } from '@/features/popup-slice';

export const PlaylistSelection: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const playlists = useSelector((state: RootState) => state.popup.playlists);
    const selectedPlaylistId = useSelector((state: RootState) => state.popup.selectedPlaylistId);

    useEffect(() => {
        dispatch(fetchPlaylists());
    }, [dispatch]);

    return (
        <>
            <label className="form-label">Playlist Selection</label>
            <p>Select the playlist you want to add this asset to.</p>
            <select
                className="form-select shadow-none"
                id="playlist-selection"
                value={selectedPlaylistId}
                onChange={(e) => dispatch(setSelectedPlaylist(e.target.value))}
            >
                {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                        {playlist.title}
                    </option>
                ))}
            </select>
        </>
    );
};
