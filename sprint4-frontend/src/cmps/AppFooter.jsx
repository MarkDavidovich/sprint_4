//Use react player here
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'

import { UserMsg } from './UserMsg.jsx'
import { SongPreview } from './SongPreview.jsx'

export function AppFooter() {


    const [volume, setVolume] = useState(0.5)
    const [isMuted, setIsMuted] = useState(false)
    const [loop, setLoop] = useState(false)
    const [shuffle, setShuffle] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [isLiked, setIsLiked] = useState()


    function handleVolumeChange(ev) {
        const newVolume = parseFloat(ev.target.value)
        setVolume(newVolume)
    }


    return (
        <footer className="app-footer">

            <div className='player-song-info'>
                <SongPreview />
            </div>

            <div className='player-main-controls'>
                <button className='shuffle-btn' onClick={() => {
                    setShuffle(!shuffle)
                    console.log('shuffle:', shuffle)
                }}>shuffle
                </button>
                <button className='prev-song-btn'>{'<'}</button>
                <button className='play-btn'>play</button>
                <button className='next-song-btn'>{'>'}</button>
                <button className='loop-btn' onClick={() => {
                    setLoop(!loop)
                    console.log('loop:', loop)
                }}>loop
                </button>
            </div>

            <div className='player-extra-controls'>
                <button className='playing-view-btn'>now playing view</button>
                <button className='queue-btn'>queue</button>
                <button className='connect-device-btn'>connect to a device</button>
                {/* Check if muted to show icon (isMuted)*/}
                <button className='mute-btn'>mute</button>
                <div className="volume-bar">
                    <label htmlFor="volumeRange"></label>
                    <input
                        className="bar"
                        type="range"
                        id="volumeRange"
                        name="volumeRange"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
                <button className='mini-player-btn'>mini player</button>
                <button className='full-screen-btn'>full screen</button>
            </div>
        </footer>
    )
}