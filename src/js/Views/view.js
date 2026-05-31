/**
 * @fileoverview Base View class — the abstract parent for every view in the app.
 * Provides shared rendering, DOM-diffing update, spinner, message, and error
 * display logic.  Concrete views extend this class and override
 * {@link View#_generateMarkup}.
 * @module Views/view
 * @author khaled
 */

import icons from 'url:../../img/icons.svg';

/**
 * @abstract
 * @class View
 * @classdesc Abstract base class that all application views inherit from.
 * Subclasses **must** set `_parentElement` and implement `_generateMarkup()`.
 */
export default class View {
  /** @type {*} The data object(s) currently held by this view. */
  _data;

  /**
   * Render the received object to the DOM.
   *
   * If `render` is `false` the generated markup string is returned instead
   * of being inserted — this is used by composite views (e.g. ResultsView
   * delegating to PreviewView).
   *
   * @param {Object|Object[]} data - The data to render (e.g. a recipe object or array of results).
   * @param {boolean} [render=true] - If `false`, return the markup string instead of inserting into the DOM.
   * @returns {undefined|string} The markup string when `render` is `false`; otherwise `undefined`.
   * @this {View} The view instance.
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();
    if (!render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * DOM-diffing update — re-renders markup virtually, then patches only the
   * changed text nodes and attributes in the live DOM.
   * Much faster than a full re-render for small data changes (e.g. servings).
   *
   * @param {Object|Object[]} data - The updated data to diff against the current DOM.
   */
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();
    const newDom = document.createRange().createContextualFragment(newMarkup);

    // Select ALL elements for DOM diffing
    const newElements = Array.from(newDom.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEL, i) => {
      const curEL = curElements[i];

      // Guard: skip if current element doesn't exist
      if (!curEL) return;

      // Update changed text nodes ONLY
      if (
        !newEL.isEqualNode(curEL) &&
        newEL.firstChild?.nodeType === Node.TEXT_NODE && // ✅ Check it's a text node
        newEL.firstChild.nodeValue.trim() !== ''
      ) {
        console.log(`${newEL.firstChild.nodeValue.trim()}🔥🔥🔥`);
        curEL.textContent = newEL.textContent;
      }

      // Update changed attributes
      if (!newEL.isEqualNode(curEL)) {
        Array.from(newEL.attributes).forEach(attr =>
          curEL.setAttribute(attr.name, attr.value),
        );
      }
    });
  }

  /**
   * Clears all child content from the parent element.
   * @private
   */
  _clear() {
    this._parentElement.innerHTML = '';
  }

  /**
   * Replaces the parent element content with a loading spinner animation.
   */
  renderSpinner() {
    const markup = `<div class="spinner">
              <svg>
                <use href="${icons}#icon-loader"></use>
              </svg>
            </div> `;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Displays a success / informational message inside the parent element.
   *
   * @param {string} [message=this._message] - The message text to display.
   */
  renderMessage(message = this._message) {
    const markup = `<div class="recipe">
            <div class="message">
              <div>
                <svg>
                  <use href="${icons}#icon-smile"></use>
                </svg>
              </div>
              <p>${message}</p>
            </div>
            `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  /**
   * Displays an error message inside the parent element.
   *
   * @param {string} [message=this._errorMessage] - The error text to display.
   */
  renderError(message = this._errorMessage) {
    const markup = `<div class="error">
                <div>
                  <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
