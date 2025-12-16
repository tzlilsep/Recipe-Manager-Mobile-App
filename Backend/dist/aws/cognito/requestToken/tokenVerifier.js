"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenVerifier = void 0;
const aws_jwt_verify_1 = require("aws-jwt-verify");
const awsAuthConfig_1 = require("../awsAuthConfig");
// Verifies Cognito ID tokens: signature, expiration, issuer, audience(clientId)
exports.tokenVerifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
    userPoolId: awsAuthConfig_1.AwsAuthConfig.userPoolId,
    tokenUse: "id",
    clientId: awsAuthConfig_1.AwsAuthConfig.clientId,
});
