/**
 * @fileoverview BookmarkView — renders the bookmarks dropdown list.
 * Delegates individual bookmark rendering to {@link module:Views/previewView PreviewView}.
 * Restores bookmarks on page load via `addHandlerRender`.
 * @module Views/bookmarkView
 * @author khaled
 */

import icons from 'url:../../img/icons.svg';
import View from './view';
import previewView from './previewView';

/**
 * @class BookmarkView
 * @extends View
 * @classdesc Renders an array of bookmarked recipes into the
 * `.bookmarks__list` dropdown panel.
 */
class bookmarkView extends View {
  /** @type {string} Message shown when the user has no bookmarks yet. */
  _errorMessage = 'No bookmarks yet,Find a nice recipe and bookmark it ;';

  /** @type {string} */
  _message = '';

  /** @type {HTMLUListElement} The bookmarks list container. */
  _parentElement = document.querySelector('.bookmarks__list');

  /**
   * Registers a handler that fires on the `load` event to restore
   * bookmarks from localStorage when the page first loads.
   *
   * @param {Function} handler - The controller function to call (e.g. controlBookmark).
   */
  addHandlerRender(handler){
    window.addEventListener('load',handler)
  }

  /**
   * Generates markup by delegating each bookmark to
   * {@link PreviewView#render} in non-rendering mode.
   *
   * @returns {string} Concatenated HTML string of all bookmark preview items.
   * @private
   */
  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new bookmarkView();
