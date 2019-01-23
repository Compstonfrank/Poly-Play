import React from 'react';
import {
  View,
  Button,
  ScrollView,
  TextInput,
  Text,
  StyleSheet
} from 'react-native';
import GooglePolyAsset from './GooglePolyAsset';
import { MaterialCommunityIcons as Icon } from 'react-native-vector-icons';

export default class SearchPolyAsset extends React.Component {
  static defaultProps = {
    googlePoly: {},
    onCancelPress: function() {},
    onAssetPress: function(asset) {}
  };

  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      currentResults: this.props.googlePoly.currentResults
    };
  }

  onSearchChangeText = text => {
    this.setState({ searchQuery: text });
  };

  onLoadMorePress = () => {
    this.props.googlePoly.getSearchResults().then(
      function(assets) {
        this.setState({
          currentResults: this.props.googlePoly.currentResults
        });
      }.bind(this)
    );
  };

  onSearchPress = () => {
    let keywords = this.state.searchQuery;
    this.props.googlePoly.setSearchParams(keywords);
    this.props.googlePoly.getSearchResults().then(
      function(assets) {
        this.setState({
          currentResults: this.props.googlePoly.currentResults
        });
      }.bind(this)
    );
  };

  renderCurrentResults = () => {
    if (this.state.currentResults.length === 0) {
      return (
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Text fontSize={30}>No Results</Text>
        </View>
      );
    }
    let results = [];
    for (let i = 0; i < this.state.currentResults.length; i += 2) {
      if (i === this.state.currentResults.length - 1) {
        results.push(
          <GooglePolyAsset
            onPress={this.props.onAssetPress}
            key={i}
            asset={this.state.currentResults[i]}
          />
        );
        break;
      }
      results.push(
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <GooglePolyAsset
            onPress={this.props.onAssetPress}
            key={i}
            asset={this.state.currentResults[i]}
          />
          <GooglePolyAsset
            onPress={this.props.onAssetPress}
            key={i + 1}
            asset={this.state.currentResults[i + 1]}
          />
        </View>
      );
    }
    return <View style={{ alignItems: 'center', flex: 1 }}>{results}</View>;
  };

  renderLoadMoreButton = () => {
    return !this.props.googlePoly.nextPagetoken ? (
      <View />
    ) : (
      <Button title="Load More..." onPress={this.onLoadMorePress} />
    );
  };

  renderSearchInput = () => {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          value={this.state.searchQuery}
          onChangeText={this.onSearchChangeText}
          placeholder="Search..."
          style={styles.searchTextInput}
          onSubmitEditing={this.onSearchPress}
        />
        <Button title="Cancel" onPress={this.props.onCancelPress} />
      </View>
    );
  };

  render() {
    return (
      <ScrollView>
        {this.renderSearchInput()}
        <View style={{ flex: 1, padding: 3 }}>
          <Button title="Search" onPress={this.onSearchPress} />
        </View>
        {this.renderCurrentResults()}
        {this.renderLoadMoreButton()}
        <View style={{ paddingTop: 20 }} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15
  },
  searchTextInput: {
    borderWidth: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    width: '75%'
  }
});
