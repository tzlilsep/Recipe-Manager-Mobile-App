using Amazon;
using Amazon.CognitoIdentity;
using Amazon.DynamoDBv2;
using Amazon.Runtime;
using TS.AWS.Auth;

namespace TS.AWS.Factories
{
    // Builds a DynamoDB client using a Cognito Identity Pool and a User Pool IdToken.
    public static class AwsClientsFactory
    {
        public static IAmazonDynamoDB CreateDynamoDbFromIdToken(string idToken)
        {
            var region = RegionEndpoint.GetBySystemName(AwsAuthConfig.Region);
            var creds = new CognitoAWSCredentials(AwsAuthConfig.IdentityPoolId, region);
            creds.AddLogin(AwsAuthConfig.LoginProvider, idToken);
            return new AmazonDynamoDBClient(creds, region);
        }
    }
}
