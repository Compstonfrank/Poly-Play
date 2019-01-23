import Axios from 'axios';
import AssetUtils from 'expo-asset-utils';
import * as THREE from 'three';
import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader';
import ExpoTHREE from 'expo-three';
// require('../util/MTLloader');
// require('../util/OBJloader');

export default class GogglePoly {
  constructor(apikey) {
    this.apikey = apikey;
    this.currentResults = [];
    this.nextPagetoken = '';
    this.keyword = '';
  }

  static getQueryUrl(apikey, keyword, nextPagetoken) {
    //request URL GET https://poly.googleapis.com/v1/assets?keywords=dog&key={YOUR_API_KEY}
    let baseURL = 'https://poly.googleapis.com/v1/assets?';
    let url = baseURL + 'key=' + apikey;
    url += '&pageSize=20';
    url += '&maxComplexity=MEDIUM';
    url += '&format=OBJ';
    if (keyword) {
      url += '&keywords=' + encodeURIComponent(keyword);
    }
    if (nextPagetoken) {
      url += '&pageToken=' + nextPagetoken;
    }
    return url;
  }

  setSearchParams(keyword) {
    this.currentResults = [];
    this.nextPagetoken = '';
    this.keyword = keyword;
  }

  async getSearchResults() {
    let url = GogglePoly.getQueryUrl(
      this.apikey,
      this.keyword,
      this.nextPagetoken
    );
    const response = await fetch(url);
    const assets = response._bodyInit;
    const newResponse = JSON.parse(assets);
    this.currentResults = this.currentResults.concat(newResponse.assets);
    this.nextPagetoken = newResponse.nextPageToken;
    return newResponse.assets;
  }

  static getThreeModel(objectData, success, failure) {
    if (!failure) {
      failure = function() {};
    }
    if (!success) {
      failure = function() {};
    }
    if (!objectData) {
      failure('Object Data is Null');
      return;
    }

    //search for a format
    let format = objectData.formats.find(format => format.formatType === 'OBJ');
    if (format === undefined) {
      failure('No format found.');
      return;
    }
    //search for a resource
    let obj = format.root;
    let mtl = format.resources.find(resource => {
      return resource.url.endsWith('mtl');
    });
    let texture = format.resources.find(resource =>
      resource.url.endsWith('png')
    );
    let path = obj.url.slice(0, obj.url.indexOf(obj.relativePath));

    //load the MTL
    var mtlLoader = new MTLLoader();
    mtlLoader.setCrossOrigin(true);
    //mtlLoader.setResourcePath(path);
    mtlLoader.load(mtl.url, function(materials) {
      materials.preload();
      //load the obj
      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(obj.url, async function(object) {
        //if there is a texture, then apply it...
        if (texture !== undefined) {
          let textureUri = await AssetUtils.uriAsync(texture.url);
          let tex = new THREE.MeshBasicMaterial({
            map: await ExpoTHREE.loadAsync(textureUri)
          });
          object.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.material = tex;
            }
          });
        }
        //return the obj
        success(object);
      });
    });

    ////////////////////////////////////////////
    // let mtlLoader = new MTLLoader();

    // let objLoader = new OBJLoader();

    // mtlLoader.load(mtl.url, materials => {
    //   mtlLoader.setCrossOrigin(true);
    //   materials.preload();
    //   objLoader.setMaterials(materials);
    //   objLoader.load(obj.url, object => {
    //     success(object);
    //   });
    // });
  }
}
