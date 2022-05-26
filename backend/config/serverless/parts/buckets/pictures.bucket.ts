import { AWSPartitial } from '../../types';

export const picturesBucket: AWSPartitial = {
  provider: {
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: [
              'arn:aws:s3:::${file(env.yml):${self:provider.stage}.BUCKET_NAME}',
              'arn:aws:s3:::${file(env.yml):${self:provider.stage}.BUCKET_NAME}/*',
            ],
          },
        ],
      },
    },
  },
  functions: {
    triggerS3PictureUploading: {
      handler: 'api/gallery/handler.s3Uploading',
      timeout: 40,
      memorySize: 1024,
      events: [
        {
          s3: {
            bucket: '${file(env.yml):${self:provider.stage}.BUCKET_NAME}',
            event: 's3:ObjectCreated:*',
            existing: true
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      MyBucket: {
        Type: 'AWS::S3::Bucket',

        Properties: {
          BucketName: '${file(env.yml):${self:provider.stage}.BUCKET_NAME}',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedOrigins: ['*'],
                AllowedMethods: ['PUT'],
              },
            ]
          }
        },
      },
    },
  },
};