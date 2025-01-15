export const sampleGameData = {
  id: "shapes-adventure",
  name: "Shapes Adventure",
  levels: [
    {
      id: "intro",
      name: "Welcome to Shapes World",
      background: "../../../assets/backgrounds/sci_fi_background.jpg",
      sprites: [
        {
          id: "blue-square",
          name: "Square",
          type: "character",
          x: 100,
          y: 400,
          appearance: {
            sprite: "../../../assets/sprites/blue_square.jpg",
            size: 80,
            eyes: {
              type: "cute",
              color: "black"
            }
          }
        },
        {
          id: "blue-triangle",
          name: "Triangle",
          type: "character",
          x: 150,
          y: 400,
          appearance: {
            sprite: "../../../assets/sprites/blue_triangle.jpg",
            size: 90,
            eyes: {
              type: "cute",
              color: "black"
            }
          }
        },
        {
          id: "green-triangle",
          name: "Green",
          type: "character",
          x: 300,
          y: 400,
          appearance: {
            sprite: "../../../assets/sprites/blue_triangle.jpg",
            size: 60
          }
        }
      ],
      dialogues: [
        "Hi! Welcome to a world of shapes, Multi-shaper!",
        "I'm Square, and this is my friend Triangle. We're here to guide you through our world!",
        "We've been waiting for someone like you to join us on our adventure.",
        "In this world, shapes can transform and combine to create amazing things!",
        "See that green triangle over there? That's our friend Green. They're a bit shy...",
        "But don't worry, you'll get to know everyone here soon enough!"
      ],
      settings: {
        dialogue: {
          fontSettings: {
            baseSize: 24,
            maxCharLimit: 120
          },
          display: {
            speed: "normal",
            position: "bottom",
            autoProgress: false
          }
        },
        audio: {
          bgmVolume: 0.7,
          sfxVolume: 0.8,
          bgmTrack: "/assets/audio/cheerful-intro.mp3" // Replace with actual path to background music
        },
        cursor: {
          showAfterDelay: true,
          delayMS: 1000
        }
      }
    }
  ]
};
