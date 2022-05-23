import type { AWS } from '@serverless/typescript';
import { galleryConfig } from './config/serverless/parts/galleryConfig/gallery';
import { joinParts } from './config/serverless/utils';
import { authConfig } from "./config/serverless/parts/authConfig/auth";
import {usersTableConfig} from "./config/serverless/parts/tables/users.table";
import {picturesBucket} from "./config/serverless/parts/buckets/pictures.bucket";
import {unsplashConfig} from "./config/serverless/parts/unsplashConfig/unsplash";

const CLIENT = '${file(./env.yml):${self:provider.stage}.CLIENT}';
const SERVICE_NAME = `dev-template-sls-Kirill`;
const STAGE = '${opt:stage, "dev"}';
const REGION = '${file(./env.yml):${self:provider.stage}.REGION}';
const PROFILE = '${file(./env.yml):${self:provider.stage}.PROFILE}';

const masterConfig: AWS = {
  service: SERVICE_NAME,
  configValidationMode: 'warn',
  variablesResolutionMode: '20210326',
  unresolvedVariablesNotificationMode: 'error',
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: STAGE,
    lambdaHashingVersion: '20201221',
    // @ts-ignore
    region: REGION,
    profile: PROFILE,
    environment: {
      STAGE,
    },
    tags: {
      client: CLIENT,
    },
    logs: {
      httpApi: true,
    },
    httpApi: {
      useProviderTags: true,
      payload: '2.0',
      cors: true,
    },
  },
  package: {
    individually: true,
    patterns: ['bin/*', '.env'],
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      metafile: false,
      keepOutputDirectory: false,
      packager: 'npm',
      inject: ['loadenv.ts'],
      plugins: 'esbuild-plugins.js',
      watch: {
        pattern: ['api/**/*.ts', 'helper/**/*.ts', 'interfaces/**/*.ts', 'models/**/*.ts', 'services/**/*.ts'],
      },
    },
    prune: {
      automatic: true,
      number: 3,
    },
    envFiles: ['env.yml'],
    envEncryptionKeyId: {
      local: '${file(./kms_key.yml):local}',
      dev: '${file(./kms_key.yml):dev}',
      //test: '${file(./kms_key.yml):test}',
      //prod: '${file(./kms_key.yml):prod}',
    },
    'serverless-offline': {
      ignoreJWTSignature: true,
      httpPort: 3300,
      noPrependStageInUrl: true
    },
  },
  plugins: [
    '@redtea/serverless-env-generator',
    'serverless-esbuild',
    // 'serverless-offline-sqs',
    'serverless-offline',
    'serverless-prune-plugin',
  ],
};

module.exports = joinParts(masterConfig, [
  galleryConfig,
  authConfig,
  unsplashConfig,
  usersTableConfig,
  picturesBucket
]);
