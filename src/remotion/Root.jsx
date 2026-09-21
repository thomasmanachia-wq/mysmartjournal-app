import { Composition } from "remotion";
import { TradeAuditShort } from "./TradeAuditShort.jsx";
import { SplitAutopsy } from "./compositions/SplitAutopsy.jsx";
import { ColdMathSimulator } from "./compositions/ColdMathSimulator.jsx";
import scripts from "./data/scripts.json";

export const RemotionRoot = () => {
  return (
    <>
      {/* Cold Math Simulator: Monte Carlo & Ruin Probability (15s / 450 frames @ 30fps) */}
      <Composition
        id="ColdMathSimulator"
        component={ColdMathSimulator}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          hook: {
            text: "Stop risking 1% per trade on Prop Firms.",
            strikeThroughColor: "#DC2626",
            sfx: "marker_slash_sub_drop.mp3",
          },
          mathExecution: {
            text: "5% Daily limit. 5 consecutive losses = Game Over.",
            stepsToRuin: 5,
            sfx: "fast_negative_chimes.wav",
          },
          probabilityFlex: {
            text: "A 5-loss streak is statistically inevitable.",
            monteCarloLines: 100,
            failureRateText: "85% FAILURE RATE",
            sfx: "cyber_data_crunch.mp3",
          },
          productSolution: {
            text: "Calculate your true survival rate. Link in bio.",
            uiMockup: "monte_carlo_survival_99.png",
            sfx: "tech_success_cut.wav",
          },
        }}
      />

      {/* Immersive Split-Screen Trading Autopsy Composition (15s / 450 frames @ 30fps) */}
      <Composition
        id="SplitAutopsy"
        component={SplitAutopsy}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          tradePair: "EUR/USD",
          timeframe: "15m",
          pnl: "-$2,450.00",
          aiScore: 24,
          leakBadge: "TILT WARNING · CRITICAL COGNITIVE LEAK",
          leakTitle: "LATE CHASE INTO RESISTANCE",
          surgicalExplanation: "Entered 18 pips after breakout candle. 0 confirmation. Pure emotional FOMO.",
          fixBadge: "INSTITUTIONAL FIX",
          fixRule: "Wait for pullback into Fair Value Gap (FVG). Do not execute at market high.",
          ctaText: "Audit your next trade free → mysmartjournal.app",
        }}
      />

      {/* Default TradeAuditShort Composition */}
      <Composition
        id="TradeAuditShort"
        component={TradeAuditShort}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={scripts[0]}
      />

      {/* Dynamic Compositions generated from scripts.json */}
      {scripts.map((script) => (
        <Composition
          key={script.id}
          id={script.id}
          component={TradeAuditShort}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={script}
        />
      ))}
    </>
  );
};

