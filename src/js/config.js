/**
 * @fileoverview Application-wide configuration constants.
 * Centralises all "magic values" so they can be changed in one place
 * without touching business logic or view code.
 * @module config
 * @author khaled
 */

/**
 * Base URL for the Forkify API (v2).
 * All recipe CRUD endpoints are relative to this URL.
 * @constant {string}
 */
export const API_URL = 'https://forkify-api.jonas.io/api/v2/recipes/';

/**
 * Maximum number of seconds to wait for an API response before
 * rejecting with a timeout error.
 * @constant {number}
 */
export const TIMEOUT_SEC = 10;

/**
 * Number of search results displayed per page in the results panel.
 * @constant {number}
 */
export const RES_PER_PAGE = 10;

/**
 * Personal API key used for authentication with the Forkify API.
 * Required for creating / reading user-generated recipes.
 * @constant {string}
 */
export const Key = 'b241cdf6-789c-47bb-a083-454db8735511';

/**
 * Delay (in seconds) before the "Add Recipe" modal automatically
 * closes after a successful upload.
 * @constant {number}
 */
export const MODAL_CLOSE_SEC = 2.5