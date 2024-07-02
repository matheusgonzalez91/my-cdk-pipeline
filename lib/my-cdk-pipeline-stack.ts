import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class MyCdkPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Criação do bucket S3 para artefatos do pipeline
    const artifactBucket = new s3.Bucket(this, 'PipelineArtifactBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Remover o bucket quando o stack for destruído
    });

    // Bucket S3 para armazenar scripts de ETL do Glue
    const glueScriptsBucket = new s3.Bucket(this, 'GlueScriptsBucket', {
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Manter o bucket quando o stack for destruído
    });

    // Role do IAM para o CodePipeline acessar o Secrets Manager
    const pipelineRole = new iam.Role(this, 'PipelineRole', {
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
    });

    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'secretsmanager:GetSecretValue',
      ],
      resources: [
        `arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:secret:AWS_GITHUB_TOKEN-*`,
      ],
    }));

    // Definir o segredo do GitHub Token
    const gitHubToken = secretsmanager.Secret.fromSecretNameV2(this, 'GitHubToken', 'AWS_GITHUB_TOKEN');
    
  }
}
