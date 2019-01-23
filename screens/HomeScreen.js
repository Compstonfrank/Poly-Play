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
// Let's alias ExpoTHREE.AR as ThreeAR so it doesn't collide with Expo.AR.
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
// Let's also import `expo-graphics`
// expo-graphics manages the setup/teardown of the gl context/ar session, creates a frame-loop, and observes size/orientation changes.
// it also provides debug information with `isArCameraStateEnabled`
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
    // This will create a camera texture and use it as the background for our scene
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
    // Now we make a camera that matches the device orientation.
    // Ex: When we look down this camera will rotate to look down too!
    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);

    // Setup a light so we can see the cube color
    // AmbientLight colors all things in the scene equally.
    this.scene.add(new THREE.AmbientLight(0xffffff));

    // Create this cool utility function that let's us see all the raw data points.
    this.points = new ThreeAR.Points();
    // // Add the points to our scene...
    this.scene.add(this.points);
  };

  onResize = ({ x, y, scale, width, height }) => {
    // Let's stop the function if we haven't setup our scene yet
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
    // This will make the points get more rawDataPoints from Expo.AR
    this.points.update();
    // Finally render the scene with the AR Camera
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
