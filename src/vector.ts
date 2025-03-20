import { StyleFunction } from 'ol/style/Style';
import { DOMWidgetModel, ISerializers } from '@jupyter-widgets/base';
import 'ol/ol.css';
import { MODULE_NAME, MODULE_VERSION } from './version';
import '../css/widget.css';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer  } from 'ol/layer.js';
import { LayerModel, LayerView  } from './layer';

// **********************************

import Point   from 'ol/geom/Point.js';
import Icon    from 'ol/style/Icon.js';
import Feature from 'ol/Feature.js';
import Geometry from 'ol/geom/Geometry';

// currently unused:
const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'https://openlayers.org/en/latest/examples/data/icon.png'
  }),
});

// **********************************

export class OpenLayersVectorModel extends LayerModel {
  defaults() {
    console.log('OpenLayersVectorModel.defaults()')
    return {
      ...super.defaults(),
      _model_name:           OpenLayersVectorModel.model_name,
      _model_module:         OpenLayersVectorModel.model_module,
      _model_module_version: OpenLayersVectorModel.model_module_version,
      _view_name:            OpenLayersVectorModel.view_name,
      _view_module:          OpenLayersVectorModel.view_module,
      _view_module_version:  OpenLayersVectorModel.view_module_version,
      layers: [],
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    // Add any extra serializers here
  };

  static model_name           = 'OpenLayersVectorModel'; // wt
  static model_module         = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name            = 'OpenLayersVectorView';   // wt
  static view_module          = MODULE_NAME;
  static view_module_version  = MODULE_VERSION;
}

export class OpenLayersVectorView extends LayerView {
  obj: VectorLayer<any>;
  render() {
    this.initVectorLayer();
    this.create_obj();
    this.modelEvents();
  }
  create_obj() {
    this.obj = this.vectorLayer;
  }
  initVectorLayer() {

    let foo = this.model.get('data');

    let my_iconFeature = new Feature({
          geometry: new Point(foo['data']),
          name: 'SPI',
          population: 4000,
          rainfall: 500,
        });

    this.vectorSource = new VectorSource({
       features: [ new Feature<Geometry>(my_iconFeature.getGeometry()) ],
    });

    //hers: this.vectorSource = new VectorSource({
    //hers:   features: new GeoJSON().readFeatures(this.model.get('data')),
    //hers: });

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: this.createStyleFunction(),
    });
  }

  createStyleFunction(): StyleFunction {
    const modelStyle = this.model.get('style') || {};
    return (feature) => {
      return new Style({
        stroke: new Stroke({
          color: modelStyle.strokeColor || '#3399CC',
          width: modelStyle.strokeWidth || 1.25,
        }),
        fill: new Fill({
          color: modelStyle.fillColor || 'rgba(255, 255, 255, 0.4)',
        }),
        image: new CircleStyle({
          radius: modelStyle.pointRadius || 5,
          fill: new Fill({
            color: modelStyle.pointFillColor || '#FF0000',
          }),
          stroke: new Stroke({
            color: modelStyle.pointStrokeColor || '#000000',
            width: modelStyle.pointStrokeWidth || 1,
          }),
        }),
      });
    };
  }

  updateStyle() {
    this.vectorLayer.setStyle(this.createStyleFunction());
  }

  invisibleStyle = new Style({
    fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
    stroke: new Stroke({ color: 'rgba(0, 0, 0, 0)', width: 0 }),
  });
  updateVisibility() {
    const visibility = this.model.get('visible');
    this.vectorSource.getFeatures().forEach((feature) => {
      feature.setStyle(visibility ? undefined : this.invisibleStyle);
    });
  }
  updateData() {
    this.vectorSource.clear();
    // HELP this.vectorSource.addFeatures(
    // HELP   new Vector().readFeatures(this.model.get('data')),
    // HELP );
  }

  modelEvents() {
    this.listenTo(this.model, 'change:style',   this.updateStyle);
    this.listenTo(this.model, 'change:data',    this.updateData);
    this.listenTo(this.model, 'change:visible', this.updateVisibility);
  }
  vectorLayer: VectorLayer<any>;
  vectorSource: VectorSource;
}

