"use strict";
// Backend\src\aws\cognito\cognito.auth.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.cognitoSignIn = cognitoSignIn;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const cognito_client_1 = require("../cognito.client");
const awsAuthConfig_1 = require("../awsAuthConfig");
const jwt_1 = require("../jwt");
async function cognitoSignIn(username, password) {
    try {
        const cmd = new client_cognito_identity_provider_1.InitiateAuthCommand({
            ClientId: awsAuthConfig_1.AwsAuthConfig.clientId,
            AuthFlow: "USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        });
        const resp = await cognito_client_1.cognitoClient.send(cmd);
        const idToken = resp.AuthenticationResult?.IdToken;
        if (!idToken || !idToken.trim()) {
            return { ok: false, error: "Missing id_token." };
        }
        const userId = (0, jwt_1.getJwtClaim)(idToken, "sub");
        if (!userId || !userId.trim()) {
            return { ok: false, error: "UserId (sub) not found in token." };
        }
        return { ok: true, userId, idToken };
    }
    catch (e) {
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
