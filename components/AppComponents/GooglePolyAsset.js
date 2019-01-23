import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  thumbnail: { width: 170, height: 170, borderRadius: 15 },
  displayName: { fontWeight: 'bold' },
  container: { alignItems: 'center', padding: 10 }
});

export default class GooglePolyAsset extends React.Component {
  static defaultProps = {
    asset: {},
    onPress: asset => {}
  };
  render() {
    return (
      <TouchableOpacity
        onPress={() => this.props.onPress(this.props.asset)}
        style={styles.container}
      >
        <Image
          source={{ uri: this.props.asset.thumbnail.url }}
          style={styles.thumbnail}
        />
        <Text style={styles.displayName}>{this.props.asset.displayName}</Text>
        <Text style={styles.authorName}>{this.props.asset.authorName}</Text>
      </TouchableOpacity>
    );
  }
}
