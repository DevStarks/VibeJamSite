/**
 * Music Synthesizer Module
 * Handles Tone.js synth setup, chord progressions, and music playback
 */

const musicSynth = (function() {
    // Private variables
    let musicToggle;
    let musicPlaying = false;
    let synth, filter, delay, reverb;
    let arpeggiator;
    let currentChord = 0;
    let currentNote = 0;
    
    // Define the chords (moving in thirds)
    const arpChords = {
        // C Major 9
        cMaj9: ["C3", "E3", "G3", "B3", "D4"],
        // Eb Major 9 (minor third up from C)
        ebMaj9: ["Eb3", "G3", "Bb3", "D4", "F4"],
        // F Major 9
        fMaj9: ["F3", "A3", "C4", "E4", "G4"],
        // Fmin with added 9th
        fMin9: ["F3", "Ab3", "C4", "Eb4", "G4"]
    };
    
    // Create the sequence array
    const chordSequence = [
        arpChords.cMaj9,
        arpChords.ebMaj9,
        arpChords.fMaj9,
        arpChords.fMin9
    ];

    // Private methods
    function setupSynth() {
        // Initialize Tone.js with more refined settings
        synth = new Tone.PolySynth(Tone.Synth).toDestination();
        
        // Add effects for a cleaner retro sound with more shimmer and enhanced reverb
        filter = new Tone.Filter(3000, "lowpass").toDestination();
        delay = new Tone.FeedbackDelay("16n", 0.3).connect(filter);
        
        // Enhanced reverb with longer decay and slightly higher wet level for more spaciousness
        reverb = new Tone.Reverb({
            decay: 2.5,     // Longer decay time
            wet: 0.4,       // Higher wet level for more pronounced effect
            preDelay: 0.02  // Small pre-delay for clarity
        }).connect(delay);
        
        synth.connect(reverb);
        
        // Set synth properties for a brighter 8-bit sound
        synth.set({
            oscillator: {
                type: "pulse", // pulse wave for a cleaner sound than square
                width: 0.2     // narrower pulse width for brighter tone
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 0.25  // Slightly longer release to blend with reverb
            }
        });
        
        // Adjust overall volume
        synth.volume.value = -18;
    }
    
    function setupArpeggiator() {
        // Create a moderately paced arpeggiator with 8th notes
        arpeggiator = new Tone.Loop((time) => {
            const note = chordSequence[currentChord][currentNote];
            synth.triggerAttackRelease(note, "16n", time, 0.6);
            
            // Move to next note in the chord
            currentNote = (currentNote + 1) % chordSequence[currentChord].length;
            
            // Move to next chord when we've played all notes in current chord
            if (currentNote === 0) {
                // Move to next chord in sequence
                currentChord = (currentChord + 1) % chordSequence.length;
            }
        }, "8n"); // Slower tempo with 8th notes
    }
    
    function setupMusicToggle() {
        musicToggle = document.getElementById('musicToggle');
        
        // Check if user has a saved music preference
        if (storageManager.getMusicPreference() === 'on') {
            startMusic();
        }
        
        // Start/stop music when the button is clicked
        musicToggle.addEventListener('click', function() {
            if (musicPlaying) {
                stopMusic();
            } else {
                startMusic();
            }
        });
    }
    
    function startMusic() {
        // Starting audio context on user interaction to comply with browser policies
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        
        // Set a more moderate tempo
        Tone.Transport.bpm.value = 130;
        Tone.Transport.start();
        arpeggiator.start(0);
        
        musicPlaying = true;
        document.body.classList.add('music-on');
        storageManager.setMusicPreference('on');
    }
    
    function stopMusic() {
        arpeggiator.stop();
        
        musicPlaying = false;
        document.body.classList.remove('music-on');
        storageManager.setMusicPreference('off');
    }
    
    // Public API
    return {
        init: function() {
            setupSynth();
            setupArpeggiator();
            setupMusicToggle();
            console.log('Music synthesizer initialized');
        },
        
        // Expose methods to allow external control if needed
        start: startMusic,
        stop: stopMusic,
        
        // Getter for music status
        isPlaying: function() {
            return musicPlaying;
        }
    };
})(); 