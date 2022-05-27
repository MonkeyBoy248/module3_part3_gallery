export const getUnsplashPictures =  {
  handler: 'api/unsplash/handler.getPicturesByAKeyWord',
  timeout: 30,
  memorySize: 128,
  events: [
    {
      httpApi: {
        path: '/unsplash/pictures',
        method: 'get',
        authorizer: {
          name: 'httpApiJwtAuthorizer'
        },
      },
    },
  ],
};

export const uploadFavoritePictures =  {
  handler: 'api/unsplash/handler.uploadFavoritePictures',
  timeout: 30,
  memorySize: 128,
  events: [
    {
      httpApi: {
        path: '/unsplash/favorites',
        method: 'post',
        authorizer: {
          name: 'httpApiJwtAuthorizer'
        },
      },
    },
  ],
};

