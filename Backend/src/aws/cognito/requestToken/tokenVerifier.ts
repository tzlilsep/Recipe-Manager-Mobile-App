import { CognitoJwtVerifier } from "aws-jwt-verify";
import { AwsAuthConfig } from "../awsAuthConfig";

// Verifies Cognito ID tokens: signature, expiration, issuer, audience(clientId)
export const tokenVerifier = CognitoJwtVerifier.create({
  userPoolId: AwsAuthConfig.userPoolId,
  tokenUse: "id",
  clientId: AwsAuthConfig.clientId,
});
