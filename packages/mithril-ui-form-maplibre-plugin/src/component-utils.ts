import m from 'mithril';
import { FeatureCollection, Point } from 'geojson';
import { GeoJSONFeature, GeoJSONSource, LayerSpecification, MapLayerMouseEvent } from 'maplibre-gl';

interface MapLibreLayer {
  id: string;
  showLayer?: boolean;
  type: LayerSpecification;
  layout?: LayerSpecification['layout'];
  paint?: LayerSpecification['paint'];
  filter?: any[];
}

export interface MapLibreSource {
  id: string;
  source: FeatureCollection;
  layers: MapLibreLayer[];
}

export const handleDrawCreateEvent = (
  draw: MapboxDraw,
  features: GeoJSONFeature[],
  polygons: FeatureCollection,
  drawnPolygonLimit: number | undefined
) => {
  console.log('draw create event fired');
  polygons.features.push(features[0]);
  //   draw.add(features[0]);
  if (drawnPolygonLimit && polygons.features.length > drawnPolygonLimit) {
    const oldestPolygonId = polygons.features[0].id?.toString();
    if (oldestPolygonId) draw.delete(oldestPolygonId);
    polygons.features.shift();
  }
  m.redraw();
};

export const handleDrawUpdateEvent = (features: GeoJSONFeature[], polygons: FeatureCollection) => {
  console.log('draw update event fired');
  polygons.features = polygons.features.map((pfeature) => (features[0].id === pfeature.id ? features[0] : pfeature));
  m.redraw();
};

export const handleDrawDeleteEvent = (_draw: MapboxDraw, features: GeoJSONFeature[], polygons: FeatureCollection) => {
  console.log('draw delete event fired');
  polygons.features = polygons.features.filter((pfeature) => {
    return pfeature.id !== features[0].id;
  });
  m.redraw();
};

export const updatePolygonsOnMap = (polygons: FeatureCollection, draw: MapboxDraw) => {
  draw.set(polygons);
};

export const updateSourcesAndLayers = (sources: MapLibreSource[], map: maplibregl.Map) => {
  sources.forEach((source: MapLibreSource) => {
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

        addMapListenersForLayer(map, layerId);
      }
    });
  });
};

const addMapListenersForLayer = (map: maplibregl.Map, layerId: string) => {
  //   const eventsWhenMouseDownAndMove = (e: MapLayerMouseEvent) => {
  //     const coordinates = e.lngLat;
  //     canvas.style.cursor = 'grabbing';
  //     // update map layer when moving
  //     (map.getSource(source.id) as GeoJSONSource).setData({
  //       type: 'FeatureCollection',
  //       features: [
  //         {
  //           type: 'Feature',
  //           properties: {},
  //           geometry: {
  //             type: 'Point',
  //             coordinates: [coordinates.lng, coordinates.lat],
  //           },
  //         },
  //       ],
  //     });
  //   };

  const canvas = map.getCanvasContainer();
  map.on('mouseenter', layerId, () => {
    console.log('mouseenter event');
    canvas.style.cursor = 'move';
  });
  map.on('mouseleave', layerId, () => {
    console.log('mouseleave event');
    canvas.style.cursor = '';
  });

  //   map.on('mousedown', layerId, (e) => {
  //     console.log('mousedown event');
  //     console.log(map.queryRenderedFeatures(e.point)[0]);
  //     e.preventDefault();
  //     canvas.style.cursor = 'grab';

  //     map.on('mousemove', eventsWhenMouseDownAndMove);
  //     map.once('mouseup', (e) => {
  //       console.log('mouseup event');
  //       canvas.style.cursor = '';
  //       const coordinates = e.lngLat;
  //       // update passed in source
  //       (source.source.features[0].geometry as Point).coordinates = [coordinates.lng, coordinates.lat];
  //       map.off('mousemove', eventsWhenMouseDownAndMove);
  //       m.redraw();
  //     });
  //   });
};

export const addMapListenersForMovingFeatures = (map: maplibregl.Map, sources: MapLibreSource[]) => {
  const canvas = map.getCanvasContainer();
  map.on('mousedown', (e) => {
    console.log('mousedown event');
    const topFeatureAtClick = map.queryRenderedFeatures(e.point)[0];
    if (topFeatureAtClick.properties.movable) {
      e.preventDefault();
      canvas.style.cursor = 'grab';
      const eventsWhenMouseDownAndMove = (e: MapLayerMouseEvent) => {
        const coordinates = e.lngLat;
        canvas.style.cursor = 'grabbing';
        // update map layer when moving
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
        console.log('mouseup event');
        canvas.style.cursor = '';
        const coordinates = e.lngLat;
        // update passed in source
        const index = sources.findIndex((source) => source.id === topFeatureAtClick.source);
        (sources[index].source.features[0].geometry as Point).coordinates = [coordinates.lng, coordinates.lat];
        map.off('mousemove', eventsWhenMouseDownAndMove);
        m.redraw();
      });
    }
  });
};
