import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { AwsAuthConfig } from "./awsAuthConfig";

export const cognitoClient = new CognitoIdentityProviderClient({
  region: AwsAuthConfig.region,
});
