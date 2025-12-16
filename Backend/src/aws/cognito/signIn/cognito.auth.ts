// Backend\src\aws\cognito\cognito.auth.ts

import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../cognito.client";
import { AwsAuthConfig } from "../awsAuthConfig";
import { getJwtClaim } from "../jwt";
import type { SignInResult } from "../../../engine/auth/auth.types";

export async function cognitoSignIn(username: string, password: string): Promise<SignInResult> {
  try {
    const cmd = new InitiateAuthCommand({
      ClientId: AwsAuthConfig.clientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const resp = await cognitoClient.send(cmd);
    const idToken = resp.AuthenticationResult?.IdToken;

    if (!idToken || !idToken.trim()) {
      return { ok: false, error: "Missing id_token." };
    }

    const userId = getJwtClaim(idToken, "sub");
    if (!userId || !userId.trim()) {
      return { ok: false, error: "UserId (sub) not found in token." };
    }

    return { ok: true, userId, idToken };
  } catch (e: any) {

    const name = e?.name || e?.Code;

    if (name === "NotAuthorizedException") {
      return { ok: false, error: "Invalid username or password." };
    }
    if (name === "UserNotConfirmedException") {
      return { ok: false, error: "User not confirmed." };
    }

    return { ok: false, error: e?.message || "Authentication error." };
  }
}
