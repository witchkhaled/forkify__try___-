/**
 * @fileoverview PaginationView — renders "previous / next" page buttons
 * and a "Page X of Y" indicator below the search results.
 * @module Views/paginationView
 * @author khaled
 */

import icons from 'url:../../img/icons.svg';
import View from './view';

/**
 * @class PaginationView
 * @extends View
 * @classdesc Renders pagination controls inside the `.pagination` container.
 * Calculates total pages from the search state and conditionally shows
 * prev / next buttons depending on the current page.
 */
class PaginationView extends View {
  /** @type {HTMLDivElement} The pagination container element. */
  _parentElement = document.querySelector('.pagination');

  /**
   * Registers a click handler (with event delegation) on the pagination
   * container.  Reads the target page from the button's `data-goto` attribute.
   *
   * @param {Function} handler - The controller function to call with the page number
   *   (e.g. controlPagination).
   */
  _addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = Number(btn.dataset.goto);
      handler(goToPage);
    });
  }

  /**
   * Generates the pagination markup based on the current page and total pages.
   *
   * Scenarios handled:
   * 1. **Page 1, multiple pages** → show "next" button only.
   * 2. **Last page** → show "prev" button only.
   * 3. **Middle page** → show both "prev" and "next" buttons.
   * 4. **Single page** → returns `undefined` (no buttons rendered).
   *
   * @returns {string|undefined} HTML markup string, or `undefined` if only one page.
   * @private
   */
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage,
    );
    const prevPageMarkup = `<button data-goto='${curPage - 1}' class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>page ${curPage - 1}</span>
          </button>`;

    const nextPageMarkup = `<button data-goto='${curPage + 1}' class="btn--inline pagination__btn--next">
            <span>page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>`;

    const pageInfoMarkup = `<span class="pagination__page-info">Page ${curPage} of ${numPages}</span>`;

    // page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `
        <div class="pagination__wrapper">
          <span></span> <!-- Empty spacer to keep text centered -->
          ${pageInfoMarkup}
          ${nextPageMarkup}
        </div>`;
    }

    // last page
    if (curPage === numPages && numPages > 1) {
      return `
        <div class="pagination__wrapper">
          ${prevPageMarkup}
          ${pageInfoMarkup}
          <span></span> <!-- Empty spacer to keep text centered -->
        </div>`;
    }

    // other page (middle pages)
    if (curPage < numPages) {
      return `
        <div class="pagination__wrapper">
          ${prevPageMarkup}
          ${pageInfoMarkup}
          ${nextPageMarkup}
        </div>`;
    }
  }
}

export default new PaginationView();
