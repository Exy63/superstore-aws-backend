import type { AWS } from "@serverless/typescript";

import * as functions from "@functions";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      SQS_URL:
        "https://sqs.eu-west-1.amazonaws.com/203651338148/CatalogItemsQueue",
      IMPORT_BUCKET_NAME: "superstore-import",
      BASIC_AUTHORIZER_ARN:
        "arn:aws:lambda:eu-west-1:203651338148:function:authorization-service-dev-basicAuthorizer",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "s3:ListBucket",
            Resource: "arn:aws:s3:::superstore-import",
          },
          {
            Effect: "Allow",
            Action: "s3:*",
            Resource: "arn:aws:s3:::superstore-import/*",
          },
          {
            Effect: "Allow",
            Action: "sqs:*",
            Resource: "arn:aws:sqs:eu-west-1:203651338148:CatalogItemsQueue",
          },
        ],
      },
    },
  },
  // import the function via paths
  functions,
  resources: {
    Resources: {
      AccessDeniedGwResponse: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: "ACCESS_DENIED",
          RestApiId: "f297517wl8",
        },
      },
      UnauthorizedGwResponse: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
          },
          ResponseType: "UNAUTHORIZED",
          RestApiId: "f297517wl8",
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
