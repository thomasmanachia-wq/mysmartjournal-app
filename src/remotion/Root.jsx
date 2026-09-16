import { Composition } from "remotion";
import { TradeAuditShort } from "./TradeAuditShort.jsx";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="TradeAuditShort"
        component={TradeAuditShort}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          pair: "EUR/USD",
          direction: "LONG",
          entryPrice: "1.08450",
          stopLoss: "1.08250",
          takeProfit: "1.09090",
          rr: "1:3.2",
          overallScore: 8.4,
          disciplineScore: 9.0,
          psychologyScore: 8.5,
          executionScore: 7.8,
          mainLeak: "Late entry beyond M15 discount zone mitigation",
          mainRule: "Wait for liquidity pool sweep before market execution",
          cta: "mysmartjournal.app",
        }}
      />
    </>
  );
};
