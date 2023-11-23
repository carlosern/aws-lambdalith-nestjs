import * as cdk from 'aws-cdk-lib';
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class LambdalithNestjsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'LambdalithNestjsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // LambdaNestStack in stack.ts
    const apiNestHandlerFunction = new lambda.Function(this, "ApiNestHandler", {
      code: Code.fromAsset("api/dist"), // 👈 This is crucial
      runtime: Runtime.NODEJS_18_X,
      handler: "main.handler",
      environment: {}, // 👈 You might need env variables
    });

    //An API REST
    const api = new cdk.aws_apigateway.RestApi(this, "Api", {

      deploy: true,
      defaultMethodOptions: {
        apiKeyRequired: true
      }
    });


    api.root.addProxy({
      defaultIntegration: new cdk.aws_apigateway.LambdaIntegration(apiNestHandlerFunction),
    })

    const apiKey = api.addApiKey("ApiKey");

    const usagePlan = api.addUsagePlan("UsagePlan", {
      name: "UsagePlan",
      apiStages: [
        {
          api,
          stage: api.deploymentStage
        }
      ]
    }
    );

    usagePlan.addApiKey(apiKey);

  }
}
