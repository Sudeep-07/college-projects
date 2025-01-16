
// Global Audio object and state
let currentSong = new Audio();
let currentlyPlayingElement = null;
let currentSongIndex = -1;
let songs = []; // Store songs

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

// Fetch songs from the server and strip folder names from the song path
const getSongs = async (folder = '') => {
    const response = await fetch(`./songs/${folder}`);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    return Array.from(doc.querySelectorAll("a"))
        .filter(a => a.href.endsWith(".mp3"))
        .map(a => {
            // Extract song name and artist from the file path (remove folder names)
            const songPath = a.href.split("/songs/")[1];
            const [name, artist] = decodeURIComponent(songPath)
                .replace(".mp3", "")
                .replace(/_/g, " ") // Replace underscores with spaces
                .split(" - ") // Split by hyphen to get name and artist
                .map(item => item.trim());

            return { name: name || "Unknown Song", artist: artist || "", url: songPath };
        });
};

// Update UI for play/pause button
const updateUI = (element, track = "") => {
    // Reset play buttons and update the current one
    document.querySelectorAll(".playnow img").forEach(img => (img.src = "./img/play.svg"));
    document.querySelector("#play").src = currentSong.paused ? "./img/play.svg" : "./img/pause.svg";

    if (!currentSong.paused) {
        element.querySelector(".playnow img").src = "./img/pause.svg";

        // Decode the track name and remove the file extension
        const decodedTrack = decodeURIComponent(track).replace(".mp3", "").replace(/_/g, " ");
        document.querySelector(".songinfo").textContent = decodedTrack;

        document.querySelector(".songtime").textContent = "00:00 / 00:00";
    }
};

// Play a song by index
const playSongByIndex = (index) => {
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
    const cardElements = document.querySelectorAll(".card");
    const songList = document.querySelector(".songList ul");

    // Add event listeners for each card
    cardElements.forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.getAttribute("data-folder"); // Get folder name from the card's data attribute
            songs = await getSongs(folder); // Get songs from folder

            // Clear existing songs
            songList.innerHTML = '';

            songs.forEach(song => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <img class="invert" width="34" src="./img/music.svg" alt="">
                    <div class="info">
                        <div>${song.name}</div>
                        <div>${song.artist}</div> <!-- Display artist only if available -->
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img src="./img/play.svg" alt="" class="invert">
                    </div>
                `;
                li.addEventListener("click", () => togglePlayback(song, li));
                songList.appendChild(li);
            });

            // Reset to the first song when a new folder is selected
            if (songs.length > 0) {
                currentSongIndex = 0;
                currentlyPlayingElement = songList.children[0];
                currentSong.src = `./songs/${songs[currentSongIndex].url}`;
                updateUI(currentlyPlayingElement, songs[currentSongIndex].url); // Ensure play button shows correctly
                document.querySelector("#play").src = "./img/play.svg"; // Show play button initially
            }
        });
    });

    // Global play/pause button
    const playButton = document.querySelector("#play");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "./img/pause.svg"; // Change button to pause icon
        } else {
            currentSong.pause();
            playButton.src = "./img/play.svg"; // Change button to play icon
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
            playSongByIndex(currentSongIndex - 1);
        }
    });

    // Next Song
    document.querySelector("#nextsong").addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            playSongByIndex(currentSongIndex + 1);
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

    // Handle song ended
    currentSong.addEventListener("ended", () => {
        if (currentSongIndex < songs.length - 1) {
            playSongByIndex(currentSongIndex + 1); // Play the next song
        } else {
            // If the last song ends, reset to the first song and stop playback
            currentSongIndex = 0;
            playButton.src = "./img/play.svg";
            currentSong.pause();
            currentSong.src = `./songs/${songs[currentSongIndex].url}`;
            updateUI(songList.children[currentSongIndex], songs[currentSongIndex].url);
        }
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        const volumeIcon = e.target;
    
        // Check if the current icon is volume or mute based on the image's 'src' (using relative comparison)
        if (volumeIcon.src.includes("volume.svg")) {
            volumeIcon.src = "./img/mute.svg"; // Change to mute icon
            currentSong.volume = 0; // Mute the song
            document.querySelector(".range input").value = 0; // Set the volume slider to 0
        } else {
            volumeIcon.src = "./img/volume.svg"; // Change to volume icon
            currentSong.volume = 0.2; // Set the volume to 20%
            document.querySelector(".range input").value = 20; // Set the volume slider to 20
        }
    });
    

};

// Call main function on page load
main();
