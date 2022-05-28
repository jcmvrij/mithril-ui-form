# A map plugin for Mithril-ui-form using the maplibre library 

This is a plugin for [Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form). It is based on [MapLibre GL](https://www.npmjs.com/package/maplibre-gl).

```ts
import { mapLibrePlugin } from 'mithril-ui-form-maplibre-plugin';

...

registerPlugin('libremap', mapLibrePlugin());
```

You can load icons (and a fallback icon) that can then be used in map layers.
```ts
import { mapLibrePlugin } from 'mithril-ui-form-maplibre-plugin';
import red from './assets/red.png';
import blue from './assets/blue.png';
import genericMarkerIcon from './assets/x.png';
...
const options = {
    icons: [
        [red, 'RED'],
        [blue, 'BLUE'],
    ],
    fallbackIcon: genericMarkerIcon
}
registerPlugin('libremap', mapLibrePlugin(options));
```