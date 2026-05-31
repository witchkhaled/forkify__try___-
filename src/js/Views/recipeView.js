/**
 * @fileoverview RecipeView — renders the full recipe detail panel.
 * Displays the recipe image, title, cooking info, servings controls,
 * ingredient list, directions, and action buttons (bookmark, shopping list).
 * @module Views/recipeView
 * @author khaled
 */

import View from './view';
import icons from 'url:../../img/icons.svg';
import fracty from 'fracty';

/**
 * @class RecipeView
 * @extends View
 * @classdesc Renders a single recipe's full detail view inside `.recipe`.
 */
class RecipeView extends View {
  /** @type {HTMLElement} The DOM element this view renders into. */
  _parentElement = document.querySelector('.recipe');

  /** @type {string} Default error message shown when a recipe cannot be found. */
  _errorMessage = 'we could not find this recipe. please try another one';

  /** @type {string} Default success message (unused for this view). */
  _message = '';

  /**
   * Listens for `hashchange` and `load` events on the window to trigger
   * recipe loading whenever the URL hash changes.
   *
   * @param {Function} handler - The controller function to call (e.g. controlRecipe).
   */
  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  /**
   * Generates the full HTML markup for a recipe.
   *
   * @returns {string} The complete recipe markup string.
   * @private
   */
  _generateMarkup() {
    return `
      <figure class="recipe__fig">
        <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
        <h1 class="recipe__title">
          <span>${this._data.title}</span>
        </h1>
      </figure>

      <div class="recipe__details">
        <div class="recipe__info">
          <svg class="recipe__info-icon">
            <use href="${icons}#icon-clock"></use>
          </svg>
          <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
          <span class="recipe__info-text">minutes</span>
        </div>

        <div class="recipe__info">
          <svg class="recipe__info-icon">
            <use href="${icons}#icon-users"></use>
          </svg>
          <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
          <span class="recipe__info-text">servings</span>

          <div class="recipe__info-buttons">
            <button class="btn--tiny btn--update-servings"data-update-to="${this._data.servings - 1}">
              <svg>
                <use href="${icons}#icon-minus-circle"></use>
              </svg>
            </button>
            <button class="btn--tiny btn--update-servings"data-update-to="${this._data.servings + 1}">
              <svg>
                <use href="${icons}#icon-plus-circle"></use>
              </svg>
            </button>
          </div>
        </div>

                <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
            <svg>
              <use href="${icons}#icon-user"></use>
            </svg>
        </div>
        
       <!-- 🛒 NEW SHOPPING LIST BUTTON (Hardcoded SVG) -->
        <button class="btn--round btn--shopping-list">
          <svg viewBox="0 0 24 24">
             <path d="M7 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"></path>
          </svg>
        </button>

        <button class="btn--round btn--bookmark">
          <svg class="">
             <use href="${icons}#icon-bookmark${this._data.bookmark ? '-fill' : ''}"></use>
          </svg>
        </button>
      </div>
      

      <div class="recipe__ingredients">
        <h2 class="heading--2">Recipe ingredients</h2>
        <ul class="recipe__ingredient-list">
          ${this._data.ingredients
            .map(this._generateMarkupIngredient)

            .join('')}
        </ul>
      </div>

      <div class="recipe__directions">
        <h2 class="heading--2">How to cook it</h2>
        <p class="recipe__directions-text">
          This recipe was carefully designed and tested by
          <span class="recipe__publisher">${this._data.publisher}</span>. Please check out
          directions at their website.
        </p>
        <a
          class="btn--small recipe__btn"
          href="${this._data.sourceUrl}"
          target="_blank"
        >
          <span>Directions</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </a>
      </div>`;
  }

  /**
   * Registers a click handler on the bookmark button (`.btn--bookmark`).
   * Uses event delegation on the parent element.
   *
   * @param {Function} handler - The controller function to call (e.g. controlAddBookmark).
   */
  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;

      handler();
    });
  }

  /**
   * Registers a click handler on the shopping-list button (`.btn--shopping-list`).
   * Uses event delegation on the parent element.
   *
   * @param {Function} handler - The controller function to call (e.g. controlAddIngredient).
   */
  addHandlerIngredients(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--shopping-list');
      if (!btn) return;
      handler();
    });
  }

  /**
   * Generates the markup for a single ingredient list item.
   * Converts decimal quantities to fractions using the `fracty` library.
   *
   * @param {import('../model').Ingredient} ing - A single ingredient object.
   * @returns {string} The `<li>` markup string.
   * @private
   */
  _generateMarkupIngredient(ing) {
    return `
            <li class="recipe__ingredient">
              <svg class="recipe__icon">
                <use href="${icons}#icon-check"></use>
              </svg>
              <div class="recipe__quantity">${ing.quantity ? fracty(ing.quantity).toString() : ''}</div>
              <div class="recipe__description">
                <span class="recipe__unit">${ing.unit}</span>
                ${ing.description}
              </div>
            </li>
          `;
  }

  /**
   * Registers a click handler on the servings +/- buttons (`.btn--update-servings`).
   * Reads the target serving count from the button's `data-update-to` attribute
   * and passes it to the handler.
   *
   * @param {Function} handler - The controller function to call with the new serving number.
   */
  addHandlerServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      console.log(btn);
      const { updateTo } = btn.dataset;
      if (+updateTo > 0) handler(+updateTo);
    });
  }
}

export default new RecipeView();
