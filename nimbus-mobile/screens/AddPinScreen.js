import React from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  PickerIOS,
  PickerItemIOS,
  Dimensions,
} from 'react-native';
import Exponent from 'exponent';
import {
  ExponentLinksView,
} from '@exponent/samples';
import { connect } from 'react-redux';
import { ActionCreators } from '../redux/actions/index.js';
import { bindActionCreators } from 'redux';
import { API_URL } from '../environment.js';

var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

class AddPinScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
    }
  }

  static route = {
    navigationBar: {
      title: 'Add a Pin',
    },
  }

  addPinDesc() {
    this.props.navigator.push('addPinDesc', {image: this.state.image});
  }

  render() {
    let { image } = this.state;
    return (
      <View>
        <View style={styles.container}>
          <View style={styles.photoContainer}>
          {image &&
            <Image source={{uri: image}} style={{width: width, height: width}} /> }
          </View>
          <TouchableOpacity style={styles.pickImageContainer} onPress={this._pickImage}>
            <View>
              <Text style={styles.pickImageText}>Camera Roll</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickImageContainer} onPress={this._takePhoto}>
            <View>
              <Text style={styles.pickImageText}>Take a Photo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={this.addPinDesc.bind(this)} style={styles.next} >
          <View>
            <Text style={styles.pickImageText}>Next</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _handleImagePicked = async (pickerResult) => {
    let uploadResponse, uploadResult;

    try {
      if (!pickerResult.cancelled) {
        uploadResponse = await this.uploadImageAsync(pickerResult.uri);
        uploadResult = await uploadResponse.json();

        this.setState({image: uploadResult.location});
      }
    } catch(e) {
      throw e;
      alert('Upload failed, sorry :(');
    }
  }

  uploadImageAsync = async (uri) => {
    let apiUrl = `${API_URL}/upload`;

    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('file', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    let options = {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${this.props.authToken}`,
      },
    };

    return fetch(apiUrl, options);
  }

  _takePhoto = async () => {
    let pickerResult = await Exponent.ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4,3]
    });

    this._handleImagePicked(pickerResult);
  }

  _pickImage = async () => {
    let pickerResult = await Exponent.ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4,3]
    });

    this._handleImagePicked(pickerResult);
  }

  _goBack() {
    this.props.navigator.pop();
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddPinScreen);

function mapStateToProps(state) {
  return {
    authToken: state.userState.currentUser.authToken,
    userId: state.userState.currentUser.userId,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ActionCreators, dispatch);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1972FF',
  },
  pickImageContainer: {
    backgroundColor: '#bcbfc2',
    height: 40,
    width: 350,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#9B9FA4',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  pickImageText: {
    color: 'white',
    fontSize: 16
  },
  photoContainer: {
    width: width,
    height: width,
    margin: 5,
  },
  addPhotoContainer: {
    flex: 5,
    backgroundColor: 'skyblue',
  },
  next: {
    backgroundColor: '#2f95dc',
    height: 60,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    top: 488,
  }
});
