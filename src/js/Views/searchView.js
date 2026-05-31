/**
 * @fileoverview SearchView — handles the search form UI.
 * Reads the user's query from the search input, clears it after submission,
 * and delegates the `submit` event to the controller.
 * @module Views/searchView
 * @author khaled
 */

/**
 * @class SearchView
 * @classdesc Manages the `.search` form element in the header.
 * Does **not** extend {@link View} because it does not render markup —
 * it only reads input and forwards events.
 */
class SearchView {
  /** @type {HTMLFormElement} The search form element. */
  _parentElement = document.querySelector('.search');

  /**
   * Reads the current value of the search input field, clears it,
   * and returns the query string.
   *
   * @returns {string} The trimmed search query entered by the user.
   */
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput()
    return query
  }

  /**
   * Resets the search input field to an empty string.
   * @private
   */
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  /**
   * Registers a handler for the search form's `submit` event.
   * Prevents default form submission and delegates to the controller.
   *
   * @param {Function} handler - The controller function to call (e.g. controleSearchResults).
   */
  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
