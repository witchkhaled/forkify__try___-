/**
 * @fileoverview Utility / helper functions shared across the application.
 * Contains the unified AJAX helper and a timeout race-condition utility.
 * @module helpers
 * @author khaled
 */

import { TIMEOUT_SEC } from './config';

/**
 * Creates a Promise that rejects after a specified number of seconds.
 * Used with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race Promise.race}
 * to abort long-running fetch requests.
 *
 * @param {number} s - Number of seconds before the timeout fires.
 * @returns {Promise<never>} A Promise that always rejects with an Error.
 */
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} seconds`));
    }, s * 1000);
  });
};

/**
 * Unified AJAX helper — handles both GET and POST requests to the API.
 *
 * - **GET**  → call with only `url`.
 * - **POST** → call with `url` and `uploadData`.
 *
 * The fetch is raced against a {@link timeout} to prevent hanging requests.
 * On HTTP errors the API's own error message is extracted when possible.
 *
 * @async
 * @param {string} url - The endpoint URL to fetch.
 * @param {Object} [uploadData] - Data to POST as JSON. If omitted a GET request is made.
 * @returns {Promise<Object>} The parsed JSON response body.
 * @throws {Error} If the request times out or the server returns a non-OK status.
 *
 * @example
 * // GET request
 * const data = await AJAX('https://forkify-api.jonas.io/api/v2/recipes/12345');
 *
 * @example
 * // POST request
 * const data = await AJAX('https://forkify-api.jonas.io/api/v2/recipes?key=xxx', recipeObj);
 */
export const AJAX = async function (url, uploadData = undefined) {
  const fetchPro = uploadData
    ? fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      })
    : fetch(url);

  const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

  // 🚨 1. CHECK FOR ERRORS FIRST
  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
      const errorData = await res.json();
      if (errorData.message) errorMsg = errorData.message;
    } catch (_) {
      // If the error response isn't JSON, we just use the statusText
    }
    throw new Error(`${errorMsg} (${res.status})`);
  }

  // 🚨 2. ONLY PARSE JSON IF THE REQUEST WAS SUCCESSFUL
  return await res.json();
};
// export const getJson = async function (url) {
//   const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);

//   if (!res.ok) {
//     let errorMsg = res.statusText;
//     try {
//       const errorData = await res.json();
//       if (errorData.message) errorMsg = errorData.message;
//     } catch (_) {
//       // If the error response isn't JSON, we just use the statusText
//     }
//     throw new Error(`${errorMsg} (${res.status})`);
//   }

//   return await res.json();
// };

// export const sendJson = async function (url, uploadData) {
//   const res = await Promise.race([
//     fetch(url, {
//       method: 'POST', // Uppercase is standard
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(uploadData),
//     }),
//     timeout(TIMEOUT_SEC),
//   ]);

//   if (!res.ok) {
//     let errorMsg = res.statusText;
//     try {
//       const errorData = await res.json();
//       if (errorData.message) errorMsg = errorData.message;
//     } catch (_) {}
//     throw new Error(`${errorMsg} (${res.status})`);
//   }

//   return await res.json();
// };
