export const signUp = {
  handler: "api/authentication/handler.signUp",
  description: "SignUp users",
  timeout: 30,
  memorySize: 128,
  events: [
    {
      httpApi: {
        path: "/auth/signup",
        method: "post"
      }
    }
  ]
};

export const logIn = {
  handler: "api/authentication/handler.logIn",
  description: "LogIn user",
  timeout: 30,
  memorySize: 128,
  events: [
    {
      httpApi: {
        path: "/auth/login",
        method: "post"
      }
    }
  ]
};

export const httpApiJwtAuthorizer = {
  handler: "api/authentication/handler.authenticate",
  description: "Authenticate user",
  timeout: 30,
  memorySize: 128
};