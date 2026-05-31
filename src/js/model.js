/**
 * @fileoverview Application Model — the single source of truth.
 * Manages all application state (recipe, search results, bookmarks,
 * shopping-list ingredients) and handles API communication via the
 * {@link module:helpers AJAX helper}.
 * @module model
 * @author khaled
 */

import { API_URL, RES_PER_PAGE, Key } from './config';
//  import { getJson, sendJson } from './helpers';
import { AJAX } from './helpers';

/**
 * @typedef {Object} Ingredient
 * @property {number|null} quantity  - Numeric amount (e.g. 0.5), or null.
 * @property {string}      unit        - Measurement unit (e.g. "kg", "tbsp").
 * @property {string}      description - Ingredient name / description.
 */

/**
 * @typedef {Object} Recipe
 * @property {string}       id          - Unique recipe ID from the API.
 * @property {string}       title       - Recipe title.
 * @property {string}       publisher   - Name of the publisher.
 * @property {string}       sourceUrl   - URL to the original recipe page.
 * @property {string}       image       - URL of the recipe image.
 * @property {number}       servings    - Current number of servings.
 * @property {number}       cookingTime - Cooking time in minutes.
 * @property {Ingredient[]} ingredients - List of ingredients.
 * @property {string}       [key]       - API key (present only for user-generated recipes).
 * @property {boolean}      [bookmark]  - Whether the current user bookmarked this recipe.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id        - Recipe ID.
 * @property {string} title     - Recipe title.
 * @property {string} publisher - Publisher name.
 * @property {string} image     - Image URL.
 * @property {string} [key]     - API key (user-generated recipes only).
 */

/**
 * Central application state object.
 * @type {{
 *   recipe: Recipe,
 *   search: { query: string, results: SearchResult[], page: number, resultsPerPage: number },
 *   bookmarks: Recipe[],
 *   ingredients: Ingredient[][]
 * }}
 */
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
  ingredients:[]
};

/**
 * Transforms raw API recipe data into the application's internal format.
 * Converts snake_case keys to camelCase and conditionally spreads the `key`
 * property for user-generated recipes.
 *
 * @param {Object} data - Raw JSON response from the Forkify API.
 * @returns {Recipe} A normalised recipe object.
 * @private
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

/**
 * Fetches a single recipe by ID from the API and stores it in
 * {@link state}.recipe.  Also checks whether the recipe is bookmarked.
 *
 * @async
 * @param {string} id - The unique recipe ID.
 * @returns {Promise<void>}
 * @throws {Error} Propagates network / API errors from {@link module:helpers.AJAX AJAX}.
 */
export const loadRecipe = async function (id) {
  const data = await AJAX(`${API_URL}${id}?key=${Key}`);
  state.recipe = createRecipeObject(data);

  // Simplified bookmark check
  state.recipe.bookmark = state.bookmarks.some(bookmark => bookmark.id === id);
};

/**
 * Searches the API for recipes matching a query string and stores
 * the results in {@link state}.search.  Resets the page counter to 1.
 *
 * @async
 * @param {string} query - The search term (e.g. "pizza").
 * @returns {Promise<void>}
 * @throws {Error} Propagates network / API errors.
 */
export const loadSearchResults = async function (query) {
  state.search.query = query;
  const data = await AJAX(`${API_URL}?search=${query}&key=${Key}`);

  state.search.results = data.data.recipes.map(rec => {
    return {
      id: rec.id,
      title: rec.title,
      publisher: rec.publisher,
      image: rec.image_url,
      ...(rec.key && { key: rec.key }),
    };
  });
  state.search.page = 1;
};

/**
 * Returns a slice of search results for a given page number.
 * Updates {@link state}.search.page as a side-effect.
 *
 * @param {number} [page=state.search.page] - The page number to retrieve (1-based).
 * @returns {SearchResult[]} The results for the requested page.
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

/**
 * Recalculates all ingredient quantities for a new number of servings
 * and updates {@link state}.recipe in place.
 *
 * @param {number} new_serv - The desired number of servings.
 */
export const updateServing = function (new_serv) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * new_serv) / state.recipe.servings;
  });
  state.recipe.servings = new_serv;
};

/**
 * Persists the current bookmarks array to `localStorage`.
 * @private
 */
const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * Adds a recipe to the bookmarks list (if not already present),
 * marks the current recipe as bookmarked, and persists to localStorage.
 *
 * @param {Recipe} recipe - The recipe object to bookmark.
 */
export const addBookmark = function (recipe) {
  // Check if already bookmarked
  if (state.bookmarks.some(bookmark => bookmark.id === recipe.id)) {
    return; // Don't add duplicates
  }

  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmark = true;
  persistBookmark();
};

/**
 * Removes a recipe from the bookmarks list by its ID,
 * un-marks the current recipe if it matches, and persists to localStorage.
 *
 * @param {string} id - The ID of the recipe to un-bookmark.
 */
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmark = false;
  persistBookmark();
};

/**
 * Clears all bookmarks from localStorage.
 * @private
 */
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

/**
 * Clears all saved shopping-list ingredients from localStorage.
 * @private
 */
const clearIngredient = function(){
  localStorage.clear('ingredients')
}

/**
 * Initialises the model by restoring bookmarks and shopping-list
 * ingredients from localStorage (if any exist).
 * Sets a timer to auto-clear ingredients after a long period.
 * @private
 */
const init = function () {
  const bookmarkstorage = localStorage.getItem('bookmarks');
  const ingredientStorage = localStorage.getItem('ingredients')
  if (bookmarkstorage) {
    const bookmarkParsed = JSON.parse(bookmarkstorage);
    const ingredientsParsed = JSON.parse(ingredientStorage)
    state.bookmarks = bookmarkParsed.filter(bookmark => bookmark?.id);
    state.ingredients=ingredientsParsed
    setTimeout(clearIngredient,1500000000)
  }
};
init();

//  clearBookmarks();

// REMOVED clearBookmarks() completely!

/**
 * Uploads a new user-created recipe to the Forkify API.
 * Parses the raw form data into the API's expected format,
 * sends it via POST, stores the returned recipe in state,
 * and automatically bookmarks it.
 *
 * @async
 * @param {Object} newRecipe - Raw key/value pairs from the "Add Recipe" form.
 * @returns {Promise<void>}
 * @throws {Error} If ingredient format is invalid or the API request fails.
 *
 * @example
 * // Expected ingredient format in form fields:
 * // ingredient-1: "0.5,kg,Rice"
 * // ingredient-2: "1,,Avocado"
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient fromat! Please use the correct format :)',
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${Key}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

/**
 * Adds the ingredients of a given recipe to the persistent shopping list.
 * Appends a new array of ingredients (one per recipe) and saves to localStorage.
 *
 * @param {Recipe} recipe - The recipe whose ingredients should be added.
 */
export const AddIngredientsToshopList = function(recipe){
  const ingredient =recipe.ingredients
  state.ingredients.push([...ingredient])
  console.log(state.ingredients)
  localStorage.setItem('ingredients',JSON.stringify(state.ingredients))
  }
console.log(state.ingredients);
