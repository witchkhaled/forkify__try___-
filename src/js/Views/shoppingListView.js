/**
 * @fileoverview ShoppingListView — manages the shopping-list modal.
 * Creates a fixed-position modal on first instantiation, renders
 * ingredient lists into it, and handles its own open/close behaviour.
 * Follows the same MVC pattern as {@link module:Views/addRecipeView addRecipeView}.
 * @module Views/shoppingListView
 * @author khaled
 */

import View from './view';

/**
 * @class ShoppingListView
 * @extends View
 * @classdesc A self-contained modal view for displaying recipe ingredients
 * as a shopping list.  The DOM element is created dynamically (not present
 * in the HTML template) and appended to `<body>`.
 *
 * Styled by `_ingredient.scss` using the BEM-style classes:
 * - `.shopping-list`       — modal wrapper (fixed, centred)
 * - `.shopping-list.hidden` — hidden state (opacity 0, no pointer events)
 * - `.shopping-list__list`  — the `<ul>` containing ingredient items
 */
class ShoppingListView extends View {
  /**
   * Parent element used by the base {@link View} class for
   * `renderError` / `renderMessage`.  Set to the inner `<ul>` after creation.
   * @type {HTMLUListElement}
   */
  _parentElement;

  /** @type {string} */
  _message = '';

  /** @type {string} */
  _errorMessage = 'No ingredients to display.';

  /**
   * The outermost modal container element (`.shopping-list`).
   * @type {HTMLDivElement}
   * @private
   */
  _modal;

  /**
   * Reference to the close button inside the modal.
   * @type {HTMLButtonElement}
   * @private
   */
  _btnClose;

  /**
   * Reference to the `<ul>` that holds rendered ingredient items.
   * @type {HTMLUListElement}
   * @private
   */
  _list;

  /**
   * Creates the modal DOM, caches child references, and binds
   * the close-button handler.  Called once via the singleton export.
   */
  constructor() {
    super();
    this._createModal();
    this._addHandlerClose();
  }

  /**
   * Builds the modal DOM tree and appends it to `<body>`.
   * The modal starts in the `hidden` state.
   * @private
   */
  _createModal() {
    this._modal = document.createElement('div');
    this._modal.className = 'shopping-list hidden';
    this._modal.innerHTML = `
      <button class="btn--close-shopping">&times;</button>
      <h2>🛒 Shopping List</h2>
      <ul class="shopping-list__list"></ul>
    `;
    document.body.appendChild(this._modal);

    // Cache frequently-used children
    this._btnClose = this._modal.querySelector('.btn--close-shopping');
    this._list = this._modal.querySelector('.shopping-list__list');

    // _parentElement is used by the base View class for renderError / renderMessage
    this._parentElement = this._list;
  }

  /**
   * Binds a click listener on the × button to close the modal.
   * Self-contained — no controller involvement needed (same pattern
   * as {@link module:Views/addRecipeView addRecipeView._addHandlerHideWIndow}).
   * @private
   */
  _addHandlerClose() {
    this._btnClose.addEventListener('click', this.close.bind(this));
  }

  /**
   * Renders a list of ingredients into the modal's `<ul>`.
   * Each ingredient is displayed as a single `<li>` showing
   * quantity, unit, and description.
   *
   * @param {import('../model').Ingredient[]} ingredients - Array of ingredient
   *   objects from `model.state.recipe.ingredients`.
   */
  renderList(ingredients) {
    this._list.innerHTML = ingredients
      .map(
        ing =>
          `<li>${ing.quantity ? ing.quantity : ''} ${ing.unit} ${ing.description}</li>`
      )
      .join('');
  }

  /**
   * Shows the modal by removing the `hidden` CSS class.
   */
  open() {
    this._modal.classList.remove('hidden');
  }

  /**
   * Hides the modal by adding the `hidden` CSS class.
   */
  close() {
    this._modal.classList.add('hidden');
  }

  /**
   * Toggles the modal's visibility.
   */
  toggle() {
    this._modal.classList.toggle('hidden');
  }

  /**
   * Required by the base {@link View} class but not used here
   * (rendering is handled by {@link ShoppingListView#renderList}).
   *
   * @returns {string} Empty string.
   * @private
   */
  _generateMarkup() {}
}

export default new ShoppingListView();
