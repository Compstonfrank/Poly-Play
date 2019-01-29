import React from 'react';
import { AR, Asset } from 'expo';
import { MaterialCommunityIcons as Icon } from 'react-native-vector-icons';
import {
  ScrollView,
  View,
  Image,
  Text,
  TextInput,
  Button,
  Modal
} from 'react-native';

import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';
import GooglePoly from '../API/GooglePoly';
import APIkeys from '../constants/APIkeys';
import BobObject from '../assets/Objects/Bob';
import SearchPolyAsset from '../components/AppComponents/SearchPolyAsset';

console.disableYellowBox = true;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.googlePoly = new GooglePoly(APIkeys.GooglePoly);
    this.state = {
      searchModalVisible: false,
      currentAsset: BobObject,
      spin: false
    };
    this.onSearchModalPress = this.onSearchModalPress.bind(this);
    this.onAssetPress = this.onAssetPress.bind(this);
    this.onCancelPress = this.onCancelPress.bind(this);
    this.onSpinPress = this.onSpinPress.bind(this);
  }

  componentDidMount() {
    THREE.suppressExpoWarnings(true);
  }

  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    AR.setPlaneDetection('horizontal');

    this.renderer = new ExpoTHREE.Renderer({
      gl,
      pixelRatio,
      width,
      height
    });

    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.points = new ThreeAR.Points();
    this.scene.add(this.points);
  };

  onResize = ({ x, y, scale, width, height }) => {
    if (!this.renderer) {
      return;
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = delta => {
    if (this.threeModel && this.spin) {
      this.threeModel.rotation.x += 2 * delta;
      this.threeModel.rotation.y += 1.5 * delta;
    }
    this.points.update();
    this.renderer.render(this.scene, this.camera);
  };

  onAddThreeModelPress = () => {
    if (this.threeModel) {
      this.scene.remove(this.threeModel);
    }
    GooglePoly.getThreeModel(
      this.state.currentAsset,
      function(object) {
        this.threeModel = object;
        object.scale.set(0.2, 0.2, 0.2);
        object.position.z = -2;
        this.scene.add(object);
      }.bind(this),
      function(error) {
        console.log(error);
      }
    );
  };

  onSpinPress() {
    this.spin = !this.spin;
  }

  onCancelPress() {
    this.setState({ searchModalVisible: false });
  }

  onAssetPress(asset) {
    this.setState({ currentAsset: asset, searchModalVisible: false });
  }

  onSearchModalPress() {
    this.setState({ searchModalVisible: true });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <GraphicsView
          style={{ flex: 1 }}
          onContextCreate={this.onContextCreate}
          onRender={this.onRender}
          onResize={this.onResize}
          isArEnabled
          //isArRunningStateEnabled
          isArCameraStateEnabled
          arTrackingConfiguration={AR.TrackingConfiguration.World}
        />

        <View
          style={{
            bottom: 0,
            flex: 1,
            flexDirection: 'row',
            position: 'absolute'
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <Icon.Button
              name="plus"
              size={40}
              backgroundColor="transparent"
              onPress={this.onAddThreeModelPress}
            />
            <Icon.Button
              name="rotate-left"
              size={40}
              backgroundColor="transparent"
              onPress={this.onSpinPress}
            />
            <Icon.Button
              name="magnify"
              size={40}
              backgroundColor="transparent"
              onPress={this.onSearchModalPress}
            />
          </View>
        </View>

        <Modal visible={this.state.searchModalVisible} animationType="slide">
          <SearchPolyAsset
            googlePoly={this.googlePoly}
            onCancelPress={this.onCancelPress}
            onAssetPress={this.onAssetPress}
          />
        </Modal>
      </View>
    );
  }
}
