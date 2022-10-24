import { ReactNode } from "react";
import {
  container,
  highlight,
  highlightBody,
  highlightDescription,
  highlightHeadline,
  highlightPrice,
  highlightRow,
  includesPoint,
  includesPoints,
  includesPointsBox,
  includesText,
} from "../styles/PricingBlock.css";
import { Text } from "./Text";
import { VStack } from "./VStack";

export const PricingBlock = () => {
  return (
    <VStack gap={64} className={container}>
      <VStack gap={12}>
        <div>
          <Text style="title">Pay-as-you-go Pricing</Text>
        </div>
        <div>
          <Text style="headline">
            Pay only for what you use. No upfront commitment or monthly plans.
          </Text>
        </div>
      </VStack>
      <div className={highlightRow}>
        <div>
          <Highlight
            headline={<>Free to start</>}
            price={<>$0</>}
            description={<>up to 10GB of downloads</>}
          />
        </div>
        <div>
          <Highlight
            headline={<>Then</>}
            price={<>$0.50</>}
            description={<>per GB of downloads</>}
          />
        </div>
      </div>
      <VStack gap={20}>
        <div className={includesText}>Pay-as-you-go includes</div>
        <div className={includesPointsBox}>
          <ul className={includesPoints}>
            <li className={includesPoint}>Unlimited uploads</li>
            <li className={includesPoint}>14 days of artifact storage</li>
          </ul>
        </div>
      </VStack>
    </VStack>
  );
};

const Highlight = ({
  headline,
  price,
  description,
}: {
  headline: ReactNode;
  price: ReactNode;
  description: ReactNode;
}) => (
  <div className={highlight}>
    <div className={highlightHeadline}>{headline}</div>
    <div className={highlightBody}>
      <span className={highlightPrice}>{price}</span>
      <span className={highlightDescription}> {description}</span>
    </div>
  </div>
);
