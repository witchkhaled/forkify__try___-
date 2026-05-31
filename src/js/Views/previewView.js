/**
 * @fileoverview PreviewView — renders a single recipe preview card.
 * Used as a child view by both {@link module:Views/resultsView ResultsView}
 * and {@link module:Views/bookmarkView BookmarkView}. Always called with
 * `render(data, false)` so it returns markup instead of inserting into the DOM.
 * @module Views/previewView
 * @author khaled
 */

import icons from 'url:../../img/icons.svg';
import View from './view';

/**
 * @class PreviewView
 * @extends View
 * @classdesc Generates the `<li>` markup for a single recipe preview
 * (thumbnail, title, publisher).  Highlights the currently active recipe
 * by comparing against the URL hash.
 */
class PreviewView extends View {
  /** @type {string} Not used — PreviewView never renders directly. */
  _parentElement = '';

  /**
   * Generates markup for one recipe preview list item.
   * Adds the `preview__link--active` class if the recipe matches the
   * current URL hash.  Shows a user-generated icon when the recipe
   * has an API `key`.
   *
   * @returns {string} The `<li>` HTML markup string.
   * @private
   */
  _generateMarkup() {
    const id = window.location.hash.slice(1);
    return ` 
      <li class="preview">
          <a class="preview__link ${this._data.id === id ? `preview__link--active` : ''} " href="#${this._data.id}">
            <figure class="preview__fig">
              <img src="${this._data.image}" alt="Test" />
            </figure>
           <div class="preview__data">
              <h4 class="preview__title">${this._data.title}</h4>
              <p class="preview__publisher">${this._data.publisher}</p>
           
            <div class="preview__user-generated ${this._data.key?'':'hidden'}">
                <svg>
                     <use href="${icons}#icon-user"></use>
                </svg>
            </div>
           </div>
         </a>
      </li>
     
           `;
  }
}

export default new PreviewView();
