import "https://cdnjs.cloudflare.com/ajax/libs/howler/2.1.2/howler.core.min.js";

window.addEventListener("DOMContentLoaded", () => {
  new DrumPad();
});

class DrumPad {
  drumset = "lm1";
  pads = [...document.querySelectorAll("section.pads .pad")];

  constructor() {
    this.initializeSamples();
    this.addPadHooks();
    this.addKeyboardHooks();
  }

  initializeSamples() {
    this.pads.forEach((pad) => {
      pad.howl = new Howl({
        src: [`samples/${this.drumset}/${pad.dataset.sound}.wav`],
      });
    });
  }

  addPadHooks = () => {
    this.pads.forEach((pad) => {
      pad.addEventListener("mousedown", this.playSample);
      pad.addEventListener("touchstart", this.handleTouchStart);
      pad.addEventListener("touchend", this.handleTouchEnd);
    });
  };

  handleTouchStart = (event) => {
    event.preventDefault();
    const pad = event.target;
    pad.classList.add("active");
    
    const touch = event.touches[0];
    const rect = pad.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.playWithVelocity(pad, x, y);
  };

  handleTouchEnd = (event) => {
    event.preventDefault();
    const pad = event.target;
    pad.classList.remove("active");
  };

  playWithVelocity = (pad, x, y) => {
    const rect = pad.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const velocity = 1 - distance / maxDistance;

    // Handle choke groups
    const chokeGroup = pad.dataset.choke;
    if (chokeGroup) {
      this.pads.forEach(otherPad => {
        if (otherPad !== pad && otherPad.dataset.choke === chokeGroup) {
          otherPad.howl.stop();
        }
      });
    }

    pad.howl.volume(velocity);
    pad.howl.stop();
    pad.howl.play();
  };

  playSample = (event) => {
    const pad = event.target;
    this.playWithVelocity(pad, event.clientX - pad.getBoundingClientRect().left, event.clientY - pad.getBoundingClientRect().top);
  };

  addKeyboardHooks() {
    const keyToPadMap = {};
    this.pads.forEach((pad) => {
      const { dataset: { key } } = pad;
      if (!key) return;
      
      // Split keys and create mapping for each key
      key.toLowerCase().split(',').forEach(k => {
        keyToPadMap[k.trim()] = pad;
      });
    });

    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      const pad = keyToPadMap[e.key.toLowerCase()];
      if (!pad) return;

      pad.dispatchEvent(new Event("mousedown"));
      pad.classList.add("active");
    });

    window.addEventListener("keyup", (e) => {
      const pad = keyToPadMap[e.key.toLowerCase()];
      if (!pad) return;

      pad.classList.remove("active");
    });
  }
}
