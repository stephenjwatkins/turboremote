import { Logo } from "../components/Logo";
import { Text } from "../components/Text";
import { useLogin } from "../hooks/useLogin";
import {
  container,
  content,
  footer,
  logoBox,
  textBox,
} from "../styles/Login.css";

export const LoginScreen = () => {
  const loginState = useLogin();
  return (
    <div className={container}>
      <div className={content}>
        <div className={textBox}>
          <p>
            <Text style="title">
              {loginState === "initial" || loginState === "pending" ? (
                <>Signing in</>
              ) : loginState === "error" ? (
                <>Login expired</>
              ) : (
                <>Signed in</>
              )}
            </Text>
          </p>
          <p>
            <Text style="body">
              {loginState === "initial" || loginState === "pending" ? (
                <>One moment as we sign you in.</>
              ) : loginState === "error" ? (
                <>
                  Try logging in again. If the problem continues, contact us at{" "}
                  <a href="mailto:hello@turboremote.org">
                    hello@turboremote.org
                  </a>
                  .
                </>
              ) : (
                <>Return to the terminal window to continue.</>
              )}
            </Text>
          </p>
        </div>
      </div>
      <div className={footer}>
        <div className={logoBox}>
          <Logo />
        </div>
      </div>
    </div>
  );
};
