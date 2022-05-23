export const getUnsplashPictures =  {
  handler: 'api/unsplash/handler.getPicturesByAKeyWord',
  timeout: 30,
  memorySize: 128,
  events: [
    {
      httpApi: {
        path: '/unsplash/getPictures',
        method: 'get',
        authorizer: {
          name: 'httpApiJwtAuthorizer'
        },
      },
    },
  ],
};

