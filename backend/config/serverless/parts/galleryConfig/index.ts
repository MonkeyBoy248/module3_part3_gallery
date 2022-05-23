export const getPictures =  {
  handler: 'api/gallery/handler.getPictures',
    description: 'Return object with information about the page: array of images, total pages amount, current page number',
    timeout: 30,
    memorySize: 128,
    events: [
    {
      httpApi: {
        path: '/gallery',
        method: 'get',
        authorizer: {
          name: 'httpApiJwtAuthorizer'
        },
      },
    },
  ],
};

export const uploadPicture = {
  handler: 'api/gallery/handler.uploadPicture',
    description: 'Send private upload link',
    timeout: 30,
    memorySize: 128,
    events: [
    {
      httpApi: {
        path: '/gallery/upload-picture',
        method: 'post',
        authorizer: {
          name: 'httpApiJwtAuthorizer'
        },
      },
    },
  ],
};

export const uploadDefaultPictures = {
  handler: 'api/gallery/handler.uploadDefaultPictures',
    description: 'Upload default pictures to the DB',
    timeout: 30,
    memorySize: 128,
    events: [
    {
      httpApi: {
        path: '/gallery/upload-default-pictures',
        method: 'post',
      },
    },
  ],
};