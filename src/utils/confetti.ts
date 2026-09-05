import confetti from 'canvas-confetti';

export const triggerSproutConfetti = () => {
  // Sprout palette confetti: soft mint, peachy pink, sky blue, cream gold
  const colors = ['#B8E6D5', '#FFD3BA', '#A8D8EA', '#FCD34D', '#10B981'];

  // Left burst
  confetti({
    particleCount: 40,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors: colors,
  });

  // Right burst
  confetti({
    particleCount: 40,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors: colors,
  });
};

export const triggerConfetti = triggerSproutConfetti;

export const triggerAchievementConfetti = () => {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#B8E6D5', '#FFD3BA', '#A8D8EA', '#FEE2E2', '#34D399'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 60,
      origin: { x: 0.2, y: 0.6 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 60,
      origin: { x: 0.8, y: 0.6 },
      colors: colors,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};
