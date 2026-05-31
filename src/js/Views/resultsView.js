/**
 * @fileoverview ResultsView — renders the search-results list.
 * Delegates individual result rendering to {@link module:Views/previewView PreviewView}.
 * @module Views/resultsView
 * @author khaled
 */

import icons from 'url:../../img/icons.svg';
import View from './view';
import previewView from './previewView';

/**
 * @class ResultsView
 * @extends View
 * @classdesc Renders an array of search results into the `.results`
 * sidebar list.  Each item is rendered by {@link PreviewView#render}.
 */
class ResultsView extends View {
  /** @type {string} Error message displayed when no results match the query. */
  _errorMessage = 'No recipe found for your query please try again';

  /** @type {string} */
  _message = '';

  /** @type {HTMLUListElement} The `.results` list element. */
  _parentElement = document.querySelector('.results');

  /**
   * Generates markup by delegating each result to
   * {@link PreviewView#render} in non-rendering mode (`render = false`).
   *
   * @returns {string} Concatenated HTML string of all preview items.
   * @private
   */
  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join('');
  }
}

export default new ResultsView();
