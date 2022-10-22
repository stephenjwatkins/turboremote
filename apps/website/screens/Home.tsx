import { CopyButton } from "../components/CopyButton";
import { Logo } from "../components/Logo";
import { Text } from "../components/Text";
import { Video } from "../components/Video";
import { VStack } from "../components/VStack";
import {
  container,
  logoBox,
  video,
  videoBoxBlack,
  videoBoxWhite,
  videoBoxWhiteBorder,
  videoWhite,
} from "../styles/Home.css";

export const HomeScreen = () => {
  return (
    <div className={container}>
      <VStack gap={72} alignItems="center">
        <div className={logoBox}>
          <Logo />
        </div>
        <VStack gap={36}>
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
        <div>
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
        <div>
          <Text style="body">
            Made with ❤️ in South Carolina.
            <br />
            To reach us, send an email to{" "}
            <a href="mailto:hello@turboremote.org">hello@turboremote.org</a>.
          </Text>
        </div>
      </VStack>
    </div>
  );
};
