/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ImageSequence from 'react-native-image-sequence';
import {
  greenImages,
  brownImages,
  blueImages,
  grayImages,
  yellowImages,
  elecImages,
} from './Images';

const imagesMap = {
  bio: brownImages,
  elektronika: elecImages,
  'metal-plastik': yellowImages,
  papier: blueImages,
  szklo: greenImages,
  zmieszane: grayImages,
};
type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super();

    this.state = {
      rec: null,
      gif_visible: false,
    };
  }
  render() {
    console.log('hehe');
    console.log(this.state.rec);
    console.log(this.state.gif_visible);
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          permissionDialogTitle={'Permission to use camera'}
          permissionDialogMessage={'We need your permission to use your camera phone'}
          onGoogleVisionBarcodesDetected={({ barcodes }) => {
            console.log(barcodes);
          }}
        />
        <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture} />
        {this.state.rec && (
          <View style={styles.label}>
            <Text style={styles.text}>{this.state.rec}</Text>
          </View>
        )}
        {this.state.gif_visible &&
          imagesMap[this.state.rec] && (
            <View style={styles.gif}>
              <ImageSequence
                images={imagesMap[this.state.rec]}
                framesPerSecond={20}
                style={{ width: 300, height: 300 }}
                loop={false}
              />
            </View>
          )}
      </View>
    );
  }

  takePicture = async function() {
    this.setState({ rec: null });
    if (this.camera) {
      const options = { quality: 0.5, base64: false, fixOrientation: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data);

      var formData = new FormData();
      formData.append('file', {
        uri: data.uri,
        name: 'image.jpg',
        type: 'multipart/form-data',
      });

      console.log(formData);

      const root = this;

      fetch('http://ml.piotrknapczyk.com', {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          var respText = response.text().then(function(text) {
            console.log(text);
            root.setState({ rec: text, gif_visible: true });
            this.setTimeout(() => {
              root.setState({ gif_visible: false });
            }, 3000);
          });
        })
        .then(success => console.log(success))
        .catch(error => console.log(error));
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#fff',
    borderRadius: 45,
    padding: 35,
    borderWidth: 10,
    borderColor: 'rgba(200, 200, 200, 0.85)',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    margin: 20,
  },
  label: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'rgba(52, 52, 52, 0.65)',
    borderRadius: 15,
    color: 'white',
    fontSize: 20,
  },
  gif: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 180,
  },
});
