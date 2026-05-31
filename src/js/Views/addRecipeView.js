/**
 * @fileoverview AddRecipeView — manages the "Add Recipe" modal form.
 * Handles showing/hiding the modal overlay and delegates form submission
 * to the controller.  The show/hide behaviour is self-contained
 * (bound in the constructor), following the publisher–subscriber pattern.
 * @module Views/addRecipeView
 * @author khaled
 */

import icons from 'url:../../img/icons.svg';
import View from './view';

/**
 * @class addRecipeView
 * @extends View
 * @classdesc Controls the "Add Recipe" modal window and overlay.
 * Listens for open/close clicks internally and exposes `addHandlerUpload`
 * for the controller to subscribe to form submissions.
 */
class addRecipeView extends View {
  /** @type {HTMLFormElement} The `.upload` form element inside the modal. */
  _parentElement = document.querySelector('.upload');

  /** @type {string} Success message shown after a recipe is uploaded. */
  _message ='Recipe Was Successfuly Uploaded;'

  /** @type {HTMLDivElement} The modal window element. */
  _window = document.querySelector('.add-recipe-window');

  /** @type {HTMLDivElement} The dark overlay behind the modal. */
  _overlay = document.querySelector('.overlay');

  /** @type {HTMLButtonElement} The "Add Recipe" nav button that opens the modal. */
  _btnOpen = document.querySelector('.nav__btn--add-recipe');

  /** @type {HTMLButtonElement} The × button that closes the modal. */
  _btnClose = document.querySelector('.btn--close-modal');

  /**
   * Automatically binds show/hide handlers in the constructor so the
   * modal works without any controller setup.
   */
  constructor() {
    super();
    this._addHandlerShowWIndow();
    this._addHandlerHideWIndow();
  }

  /**
   * Toggles the visibility of both the modal window and the overlay
   * by adding/removing the `hidden` CSS class.
   */
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  /**
   * Binds a click handler on the "Add Recipe" button to open the modal.
   * @private
   */
  _addHandlerShowWIndow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  /**
   * Binds click handlers on both the × button and the overlay to
   * close the modal.
   * @private
   */
  _addHandlerHideWIndow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  /**
   * Registers a handler for the upload form's `submit` event.
   * Collects all form data as key/value pairs and passes them to the handler.
   *
   * @param {Function} handler - The controller function to call with the form data object
   *   (e.g. controlAddRecipe).
   */
  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr)
     handler(data)
    });
  }

  /**
   * Required by the base {@link View} class but not used here
   * (the form HTML is static in `index.html`).
   * @private
   */
  _generateMarkup() {}
}

export default new addRecipeView();
