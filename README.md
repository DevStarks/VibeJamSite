# 2025 Vibe Coding Game Jam Website

A readable retro video game themed website for the 2025 Vibe Coding Game Jam.

## Features

- Modern, readable design with retro video game aesthetics
- Retro pixel-art SVG icons for music and theme controls in the top-right corner
- Subtle CRT scan lines and screen effects that don't impair readability
- Moderately-paced arpeggiated synth music with sophisticated chord progressions
- Dark mode by default with light mode toggle
- Music can be toggled on/off with user preference saved
- Responsive design that works on all device sizes
- Balanced approach to nostalgic styling with enhanced usability
- Modular JavaScript architecture for better maintainability

## Audio Features

- Bright pulse wave synthesizer with optimized harmonics
- Advanced arpeggiated chord progressions using major and minor 9 chords
- Chords moving in major and minor thirds for harmonic complexity
- Moderate 8th note arpeggios at 130 BPM for a pleasant, less frenetic feel
- Rich reverb and spatial effects creating depth and ambience
- Audio processing chain including reverb, delay, and filtering for a spacious, immersive sound
- Music automatically saves user preference

## Visual Features

- Custom pixel-art SVG icons for controls
- Top-right corner controls for easy access
- Subtle CRT effect with minimal scanlines for better readability
- Less intense color palette that maintains a retro feel
- Improved typography with the classic "Press Start 2P" font used sparingly 
- Smooth animations and transitions
- Balanced retro styling without sacrificing usability

## Architecture

The website uses a modular JavaScript architecture for better organization and maintainability:

- **vibeJamApp.js**: Main controller module that coordinates all other modules
- **storageManager.js**: Centralizes local storage operations for user preferences
- **themeManager.js**: Handles dark/light theme switching functionality
- **musicSynth.js**: Manages Tone.js synth setup and music playback
- **uiAnimations.js**: Controls all visual effects and animations
- **script.js**: Entry point that initializes the main app

Each module follows the revealing module pattern and exposes a clean public API. This architecture makes the code more maintainable and easier to extend with new features.

### Module Dependencies

```
script.js → vibeJamApp.js → [storageManager.js, themeManager.js, musicSynth.js, uiAnimations.js]
```

## Pages

- **Home Page**: Contains all information about the jam including:
  - Title and description
  - Jury members
  - Sponsors
  - Link to submit
  - Hashtag for social media

## Getting Started

To run the site locally:

1. Clone or download this repository
2. Open the `index.html` file in your browser

That's it! No build process or server needed.

## Dependencies

- [Tone.js](https://tonejs.github.io/) - Web Audio framework for the synthesizer music
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) - Retro video game font
- [Inter](https://fonts.google.com/specimen/Inter) - Modern, highly readable font for body text

## Music Details

The site features arpeggiated chord progressions using the following structure:
- C Major 9 → Eb Major 9 → F Major 9 → F Minor 9
- Movement in major and minor thirds for harmonic variety
- Each chord includes the 9th for added richness
- 8th note patterns at 130 BPM for a moderate, flowing pace
- Enhanced reverb with 2.5s decay time for spacious, atmospheric sound

## Customization

- Colors can be modified in the `:root` section of `styles.css`
- SVG icons can be edited in the HTML file to create different pixel art designs
- Synth settings and musical patterns can be adjusted in `js/musicSynth.js`
- Content can be updated directly in `index.html`

## Browser Support

This site is compatible with:
- Chrome
- Firefox
- Safari
- Edge
- Opera

## License

Feel free to use and modify this template for your own game jam or event.