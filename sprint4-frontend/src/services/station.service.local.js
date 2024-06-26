
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { userService } from './user.service.js'


const STORAGE_KEY = 'stationDB'

export const stationService = {
    query,
    getById,
    save,
    remove,
    getEmptyStation,
    getEmptyFilterBy,
    getDefaultSort,
    addStationMsg,
    getIdxById,
    getSongById,
    calcStationDuration,
    formatAddedTime,
    _createStation,
    _createStations,
}
window.cs = stationService

async function query(filterBy = {}, sortBy = {}) {
    var stations = await storageService.query(STORAGE_KEY)

    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        stations = stations.filter(station => regex.test(station.name) || regex.test(station.artist))
    }

    if (sortBy.by) {

        if (sortBy.by === 'station') {
            stations.sort((station1, station2) => -1 * station2.name.localeCompare(station1.name))
        }

        // if (sortBy.by === 'artist') {
        //     stations.sort((artist1, artist2) => 1 * artist1.name.localeCompare(artist2.name))
        // }
    }
    return stations
}

function getById(stationId) {
    return storageService.get(STORAGE_KEY, stationId)
}

async function getIdxById(id) {
    try {
        const stations = await query()
        const idx = stations.findIndex(station => station._id === id)
        if (idx === -1) return new Error('could not find index in stations')
        return idx
    }
    catch (err) {
        console.log('could not get station idx', err)
    }
}

async function getSongById(songId) {
    const stations = await storageService.query(STORAGE_KEY)
    const song = stations.reduce((foundSong, station) => {
        if (foundSong) return foundSong
        return station.songs.find(song => song.id === songId)
    }, null)
    return song || null
}

async function remove(stationId) {
    // throw new Error('Nope')
    await storageService.remove(STORAGE_KEY, stationId)
}

async function save(station) {
    var savedStation
    if (station._id) {
        savedStation = await storageService.put(STORAGE_KEY, station)
    } else {
        // Later, owner is set by the backend
        // station.owner = userService.getLoggedinUser()
        savedStation = await storageService.post(STORAGE_KEY, station)
    }
    return savedStation
}

function calcStationDuration(songs) {
    let totalDurationInSeconds = 0;
    if (!songs.length) return;

    songs.forEach(song => {
        const [minutes, seconds] = song.duration.split(':')

        totalDurationInSeconds += parseInt(minutes, 10) * 60 + parseInt(seconds, 10)
    })

    const totalHours = Math.floor(totalDurationInSeconds / 3600)
    const remainingSeconds = totalDurationInSeconds % 3600
    const totalMinutes = Math.floor(remainingSeconds / 60)
    const totalSeconds = remainingSeconds % 60

    if (totalHours >= 1) {
        const hourText = totalHours === 1 ? "hour" : "hours";
        return `about ${totalHours} ${hourText} `;
    } else {
        return `${totalMinutes} min ${totalSeconds.toString().padStart(2, '0')} sec`
    }
}

function formatAddedTime(addedTime) {
    const diff = Date.now() - addedTime
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60))
            return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
        } else {
            return `${hours} hour${hours === 1 ? '' : 's'} ago`
        }
    } else if (days === 1) {
        return 'Yesterday'
    } else {
        return `${days} day${days === 1 ? '' : 's'} ago`
    }
}

async function addStationMsg(stationId, txt) {
    // Later, this is all done by the backend
    const station = await getById(stationId)
    if (!station.msgs) station.msgs = []

    const msg = {
        id: utilService.makeId(),
        by: userService.getLoggedinUser(),
        txt
    }
    station.msgs.push(msg)
    await storageService.put(STORAGE_KEY, station)

    return msg
}

function getEmptyStation() {
    return {
        _id: '',
        name: '',
        tags: [],
        desc: '',
        songs: [],
        likedByUsers: [],
        imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712320500/Station%20images/Misc%20images/newPlaylist_exl8fh.png',

        createdBy: {
            _id: '',
            fullname: 'Guest', // Add || LoggedIn user
            imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712605592/Guest-user_iswifs.png'
        },
        createdAt: '',
    }
}

function _createStation(name = '', desc = '', imgUrl = '', songs = [], likedByUsers = []) {
    return {
        _id: utilService.makeId(),
        name,
        tags: [],
        desc,
        songs,
        likedByUsers,
        imgUrl,
        createdBy: {
            _id: utilService.makeId(),
            fullname: 'Guest',
            imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712605592/Guest-user_iswifs.png'
        },
        createdAt: utilService.randomAddedTime()
    }
}

function _createEmptyLikedSongsStation() {
    return {
        _id: 'liked-songs',
        name: 'Liked Songs',
        tags: [],
        desc: 'Playlist of liked songs',
        songs: [],
        likedByUsers: [],
        imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712214797/Station%20images/liked-songs-300_kljhls.png',
        createdBy: {
            _id: '',
            fullname: 'Guest',
            imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712605592/Guest-user_iswifs.png'
        },
        createdAt: '',
    }
}

//DEMODATA

const sInTheEnd = {
    id: utilService.makeId(),
    title: 'In The End',
    artist: 'Linkin Park',
    album: 'Hybrid Theory',
    url: 'https://www.youtube.com/watch?v=eVTXPUF4Oz4',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712210330/Station%20images/hybridTheory_n01sbz.jpg',
    addedBy: 'Mark',
    duration: '3:36',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sMrBlueSky = {
    id: utilService.makeId(),
    title: 'Mr. Blue Sky',
    artist: 'Electric Light Orchestra',
    album: 'Out of the Blue',
    url: 'https://www.youtube.com/watch?v=wuJIqmha2Hk',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213244/Station%20images/outOfTheBlue_zgpyqa.jpg',
    addedBy: 'Mark',
    duration: '5:03',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sNowThatTheMagicHasGone = {
    id: utilService.makeId(),
    title: 'Now That the Magic Has Gone',
    artist: 'Joe Cocker',
    album: 'Night Calls',
    url: 'https://www.youtube.com/watch?v=MoiMUvOk7pA',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213243/Station%20images/nightCalls_bhryqs.jpg',
    addedBy: 'Mark',
    duration: '4:38',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sDreamOn = {
    id: utilService.makeId(),
    title: 'Dream On',
    artist: 'Aerosmith',
    album: 'Aerosmith',
    url: 'https://www.youtube.com/watch?v=89dGC8de0CA',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213231/Station%20images/aerosmith_u1kfhd.jpg',
    addedBy: 'Mark',
    duration: '4:29',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sHaveYouEverSeenTheRain = {
    id: utilService.makeId(),
    title: 'Have You Ever Seen The Rain',
    artist: 'Creedence Clearwater Revival',
    album: 'Pendulum',
    url: 'https://www.youtube.com/watch?v=bO28lB1uwp4',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213245/Station%20images/pendulum_qngzkr.jpg',
    addedBy: 'Mark',
    duration: '2:45',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sStop = {
    id: utilService.makeId(),
    title: 'Stop!',
    artist: 'Sam Brown',
    album: 'Stop!',
    url: 'https://www.youtube.com/watch?v=V4qorFKV_DI',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213249/Station%20images/stop_l49xr5.jpg',
    addedBy: 'Mark',
    duration: '4:55',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sThisLove = {
    id: utilService.makeId(),
    title: 'This Love',
    artist: 'Maroon 5',
    album: 'Songs About Jane',
    url: 'https://www.youtube.com/watch?v=XPpTgCho5ZA',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213251/Station%20images/songsAboutJane_vuisvs.jpg',
    addedBy: 'Mark',
    duration: '3:25',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sSmoothCriminal = {
    id: utilService.makeId(),
    title: 'Smooth Criminal',
    artist: 'Michael Jackson',
    album: 'Bad 25',
    url: 'https://www.youtube.com/watch?v=q8w1d01Y2vY',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213248/Station%20images/smoothCriminal_aqp0fp.jpg',
    addedBy: 'Nadav',
    duration: '4:00',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sBeatIt = {
    id: utilService.makeId(),
    title: 'Beat It',
    artist: 'Michael Jackson',
    album: 'Thriller',
    url: 'https://www.youtube.com/watch?v=WlTlUseVt7E',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213232/Station%20images/beatIt_xwjtyf.jpg',
    addedBy: 'Nadav',
    duration: '4:18',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sJohnnyBGoode = {
    id: utilService.makeId(),
    title: 'Johnny B. Goode',
    artist: 'Chuck Berry',
    album: 'Berry Is On Top',
    url: 'https://www.youtube.com/watch?v=Uf4rxCB4lys',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213233/Station%20images/berryIsOnTop_dsuhck.jpg',
    addedBy: 'Nadav',
    duration: '2:42',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sEnglishmanInNewYork = {
    id: utilService.makeId(),
    title: 'Englishman In New York',
    artist: 'Sting',
    album: '...Nothing Like the Sun',
    url: 'https://www.youtube.com/watch?v=d27gTrPPAyk',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213239/Station%20images/englishManInNewYork_imuuuy.jpg',
    addedBy: 'Nadav',
    duration: '4:27',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sSultansOfSwing = {
    id: utilService.makeId(),
    title: 'Sultans Of Swing',
    artist: 'Dire Stairs',
    album: 'Dire Stairs',
    url: 'https://www.youtube.com/watch?v=h0ffIJ7ZO4U',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213250/Station%20images/sultansOfSwing_xxaukv.jpg',
    addedBy: 'Nadav',
    duration: '4:26',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sHighwayToHell = {
    id: utilService.makeId(),
    title: 'Highway to Hell',
    artist: 'AC/DC',
    album: 'Highway to Hell',
    url: 'https://www.youtube.com/watch?v=l482T0yNkeo',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213240/Station%20images/highwayToHell_mfhfnl.jpg',
    addedBy: 'Nadav',
    duration: '3:27',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sBohemianRhapsody = {
    id: utilService.makeId(),
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213235/Station%20images/boemianRhapsody_o8lf17.jpg',
    addedBy: 'Nadav',
    duration: '5:59',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sLoseYourself = {
    id: utilService.makeId(),
    title: 'Lose Yourself',
    artist: 'Eminem',
    album: 'Curtain Call: The Hits',
    url: 'https://www.youtube.com/watch?v=_Yhyp-_hX2s',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213238/Station%20images/curtainCallTheHits_facvzm.jpg',
    addedBy: 'Haim',
    duration: '5:23',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sCalifornication = {
    id: utilService.makeId(),
    title: 'Californication',
    artist: 'Red Hot Chili Peppers',
    album: 'Californication',
    url: 'https://www.youtube.com/watch?v=YlUKcNNmywk',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213235/Station%20images/californication_bxp3ar.jpg',
    addedBy: 'Haim',
    duration: '5:21',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sHypnotize = {
    id: utilService.makeId(),
    title: 'Hypnotize',
    artist: 'The Notorious B.I.G',
    album: 'Life After Death',
    url: 'https://www.youtube.com/watch?v=eaPzCHEQExs',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213242/Station%20images/lifeAfterDeath_zwsll3.jpg',
    addedBy: 'Haim',
    duration: '3:50',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sCenturies = {
    id: utilService.makeId(),
    title: 'Centuries',
    artist: 'Fall Out Boy',
    album: 'American Beauty/American Psycho',
    url: 'https://www.youtube.com/watch?v=oPA0z4W-kcU',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213236/Station%20images/centuries_kuef65.jpg',
    addedBy: 'Haim',
    duration: '3:46',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sNumbEncore = {
    id: utilService.makeId(),
    title: 'Numb / Encore',
    artist: 'Jay Z',
    album: 'Collision Course',
    url: 'https://www.youtube.com/watch?v=sCRRRofQ4tI',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213237/Station%20images/collisionCourse_x5ox3e.jpg',
    addedBy: 'Haim',
    duration: '3:25',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sHighHopes = {
    id: utilService.makeId(),
    title: 'High Hopes',
    artist: 'Panic! At The Disco',
    album: 'Pray for the Wicked',
    url: 'https://www.youtube.com/watch?v=fH_OnJk6QqU',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213246/Station%20images/prayForTheWicked_zu7dz3.jpg',
    addedBy: 'Haim',
    duration: '3:12',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}
const sHereWithoutYou = {
    id: utilService.makeId(),
    title: 'Here Without You',
    artist: '3 Doors Down',
    album: 'Away from the Sun',
    url: 'https://www.youtube.com/watch?v=kPBzTxZQG5Q',
    imgUrl: 'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712213231/Station%20images/awayFromTheSun_diug2z.jpg',
    addedBy: 'Haim',
    duration: '3:55',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const blindingLights = {
    id: utilService.makeId(),
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    url: 'https://www.youtube.com/watch?v=fHI8X4OXluQ',
    imgUrl: 'https://example.com/img/blindinglights.jpg',
    addedBy: 'Alex',
    duration: '3:20',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const watermelonSugar = {
    id: utilService.makeId(),
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    album: 'Fine Line',
    url: 'https://www.youtube.com/watch?v=nQA97xS49LQ',
    imgUrl: 'https://example.com/img/watermelonsugar.jpg',
    addedBy: 'Jordan',
    duration: '2:54',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const goodAsHell = {
    id: utilService.makeId(),
    title: 'Good As Hell',
    artist: 'Lizzo',
    album: 'Coconut Oil',
    url: 'https://www.youtube.com/watch?v=SmbmeOgWsqE',
    imgUrl: 'https://example.com/img/goodashell.jpg',
    addedBy: 'Sam',
    duration: '2:39',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const levitating = {
    id: utilService.makeId(),
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    url: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
    imgUrl: 'https://example.com/img/levitating.jpg',
    addedBy: 'Charlie',
    duration: '3:51',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const badGuy = {
    id: utilService.makeId(),
    title: 'bad guy',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    url: 'https://www.youtube.com/watch?v=DyDfgMOUjCI',
    imgUrl: 'https://example.com/img/badguy.jpg',
    addedBy: 'Taylor',
    duration: '3:14',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const circles = {
    id: utilService.makeId(),
    title: 'Circles',
    artist: 'Post Malone',
    album: 'Hollywood\'s Bleeding',
    url: 'https://www.youtube.com/watch?v=wXhTHyIgQ_U',
    imgUrl: 'https://example.com/img/circles.jpg',
    addedBy: 'Morgan',
    duration: '3:35',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const danceMonkey = {
    id: utilService.makeId(),
    title: 'Dance Monkey',
    artist: 'Tones and I',
    album: 'The Kids Are Coming',
    url: 'https://www.youtube.com/watch?v=q0hyYWKXF0Q',
    imgUrl: 'https://example.com/img/dancemonkey.jpg',
    addedBy: 'Jamie',
    duration: '3:29',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const senorita = {
    id: utilService.makeId(),
    title: 'Señorita',
    artist: 'Shawn Mendes, Camila Cabello',
    album: 'Shawn Mendes',
    url: 'https://www.youtube.com/watch?v=Pkh8UtuejGw',
    imgUrl: 'https://example.com/img/senorita.jpg',
    addedBy: 'Casey',
    duration: '3:11',
    addedAt: utilService.randomAddedTime(),
    isLiked: false,
}

const dontStartNow = {
    id: utilService.makeId(),
    title: 'Don\'t Start Now',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    url: 'https://www.youtube.com/watch?v=oygrmJFKYZY',
    imgUrl: ''
}


function _createStations() {

    let stations = utilService.loadFromStorage(STORAGE_KEY)

    if (!stations || !stations.length) {

        stations = [

            _createStation('Our Favorites',
                "our favorite songs!",
                'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712783456/Station%20images/Misc%20images/ab67706c0000da8454c9a023b386d4afc4a8a013_sxztsd.jpg',
                [
                    sInTheEnd,
                    sMrBlueSky,
                    sNowThatTheMagicHasGone,
                    sDreamOn,
                    sHaveYouEverSeenTheRain,
                    sStop,
                    sThisLove,
                    sSmoothCriminal,
                    sBeatIt,
                    sJohnnyBGoode,
                    sEnglishmanInNewYork,
                ],
                [
                    'mark.davidovich@gmail.com',
                    'haim321@gmail.com',
                    'nadavzivyon@gmail.com'
                ],
                'Soundify',
                ['Made For You']),

            _createStation('Nostalgia mix',
                "some more of our favorites",
                'https://res.cloudinary.com/dkwwsxprt/image/upload/v1712236367/Station%20images/nostalgiaMix_lpz3zb.jpg',
                [

                    sSultansOfSwing,
                    sHighwayToHell,
                    sBohemianRhapsody,
                    sLoseYourself,
                    sCalifornication,
                    sHypnotize,
                    sCenturies,
                    sNumbEncore,
                    sHighHopes,
                    sHereWithoutYou
                ],
                [
                    'mark.davidovich@gmail.com',
                    'haim321@gmail.com',
                    'nadavzivyon@gmail.com'
                ],
                'Soundify',
                ['Made For You']),
            _createEmptyLikedSongsStation(),
        ]
    }

    utilService.saveToStorage(STORAGE_KEY, stations)

    return stations
}

_createStations()

function getEmptyFilterBy() {
    return { txt: '' }
}

function getDefaultSort() {
    return { by: '' }
}


