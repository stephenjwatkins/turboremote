import { ReactNode } from "react";
import { CopyButton } from "../components/CopyButton";
import { Logo } from "../components/Logo";
import { PricingBlock } from "../components/PricingBlock";
import { Text } from "../components/Text";
import { Video } from "../components/Video";
import { VStack } from "../components/VStack";
import {
  container,
  logoBox,
  pageContainer,
  video,
  videoBoxBlack,
  videoBoxWhite,
  videoBoxWhiteBorder,
  oddSection,
  evenSection,
  videoWhite,
  question as cssQuestion,
  questionQuestion,
  questionAnswer,
} from "../styles/Home.css";

export const HomeScreen = () => {
  return (
    <div className={pageContainer}>
      <VStack gap={72} alignItems="center" style={{ paddingBottom: 72 }}>
        <div className={logoBox}>
          <Logo />
        </div>
        <VStack gap={36} className={container}>
          <div>
            <Text style="headline">
              <p>
                Turboremote is a frictionless Remote Cache provider for
                Turborepo.
                <br />
                Be connected in less than a minute.
              </p>
            </Text>
          </div>
          <VStack gap={12}>
            <div>
              <CopyButton />
            </div>
            <div>
              <Text style="body">
                To get started, run the above command at the root of your
                Turborepo.
              </Text>
            </div>
          </VStack>
        </VStack>
      </VStack>
      <div className={oddSection}>
        <div className={container}>
          <div className={videoBoxBlack}>
            <Video src="/link-video-dark.mp4?v=2022102201" className={video} />
          </div>
          <div className={videoBoxWhite}>
            <Video
              src="/link-video-light.mp4?v=2022102201"
              className={videoWhite}
            />
            <div className={videoBoxWhiteBorder} />
          </div>
        </div>
      </div>
      <div className={evenSection}>
        <div className={container}>
          <PricingBlock />
        </div>
      </div>
      <div>
        <VStack gap={36} className={container} style={{ paddingTop: 72 }}>
          <div>
            <Text style="title">Questions</Text>
          </div>
          <VStack gap={24} style={{ textAlign: "left" }}>
            <Question
              question={<>Why Turboremote?</>}
              answer={
                <>
                  <p>
                    Turboremote exists as an independent Remote Cache provider
                    for Turborepo. It serves as an alternative to either hosting
                    your own solution or buying into existing ecosystems. Simply
                    connect to Turboremote and pay for what you use.
                  </p>
                </>
              }
            />
            <Question
              question={<>How do I get started?</>}
              answer={
                <>
                  <p>
                    Simply run <code>npx turboremote link</code> at the root of
                    your Turborepo project. After providing a valid email
                    address and team name, Turboremote will connect your project
                    to our remote cache. That&apos;s it! You can now run
                    Turborepo commands taking advantage of Turboremote cache.
                    You&apos;ll be setup and running in less than a minute.
                  </p>
                </>
              }
            />
            <Question
              question={<>How do I learn more?</>}
              answer={
                <>
                  <p>
                    Turboremote can be managed through the{" "}
                    <code>npx turboremote</code> CLI. You can manage your team,
                    create access tokens for CI envirnoments, and more. Run{" "}
                    <code>npx turboremote</code> at the root of your project to
                    see a list of available commands.
                  </p>
                </>
              }
            />
            <Question
              question={<>Is Turboremote secure?</>}
              answer={
                <>
                  <p>
                    Yes. Turboremote utilizes all security capabilities that
                    Turborepo provides. Turboremote uses secure connections and
                    supports artifact signing.
                  </p>
                </>
              }
            />
            <Question
              question={<>How am I billed?</>}
              answer={
                <>
                  <p>
                    You will receive an email as you approach your free monthly
                    allowance. If you exceed the allowance, you will be sent a
                    bill for excess charges. Bills must be paid within two weeks
                    to prevent disruption.
                  </p>
                </>
              }
            />
          </VStack>
        </VStack>
      </div>
      <div className={container} style={{ paddingTop: 72 }}>
        <Text style="body">
          Still have questions? Send us an email to{" "}
          <a href="mailto:hello@turboremote.org">hello@turboremote.org</a>.
          <br />
          Made with ❤️ in South Carolina.
        </Text>
      </div>
    </div>
  );
};

const Question = ({
  question,
  answer,
}: {
  question: ReactNode;
  answer: ReactNode;
}) => (
  <VStack gap={12} className={cssQuestion}>
    <div className={questionQuestion}>{question}</div>
    <div className={questionAnswer}>{answer}</div>
  </VStack>
);
