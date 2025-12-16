export const AwsAuthConfig = {
  region: "eu-central-1",
  userPoolId: "eu-central-1_dT2wx55fl",
  clientId: "1tg89uidfufi7l473am7nso1uf",
  identityPoolId: "eu-central-1:2423db26-9393-4277-9105-6895d263281d",

  get loginProvider() {
    return `cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`;
  },
} as const;
