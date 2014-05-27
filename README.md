server-grid
===========

Typescript + Knockout + Underscore + Bootstrap + Dynamic LINQ + HTML Table = Dynamic Server Grid

After using a well-known component vendor's MVC server-based data grid, I thought there had to be a better way. 

This is my attempt at a modern technology, client-side data grid. 

It is not yet feature complete, however it is functional.

* Full LINQ-based backend, enabling paging, sorting, filtering to any LINQ provider
* JSON-based data exchange, ensuring minimal data transfer.
* KnockoutJs based templating for clean separation of UI, and ability to supply custom filter templates
* HTML markup is annotated with a data-column attribute to provide custom functionality. No other special code required. I will eventually build a HtmlHelper to produce this from an object's metadata

-- Notes --

* Implemented using TypeScript
* demo available [here](http://server-grid.azurewebsites.net/) is driven by an in-memory list, but could be based on a real dataset. (I just don't have a *real* large dataset available!)
* Bootstrap is used for styling, however it needs more work on top of the base platform - I take pull requests!


