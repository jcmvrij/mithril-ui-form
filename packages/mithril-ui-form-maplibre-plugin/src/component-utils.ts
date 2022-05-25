import { GeoJSONFeature, GeoJSONSource, LayerSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import { FeatureCollection, Point } from 'geojson';
import { DrawableMap, pluginState } from './component';

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
  map: DrawableMap,
  features: GeoJSONFeature[],
  state: pluginState,
  drawnPolygonLimit: number | undefined,
  onStateChange: any
) => {
  state.polygons.features.push(features[0]);
  if (drawnPolygonLimit && drawnPolygonLimit > 0 && state.polygons.features.length > drawnPolygonLimit) {
    const oldestPolygonId = state.polygons.features[0].id?.toString();
    if (oldestPolygonId) draw.delete(oldestPolygonId);
    state.polygons.features.shift();
  }
  onStateChange(state);
  map.redraw();
};

export const handleDrawUpdateEvent = (
  map: DrawableMap,
  features: GeoJSONFeature[],
  state: pluginState,
  onStateChange: any
) => {
  state.polygons.features = state.polygons.features.map((pfeature) =>
    features[0].id === pfeature.id ? features[0] : pfeature
  );
  onStateChange(state);
  map.redraw();
};

export const handleDrawDeleteEvent = (
  map: DrawableMap,
  features: GeoJSONFeature[],
  state: pluginState,
  onStateChange: any
) => {
  state.polygons.features = state.polygons.features.filter((pfeature) => pfeature.id !== features[0].id);
  onStateChange(state);
  map.redraw();
};

export const updatePolygons = (polygons: FeatureCollection | undefined, draw: MapboxDraw) => {
  if (polygons) draw.set(polygons);
};

export const updateSourcesAndLayers = (state: pluginState, map: maplibregl.Map, canvas: HTMLElement) => {
  if (state.sources) {
    state.sources.forEach((source: IMapLibreSource) => {
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
  state: pluginState,
  onStateChange: any,
  map: maplibregl.Map,
  canvas: HTMLElement
) => {
  map.on('mousedown', (e) => {
    const topFeatureAtClick = map.queryRenderedFeatures(e.point)[0];
    if (topFeatureAtClick.properties.movable) {
      e.preventDefault();
      map.moveLayer(topFeatureAtClick.layer.id);
      canvas.style.cursor = 'grab';
      const eventsWhenMouseDownAndMoving = (e: MapLayerMouseEvent) => {
        canvas.style.cursor = 'grabbing';
        // update only source of map when moving feature
        const coordinates = e.lngLat;
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
      map.on('mousemove', eventsWhenMouseDownAndMoving);
      map.once('mouseup', (e) => {
        canvas.style.cursor = '';
        const coordinates = e.lngLat;
        // moving feature stops, last location of the feature is saved in the source in the application
        const index = state.sources.findIndex((source) => source.id === topFeatureAtClick.source);
        (state.sources[index].source.features[0].geometry as Point).coordinates = [coordinates.lng, coordinates.lat];
        map.off('mousemove', eventsWhenMouseDownAndMoving);
        onStateChange(state);
      });
    }
  });
};
