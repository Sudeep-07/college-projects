// Global Audio object and state
let currentSong = new Audio();
let currentlyPlayingElement = null;
let currentSongIndex = -1; // Tracks the index of the current song in the playlist

// Function to convert seconds to minutes and seconds
const secondsToMinutesSeconds = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    } 

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
};

// Fetch songs from the server
const getSongs = async () => {
    const response = await fetch("./songs");
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    return Array.from(doc.querySelectorAll("a"))
        .filter(a => a.href.endsWith(".mp3"))
        .map(a => {
            const [name, artist] = decodeURIComponent(a.href.split("/songs/")[1])
                .replace(".mp3", "")
                .replace(/_/g, " ") // Remove underscores from song names
                .split(" - ")
                .map(item => item.trim());
            return { name: name || "Unknown Song", artist: artist || null, url: a.href.split("/songs/")[1] };
        });
};

// Update UI for play/pause button
const updateUI = (element, track = "") => {
    // Reset play buttons and update the current one
    document.querySelectorAll(".playnow img").forEach(img => (img.src = "play.svg"));
    document.querySelector("#play").src = currentSong.paused ? "play.svg" : "pause.svg";

    if (!currentSong.paused) {
        element.querySelector(".playnow img").src = "pause.svg";

        // Decode the track name and remove the file extension
        const decodedTrack = decodeURIComponent(track).replace(".mp3", "").replace(/_/g, " ");
        document.querySelector(".songinfo").textContent = decodedTrack;

        document.querySelector(".songtime").textContent = "00:00 / 00:00";
    }
};

// Play a song by index
const playSongByIndex = (songs, index) => {
    if (index >= 0 && index < songs.length) {
        const song = songs[index];
        currentSong.src = `./songs/${song.url}`;
        currentSong.play();
        currentSongIndex = index;

        // Update currently playing element
        const songList = document.querySelector(".songList ul");
        currentlyPlayingElement = songList.children[index];

        // Update UI
        updateUI(currentlyPlayingElement, song.url);
    }
};

// Toggle song playback
const togglePlayback = (song, element) => {
    if (currentlyPlayingElement === element) {
        currentSong.paused ? currentSong.play() : currentSong.pause();
    } else {
        currentSong.src = `./songs/${song.url}`;
        currentSong.play();
        currentlyPlayingElement = element;
        currentSongIndex = Array.from(element.parentNode.children).indexOf(element); // Update index
    }
    updateUI(element, song.url);
};

// Initialize playlist and events
const main = async () => {
    const songs = await getSongs();
    const songList = document.querySelector(".songList ul");

    songs.forEach(song => {
        const li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" width="34" src="music.svg" alt="">
            <div class="info">
                <div>${song.name}</div>
                <div>${song.artist || ""}</div> <!-- Display artist only if available -->
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="play.svg" alt="" class="invert">
            </div>
        `;
        li.addEventListener("click", () => togglePlayback(song, li));
        songList.appendChild(li);
    });

    // Load the first song by default but do not auto-play
    if (songs.length > 0) {
        currentSongIndex = 0;
        currentlyPlayingElement = songList.children[0];
        currentSong.src = `./songs/${songs[currentSongIndex].url}`;
        updateUI(currentlyPlayingElement, songs[currentSongIndex].url); // Ensure play button shows correctly
        document.querySelector("#play").src = "play.svg"; // Show play button initially
    }

    // Global play/pause button
    const playButton = document.querySelector("#play");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "pause.svg"; // Change button to pause icon
        } else {
            currentSong.pause();
            playButton.src = "play.svg"; // Change button to play icon
        }
        updateUI(currentlyPlayingElement, currentSong.src.split("/songs/")[1]);
    });

    // Time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}
        /${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar interaction
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Previous Song
    document.querySelector("#prevsong").addEventListener("click", () => {
        if (currentSongIndex > 0) {
            playSongByIndex(songs, currentSongIndex - 1);
        }
    });

    // Next Song
    document.querySelector("#nextsong").addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            playSongByIndex(songs, currentSongIndex + 1);
        }
    });

    // Volume range and keyboard sync
    const volumeInput = document.querySelector(".range input");
    volumeInput.addEventListener("input", (e) => {
        const volume = e.target.value / 100;
        currentSong.volume = volume;
    });

    // Update volume slider when volume changes from keyboard
    currentSong.addEventListener("volumechange", () => {
        volumeInput.value = currentSong.volume * 100;
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
};

// Call main function on page load
main();
