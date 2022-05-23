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
  // functions: {
  //   triggerS3Example: {
  //     handler: 'api/gallery/handler.uploadPictureToS3',
  //     timeout: 28,
  //     events: [
  //       {
  //         s3: {
  //           bucket: '${file(env.yml):${self:provider.stage}.BUCKET_NAME}',
  //           event: 's3:ObjectCreated:*',
  //         },
  //       },
  //     ],
  //   },
  // },
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