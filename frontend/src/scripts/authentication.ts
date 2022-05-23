import { CustomEventListener, ListenerRemover } from "../modules/custom_event_listener.js";
import {logInServerUrl, signUpServerUrl} from "../modules/environment_variables.js";
import { InvalidUserDataError } from "../modules/errors.js";
import { redirectToTheGalleryPage } from "../modules/gallery_redirection.js";
import { TokenObject, User } from "../modules/interfaces.js";
import { Token } from "../modules/token_management.js";

const loginForm = document.forms?.namedItem("login");
const emailInput = loginForm?.elements.namedItem("email") as HTMLInputElement;
const passwordInput = loginForm?.elements.namedItem("password") as HTMLInputElement;
const submitButton = loginForm?.elements.namedItem("submit") as HTMLButtonElement;
const submitErrorContainer = loginForm?.querySelector('.login-form__submit-error-message');
const signUpButton = loginForm?.querySelector('.login-form__signup-button') as HTMLButtonElement;
const authenticationEventsArray: CustomEventListener[] = [
  {target: emailInput, type: 'input', handler: validateInput},
  {target: passwordInput, type: 'change', handler: validateInput},
  {target: loginForm as HTMLElement, type: 'submit', handler: submitForm},
  {target: loginForm as HTMLElement, type: 'focusin', handler: resetErrorMessage},
  {target: signUpButton as HTMLElement, type: 'click', handler: sendSignUpRequest},
];

function validateField(field: HTMLInputElement, pattern: RegExp, text: string): void {
  const targetErrorContainer = loginForm!.querySelector(`.login-form__${field.name}-error-message`) as HTMLElement;

  targetErrorContainer.textContent = '';
  submitButton.disabled = false;
  submitButton.classList.remove('_disabled')
  field.classList.remove('invalid');

  if (field.value.length !== 0 && !pattern.test(field.value)) {
    showErrorMessage(text, targetErrorContainer, field);
  }
}

function showErrorMessage(text: string, targetElement: HTMLElement, field: HTMLInputElement): void {
  targetElement.textContent = `${text}`;
  submitButton.disabled = true;
  submitButton.classList.add('_disabled');
  field.classList.add('invalid');
}

function getFormData (): User {
  return {
    email: emailInput.value,
    password: passwordInput.value,
  }
}

async function sendFormData() {
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

  try {
    if (!user.email || !user.password) {
      throw new InvalidUserDataError('Fields are empty');
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
  } catch (err) {
    const error = err as Error;
    setErrorMessage(error.message);
  }

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

async function submitForm(e: Event) {
  e.preventDefault();
  try {
    const response = await sendFormData();

    setTokenAndRedirect(response);
  } catch (err) {
    const error = err as InvalidUserDataError;

    setErrorMessage(error.message);
  }
}

function setErrorMessage (text: string) {
  submitErrorContainer!.textContent = `${text}`;

  emailInput.value = '';
  passwordInput.value = '';
}

function resetErrorMessage() {
  submitErrorContainer!.textContent = '';
}

emailInput.addEventListener('input', validateInput);
passwordInput.addEventListener('change', validateInput);
loginForm!.addEventListener('submit', submitForm);
loginForm!.addEventListener('focusin', resetErrorMessage);
signUpButton.addEventListener('click', sendSignUpRequest);







