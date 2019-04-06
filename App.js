/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super();

    this.state = {
      rec: 'blebleble 1.0000',
    };
  }
  render() {
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
        <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
          <Text style={{ fontSize: 14 }}> SNAP </Text>
        </TouchableOpacity>
        {this.state.rec && (
          <View style={styles.label}>
            <Text style={styles.text}>{this.state.rec}</Text>
          </View>
        )}
      </View>
    );
  }

  takePicture = async function() {
    if (this.camera) {
      const options = { quality: 0.5, base64: false };
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
            var options = text.slice(1, text.length - 1).split(',');

            var object = options.map(function(obj) {
              var lines = obj.split('\n');
              return (
                lines[1]
                  .split(':')[1]
                  .trim()
                  .replace(/"/g, '') + lines[2].split(':')[1]
              );
            })[0];
            root.setState({ rec: object });
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
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
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
});
