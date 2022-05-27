import { CustomEventListener, ListenerRemover } from "../modules/listenersClearing.js";
import {currentUrl, logInServerUrl, signUpServerUrl} from "../modules/env.js";
import { InvalidUserDataError } from "../modules/errors.js";
import { redirectToTheGalleryPage } from "../modules/redirection.service.js";
import { TokenObject, User } from "../modules/interfaces.js";
import { Token } from "../modules/token.service.js";

const loginForm = document.forms?.namedItem('login');
const emailInput = loginForm?.elements.namedItem('email') as HTMLInputElement;
const passwordInput = loginForm?.elements.namedItem('password') as HTMLInputElement;
const loginButton = loginForm?.elements.namedItem('logIn') as HTMLButtonElement;
const submitErrorContainer = loginForm?.querySelector('.login-form__submit-error-message');
const signUpButton = loginForm?.elements.namedItem('signUp') as HTMLButtonElement;
const authenticationEventsArray: CustomEventListener[] = [
  {target: emailInput, type: 'input', handler: validateInput},
  {target: passwordInput, type: 'change', handler: validateInput},
  {target: loginButton, type: 'click', handler: logIn},
  {target: loginForm as HTMLFormElement, type: 'focusin', handler: resetErrorMessage},
  {target: signUpButton, type: 'click', handler: signUp},
];

function validateField(field: HTMLInputElement, pattern: RegExp, text: string): void {
  const targetErrorContainer = loginForm!.querySelector(`.login-form__${field.name}-error-message`) as HTMLElement;

  targetErrorContainer.textContent = '';
  loginButton.disabled = false;
  loginButton.classList.remove('_disabled')
  field.classList.remove('invalid');

  if (field.value.length !== 0 && !pattern.test(field.value)) {
    showErrorMessage(text, targetErrorContainer, field);
  }
}

function showErrorMessage(text: string, targetElement: HTMLElement, field: HTMLInputElement): void {
  targetElement.textContent = `${text}`;
  loginButton.disabled = true;
  loginButton.classList.add('_disabled');
  field.classList.add('invalid');
}

function getFormData (): User {
  return {
    email: emailInput.value,
    password: passwordInput.value,
  }
}

async function sendLogInRequest() {
  const url = logInServerUrl;
  const user = getFormData();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(user),
  })

  if (response.status === 401) {
    throw new InvalidUserDataError('Invalid user data. Please, try again');
  }

  const data: TokenObject = await response.json();

  return data;
}

async function sendSignUpRequest () {
  const url = signUpServerUrl;
  const user = getFormData();

  if (!user.email || !user.password) {
    throw new InvalidUserDataError('Some fields are empty');
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 500) {
    throw new InvalidUserDataError('User with this login already exists');
  }

  const token: TokenObject = await response.json();

  setTokenAndRedirect(token);
}

function validateInput(e: Event): void {
  const target = e.target as HTMLInputElement;

  const wrongEmailFormatMessage = 'Wrong email format. Please, try again';
  const wrongPasswordFormatMessage = 'Wrong password format. Please, try again';
  const emailPattern = /[\w\d-_]+@([\w_-]+\.)+[\w]+/;
  const passwordPattern = /([a-zA-Z0-9]{8,})/;

  const message = target === emailInput ? wrongEmailFormatMessage : wrongPasswordFormatMessage;
  const pattern = target === emailInput ? emailPattern : passwordPattern;

  validateField(target, pattern, message);
}

function setTokenAndRedirect (response: TokenObject) {
  Token.setToken(response)

  if (Token.getToken()) {
    ListenerRemover.removeEventListeners(authenticationEventsArray);
    redirectToTheGalleryPage();
  }
}

async function logIn () {
  try {
    const response = await sendLogInRequest();

    setTokenAndRedirect(response);
  } catch (err) {
    const error = err as InvalidUserDataError;

    setErrorMessage(error.message);
  }
}

async function signUp () {
  try {
    currentUrl.searchParams.delete('keyWord');
    await sendSignUpRequest();
  } catch (err) {
    const error = err as Error;
    console.log(error.message)

    setErrorMessage('Failed to sign up. Please, enter other data');
  }
}

function setErrorMessage (text: string) {
  submitErrorContainer!.textContent = `${text}`;
}

function resetErrorMessage() {
  submitErrorContainer!.textContent = '';
}

emailInput.addEventListener('input', validateInput);
passwordInput.addEventListener('change', validateInput);
loginButton.addEventListener('click', logIn);
loginForm!.addEventListener('focusin', resetErrorMessage);
signUpButton.addEventListener('click',  signUp);







