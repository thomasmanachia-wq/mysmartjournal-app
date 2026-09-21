import { Composition } from "remotion";
import { TradeAuditShort } from "./TradeAuditShort.jsx";
import { SplitAutopsy } from "./compositions/SplitAutopsy.jsx";
import scripts from "./data/scripts.json";

export const RemotionRoot = () => {
  return (
    <>
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

