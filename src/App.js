/**
 * ! Be sure to add your credentials to `aws-exports.js` for testing!
 */

import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Amplify, Auth } from "aws-amplify";
import React, { useState } from "react";
import awsExports from "./aws-exports";
import "./styles.css";

Amplify.configure(awsExports);

export default function App() {
  const [tokens, setTokens] = useState([]);

  function clearTokens() {
    setTokens([]);
  }

  function handleSubmits() {
    [...document.forms].forEach((form) => {
      const event = new CustomEvent("submit", {
        bubbles: true,
        cancelable: true
      });

      form.dispatchEvent(event);
    });
  }

  function handleSignIn(index) {
    return async function handleEvent(event) {
      event.preventDefault();

      const data = new FormData(event.target);

      try {
        console.info("Signing in as", data.get("username"));

        const result = await Auth.signIn(
          data.get("username"),
          data.get("password")
        );

        if (!result.signInUserSession) {
          return alert(
            "Sign in failed. Either MFA is enabled or credentials are incorrect"
          );
        }

        const { jwtToken } = result.signInUserSession.accessToken;

        setTokens((previous) => {
          previous[index] = jwtToken;

          return [...previous];
        });
      } catch (error) {
        console.error(error);
      }
    };
  }

  return (
    <div className="App">
      <h1>
        <a href="https://github.com/aws-amplify/amplify-js/issues/7161">
          Auth.signIn request at the same time generate same jwt token with
          different accounts
        </a>
      </h1>
      <p>
        This tests the resulting <code>jwtToken</code> with multiple signins.
      </p>

      <ol>
        <li>
          <form onSubmit={handleSignIn(0)}>
            <input name="username" placeholder="Username #1" />
            <input name="password" type="password" placeholder="Password #1" />
            <button>Sign In</button>
          </form>
        </li>
        <li>
          <textarea
            cols="120"
            rows="9"
            readOnly
            value={tokens[0] || "First token"}
          />
        </li>
        <li>
          <form onSubmit={handleSignIn(1)}>
            <input name="username" placeholder="Username #2" />
            <input name="password" type="password" placeholder="Password #2" />
            <button>Sign In</button>
          </form>
        </li>
        <li>
          <textarea
            cols="120"
            rows="9"
            readOnly
            value={tokens[1] || "Second token"}
          />
        </li>
        <li>These should be different values when signed in individually.</li>
        <li>
          <button onClick={clearTokens}>Clear tokens</button>
        </li>
        <li>
          They should be different when signed in{" "}
          <button onClick={handleSubmits}>simultaneously</button>, but{" "}
          <strong>the issue is they are not</strong>.
        </li>
      </ol>

      <hr />

      <h2>Use this to create or debug logins:</h2>

      <AmplifyAuthenticator>
        <AmplifySignOut />
      </AmplifyAuthenticator>
    </div>
  );
}
