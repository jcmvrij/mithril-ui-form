# A map plugin for Mithril-ui-form using the maplibre library 

This is a plugin for [Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form). It adds the use of a map based on [MapLibre GL](https://www.npmjs.com/package/maplibre-gl).

```ts
import { mapLibrePlugin } from 'mithril-ui-form-maplibre-plugin';

...

registerPlugin('libremap', mapLibrePlugin());
```

You can load your own icons that can then be used in symbol layers.
```ts
import { mapLibrePlugin } from 'mithril-ui-form-maplibre-plugin';
import red from './assets/red.png';
import blue from './assets/blue.png';
import fallbackIcon from './assets/x.png';
...
const icons: Array<[img: string, name: string]> = [
    [red, 'RED'],
    [blue, 'BLUE'],
];

registerPlugin('libremap', mapLibrePlugin(fallbackIcon, icons));
```