// Global Audio object and state
let currentSong = new Audio();
let currentlyPlayingElement = null;

// Function to convert seconds to minutes and seconds
const secondsToMinutesSeconds = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
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

// Toggle song playback
const togglePlayback = (song, element) => {
    if (currentlyPlayingElement === element) {
        currentSong.paused ? currentSong.play() : currentSong.pause();
    } else {
        currentSong.src = `./songs/${song.url}`;
        currentSong.play();
        currentlyPlayingElement = element;
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

    // Load and set the first song in the playlist, set it to paused initially
    if (songs.length > 0) {
        const firstSong = songs[0];
        currentSong.src = `./songs/${firstSong.url}`;  // Set the first song as the source
        currentSong.pause();  // Ensure the song is paused initially
        updateUI(songList.querySelector("li"), firstSong.url);  // Update the playbar with the first song's details

        // Set the first song's details to the playbar on page load
        document.querySelector(".songinfo").textContent = firstSong.name + 
            (firstSong.artist ? ` - ${firstSong.artist}` : ""); // Display artist only if available
        document.querySelector(".songtime").textContent = "00:00 / 00:00";
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

    // Listen for timeupdate event to update the song duration
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}
        /${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }); 

    // Add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
};

// Call main function on page load
main();
