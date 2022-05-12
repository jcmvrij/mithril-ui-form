# A map plugin using the maplibre library for Mithril-ui-form

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framework to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.


Implemented:
- Move features on the map
- Draw and manipulate polygons on the map

You are able to limit the amount of drawn polygons through the drawnPolygonLimit property.




```ts
import { maplibrePlugin } from 'mithril-ui-form-maplibre-plugin';

...

registerPlugin('libremap', maplibrePlugin);
```
