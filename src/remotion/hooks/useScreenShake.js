/**
 * useScreenShake - High-fidelity physics-based concussive trauma trigger for Remotion.
 * Simulates an instantaneous mechanical impact and underdamped harmonic oscillation.
 *
 * @param {number} frame - Current composition frame
 * @param {number} triggerFrame - Frame where the trauma/stop-loss hit occurs (default: 42)
 * @param {number} durationFrames - Total duration of the decaying tremor (default: 16 frames ~ 0.5s)
 * @param {number} intensity - Peak displacement in pixels (default: 26px)
 * @returns {{ x: number, y: number, rotation: number, redFlash: number, shockBlur: number, scalePunch: number }}
 */
export const useScreenShake = (
  frame,
  triggerFrame = 42,
  durationFrames = 16,
  intensity = 26
) => {
  if (frame < triggerFrame || frame > triggerFrame + durationFrames) {
    return {
      x: 0,
      y: 0,
      rotation: 0,
      redFlash: 0,
      shockBlur: 0,
      scalePunch: 1,
    };
  }

  const t = frame - triggerFrame; // 0, 1, 2, ...
  const progress = t / durationFrames; // 0.0 -> 1.0

  // Underdamped Exponential Decay Envelope: e^(-3.8 * progress)
  const envelope = Math.exp(-progress * 4.2);

  // High-frequency non-linear oscillation frequencies (radians/frame)
  // Differing frequencies on X and Y prevent predictable diagonal shaking
  const freqX = 2.85;
  const freqY = 3.65;
  const freqRot = 2.15;

  // Chaotic multi-harmonic displacement
  const x =
    (Math.sin(t * freqX) * 0.75 + Math.sin(t * freqX * 1.8 + 0.4) * 0.25) *
    intensity *
    envelope;

  const y =
    (Math.cos(t * freqY + 0.5) * 0.7 + Math.cos(t * freqY * 1.6 - 0.3) * 0.3) *
    (intensity * 0.85) *
    envelope;

  // Angular rotational torque (degrees) - peak at ~1.4 degrees on impact
  const rotation =
    Math.sin(t * freqRot + 1.1) * 1.35 * envelope;

  // Concussive Red Flash (decays steeply in 4-5 frames)
  const redFlash = Math.max(0, Math.exp(-t * 0.75) * 0.42);

  // Micro Optic Distortion / Motion Blur Spike (sharp drop over first 3 frames)
  const shockBlur = Math.max(0, Math.exp(-t * 1.1) * 2.5);

  // Instant microscopic camera inward recoil punch (e.g. 1.02 -> 1.0)
  const scalePunch = 1 + Math.max(0, Math.exp(-t * 0.8) * 0.024);

  return {
    x,
    y,
    rotation,
    redFlash,
    shockBlur,
    scalePunch,
  };
};
