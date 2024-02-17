import { StyleSheet, Text, View } from 'react-native';
import colours from '../../../assets/colours.json';

const Header: React.FC = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.brandWrapper}>
        <Text style={styles.brand}>SIMPLE </Text>
        <Text style={styles.brandBlue}>WEATHER</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colours.spotGreyMed
  },
  brandWrapper: {
    fontSize: 18,
    padding: 14,
    textAlign: 'center'
  },
  brand: {
    color: colours.white,
    fontFamily: 'merriWeatherLt'
  },
  brandBlue: {
    color: colours.spotBlue,
    fontFamily: 'merriWeatherBd'
  }
});

export default Header;
