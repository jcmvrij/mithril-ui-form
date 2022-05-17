import m from 'mithril';
import { GeoJSONFeature, GeoJSONSource, LayerSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import { FeatureCollection, Point } from 'geojson';

interface IMapLibreLayer {
  id: string;
  showLayer?: boolean;
  type: LayerSpecification;
  layout?: LayerSpecification['layout'];
  paint?: LayerSpecification['paint'];
  filter?: any[];
}

export interface IMapLibreSource {
  id: string;
  source: FeatureCollection;
  layers: IMapLibreLayer[];
}

export const handleDrawCreateEvent = (
  draw: MapboxDraw,
  features: GeoJSONFeature[],
  polygons: FeatureCollection,
  drawnPolygonLimit: number | undefined
) => {
  if (!polygons) {
    polygons = {
      type: 'FeatureCollection',
      features: [],
    };
  }
  polygons.features.push(features[0]);
  if (drawnPolygonLimit && drawnPolygonLimit > 0 && polygons.features.length > drawnPolygonLimit) {
    const oldestPolygonId = polygons.features[0].id?.toString();
    if (oldestPolygonId) draw.delete(oldestPolygonId);
    polygons.features.shift();
  }
  m.redraw();
};

export const handleDrawUpdateEvent = (features: GeoJSONFeature[], polygons: FeatureCollection) => {
  polygons.features = polygons.features.map((pfeature) => (features[0].id === pfeature.id ? features[0] : pfeature));
  m.redraw();
};

export const handleDrawDeleteEvent = (features: GeoJSONFeature[], polygons: FeatureCollection) => {
  polygons.features = polygons.features.filter((pfeature) => pfeature.id !== features[0].id);
  m.redraw();
};

export const updatePolygons = (polygons: FeatureCollection, draw: MapboxDraw) => {
  draw.set(polygons);
};

export const updateSourcesAndLayers = (sources: IMapLibreSource[], map: maplibregl.Map, canvas: HTMLElement) => {
  if (sources) {
    sources.forEach((source: IMapLibreSource) => {
      if (!map.getSource(source.id)) {
        map.addSource(source.id, {
          type: 'geojson',
          data: source.source,
        });
      } else {
        (map.getSource(source.id) as GeoJSONSource).setData(source.source);
      }

      source.layers.forEach((layer) => {
        const layerId = source.id + layer.id;
        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            // @ts-ignore
            type: layer.type,
            source: source.id,
            layout: layer.layout,
            // @ts-ignore
            paint: layer.paint,
            filter: layer.filter,
          });

          map.on('mouseenter', layerId, () => {
            canvas.style.cursor = 'move';
          });
          map.on('mouseleave', layerId, () => {
            canvas.style.cursor = '';
          });
        }
      });
    });
  }
};

export const addMapListenersForMovingFeatures = (
  map: maplibregl.Map,
  sources: IMapLibreSource[],
  canvas: HTMLElement
) => {
  if (sources) {
    map.on('mousedown', (e) => {
      const topFeatureAtClick = map.queryRenderedFeatures(e.point)[0];
      if (topFeatureAtClick.properties.movable) {
        e.preventDefault();
        map.moveLayer(topFeatureAtClick.layer.id);
        canvas.style.cursor = 'grab';
        const eventsWhenMouseDownAndMove = (e: MapLayerMouseEvent) => {
          const coordinates = e.lngLat;
          canvas.style.cursor = 'grabbing';
          // update map when moving
          (map.getSource(topFeatureAtClick.source) as GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [coordinates.lng, coordinates.lat],
                },
              },
            ],
          });
        };
        map.on('mousemove', eventsWhenMouseDownAndMove);
        map.once('mouseup', (e) => {
          canvas.style.cursor = '';
          const coordinates = e.lngLat;
          // moving stopped, so location of the feature is saved
          const index = sources.findIndex((source) => source.id === topFeatureAtClick.source);
          (sources[index].source.features[0].geometry as Point).coordinates = [coordinates.lng, coordinates.lat];
          map.off('mousemove', eventsWhenMouseDownAndMove);
          m.redraw();
        });
      }
    });
  }
};

export const generateGradientIcon = (width = 64) => {
  const bytesPerPixel = 4; // Each pixel is represented by 4 bytes: red, green, blue, and alpha.
  const data = new Uint8Array(width * width * bytesPerPixel);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < width; y++) {
      const offset = (y * width + x) * bytesPerPixel;
      data[offset + 0] = (y / width) * 255; // red
      data[offset + 1] = (x / width) * 255; // green
      data[offset + 2] = 128; // blue
      data[offset + 3] = 255; // alpha
    }
  }

  return { width: width, height: width, data: data };
};
