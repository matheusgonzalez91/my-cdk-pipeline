import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';

export class MyCdkPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket to store pipeline artifacts
    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket');

    // IAM role for Glue job
    const jobRole = new iam.Role(this, 'JobRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    // Glue job definition
    const glueJob = new glue.CfnJob(this, 'MyGlueJob', {
      role: jobRole.roleArn,
      command: {
        name: 'glueetl',
        scriptLocation: 's3://myprontuariobucket/results/job_prontuario.py',
      },
      defaultArguments: {
        '--job-language': 'python',
        '--additional-python-modules': 'pyspark==2.4.3',
      },
    });

    // Output the bucket name and Glue job name
    new cdk.CfnOutput(this, 'ArtifactBucketName', {
      value: artifactBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'GlueJobName', {
      value: glueJob.ref,
    });
  }
}
