import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { extname } from 'path';

export async function randomString(
  length: number,
  characters?: string,
): Promise<string> {
  if (length < 1) {
    throw new Error('Length must be greater than 0');
  }

  if (!characters)
    characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

  // Create a new Uint8Array with the specified length.
  const buffer = new Uint8Array(length);

  // Get the browser's crypto object for generating random numbers.

  // Generate random values and store them in the buffer.
  const array = await crypto.getRandomValues(buffer);

  // Initialize an empty string to hold the generated password.
  let result = '';

  // Iterate over the array of random values and add characters to the password.
  for (let i = 0; i < length; i++) {
    // Use the modulus operator to get a random index in the characters string
    // and add the corresponding character to the password.
    result += characters.charAt(array[i] % characters.length);
  }

  // Return the generated password.
  return result;
}

export const editFileName = (req, file, callback) => {
  callback(null, randomUUID().toString() + extname(file.originalname));
};

export const filterString = (string: string) => {
  const allowedCharactersPattern = /[()\-0-9a-zA-Z\u4e00-\u9fa5]/g;
  const filteredString = string.match(allowedCharactersPattern);
  if (filteredString) {
    return filteredString.join('');
  }
  return '';
};

export const removeElementByValue = (arr, value) => {
  const index = arr.indexOf(value);
  if (index !== -1) {
    arr.splice(index, 1);
  }
};
