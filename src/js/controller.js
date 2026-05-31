/**
 * @fileoverview Application Controller — the "glue" of the MVC architecture.
 * Imports all Views and the Model, wires event handlers (publisher–subscriber),
 * and contains the control functions that orchestrate data flow between the
 * Model and the Views.
 *
 * **No DOM manipulation happens here** — all UI work is delegated to Views.
 *
 * @module controller
 * @author khaled
 */

import * as model from './model.js';
import recipeView from './Views/recipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import searchView from './Views/searchView.js';
import resultsView from './Views/resultsView.js';
import paginationView from './Views/paginationView.js';
import bookmarkView from './Views/bookmarkView.js';
import addRecipeView from './Views/addRecipeView.js';
import shoppingListView from './Views/shoppingListView.js';
import { MODAL_CLOSE_SEC } from './config.js';

/** @type {HTMLDivElement} Reference to the `.recipe` container (legacy, kept for compatibility). */
const recipeContainer = document.querySelector('.recipe');
// if (module.hot) {
//   module.hot.accept();
// }

// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

///////////////////////////////////////

/**
 * Handles loading and rendering a single recipe when the URL hash changes.
 *
 * Flow:
 * 1. Read the recipe ID from the URL hash.
 * 2. Show a loading spinner in the recipe panel.
 * 3. Update the results & bookmarks views to highlight the active recipe.
 * 4. Fetch recipe data from the API via the Model.
 * 5. Render the full recipe in the recipe panel.
 *
 * @async
 * @returns {Promise<void>}
 */
const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    //0 update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    //1)update bookmark view
    bookmarkView.update(model.state.bookmarks);
    // 2---loading recipe
    await model.loadRecipe(id);
    //3---rendering recipe
    recipeView.render(model.state.recipe);
    //test
    // controlServings();
  } catch (err) {
    alert(err);
    recipeView.renderError();
  }
};

/**
 * Handles searching for recipes based on the user's query.
 *
 * Flow:
 * 1. Show a spinner in the results panel.
 * 2. Read the search query from the search input.
 * 3. Fetch matching recipes from the API via the Model.
 * 4. Render the first page of results.
 * 5. Render the initial pagination buttons.
 *
 * @async
 * @returns {Promise<void>}
 */
const controleSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //! get search query
    const query = searchView.getQuery();
    if (!query) return;
    //2)load search
    await model.loadSearchResults(query);
    //3)render results
    resultsView.render(model.getSearchResultsPage());
    //4) render intial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Handles pagination — renders a new page of search results when the
 * user clicks a prev/next button.
 *
 * @param {number} goToPage - The 1-based page number to navigate to.
 */
const controlPagination = function (goToPage) {
  //1)render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //4) render new pagination button
  paginationView.render(model.state.search);
};

/**
 * Handles updating the recipe servings.
 * Recalculates ingredient quantities in the Model and patches the
 * recipe view via DOM-diffing (no full re-render).
 *
 * @param {number} newServing - The desired number of servings.
 */
const controlServings = function (newServing) {
  //update the recipe servings in the state
  model.updateServing(newServing);
  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

/**
 * Handles toggling a recipe's bookmark status.
 *
 * Flow:
 * 1. Add or remove the bookmark in the Model (and localStorage).
 * 2. Patch the recipe view to update the bookmark icon.
 * 3. Re-render the bookmarks dropdown list.
 */
const controlAddBookmark = function () {
  //1)add or remove bookmark
  if (!model.state.recipe.bookmark) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2)update recipe view
  recipeView.update(model.state.recipe);
  //3) render bookmark
  bookmarkView.render(model.state.bookmarks);
};

/**
 * Renders the bookmarks list from localStorage on initial page load.
 * Called once via the `load` event registered in {@link BookmarkView#addHandlerRender}.
 */
const controlBookmark = function () {
  bookmarkView.render(model.state.bookmarks);
};

/**
 * Handles uploading a new user-created recipe.
 *
 * Flow:
 * 1. Show a loading spinner inside the modal.
 * 2. Upload the recipe to the API via the Model.
 * 3. Render the new recipe in the recipe panel.
 * 4. Show a success message in the modal.
 * 5. Re-render the bookmarks list (recipe is auto-bookmarked).
 * 6. Update the URL hash to the new recipe's ID (without page reload).
 * 7. Auto-close the modal after {@link MODAL_CLOSE_SEC} seconds.
 *
 * @async
 * @param {Object} newRecipe - Raw form data from the "Add Recipe" form.
 * @returns {Promise<void>}
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();
    //upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //render recipe in the recipe view
    recipeView.render(model.state.recipe);
    //display a success message
    addRecipeView.renderMessage();
    //render a bookmark view
    bookmarkView.render(model.state.bookmarks);
    //change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //close forme
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(`🔥🔥${err.message}`);
    addRecipeView.renderError(err.message);
  }
};

/**
 * Handles the shopping-list button click on a recipe.
 * Reads the current recipe's ingredients from the Model and displays
 * them in the {@link ShoppingListView} modal.
 *
 * Flow:
 * 1. Retrieve ingredients from `model.state.recipe`.
 * 2. Guard clause — alert if no ingredients are available.
 * 3. Render the ingredient list into the shopping-list modal (View).
 * 4. Open the modal (View).
 */
const controlAddIngredient = function () {
  // 1. Get ingredients from the current recipe in state
  const ingredients = model.state.recipe?.ingredients;

  // Safety check: ensure we have ingredients to display
  if (!ingredients || ingredients.length === 0) {
    alert('No ingredients available for this recipe.');
    return;
  }

  // 2. Render ingredients into the shopping list modal (View)
  shoppingListView.renderList(ingredients);

  // 3. Open the modal (View)
  shoppingListView.open();
};

/**
 * Initialises the application by subscribing controller functions to
 * view events (publisher–subscriber pattern).
 *
 * Each `addHandler*` call tells a View: "when event X happens, call
 * this controller function". The View never knows about the controller
 * directly — it only holds a reference to the callback.
 *
 * @private
 */
const init = function () {
  recipeView.addHandlerRender(controlRecipe);
  bookmarkView.addHandlerRender(controlBookmark);
  recipeView.addHandlerServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerIngredients(controlAddIngredient);
  searchView.addHandlerSearch(controleSearchResults);
  paginationView._addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('welcome');
};
init();
