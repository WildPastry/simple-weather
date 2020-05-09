// imports
import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import configData from './data/config.json';
import Header from './screens/Header';
import Current from './screens/Current';
import Week from './screens/Week';
import Footer from './screens/Footer';
import colours from './assets/colours.json';
import temperatures from './assets/temperatures.json';
import LottieView from 'lottie-react-native';

// firebase
import * as firebase from 'firebase';
import { withFirebaseHOC } from './config/Firebase';
import Firebase, { FirebaseProvider } from './config/Firebase';
import 'firebase/firestore';
import 'firebase/auth';

// firebase globals
import { decode, encode } from 'base-64'
if (!global.btoa) { global.btoa = encode }
if (!global.atob) { global.atob = decode }

// set up auth keys
const open = configData.OPEN;
const sky = configData.SKY;

// get device width
const window = Dimensions.get('window');

// set up image display variables
let imageBg;

// START App
class App extends Component {
  // control requests
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      // loading screen
      isLoaded: false,
      // fonts
      fontLoaded: false,
      // sky weather
      skyWeather: [],
      // open weather daily data array
      weather: [],
      // open weather current data array and id
      openWeather: [],
      openWeatherId: null,
      // error message
      errorMessage: null,
      // current weather and location data
      currentIcon: '',
      currentLat: null,
      currentLng: null,
      currentLocation: null,
      // weather and location data
      location: '',
      desc: '',
      temp: '',
      high: '',
      low: '',
      humidity: '',
      wind: '',
      icon: '',
      sunset: '',
      // colour background
      weekBg: null,
      weekBarBg: null,
      // night or day
      night: false
    };
    // bind functions to state
    this.handleLoaded = this.handleLoaded.bind(this);
    this.updateSkyData = this.updateSkyData.bind(this);
    this.getSkyData = this.getSkyData.bind(this);
    this.nightOrDay = this.nightOrDay.bind(this);
    this.setBgDay = this.setBgDay.bind(this);
    this.setBgNight = this.setBgNight.bind(this);
    this.fallback = this.fallback.bind(this);
  }

  // handle loading
  handleLoaded = () => {
    console.log('Inside handleLoaded from App.js...');
    this.setState({
      isLoaded: true
    }, () => {
      console.log('App loaded: ' + this.state.isLoaded);
    });
  }

  // update sky data function
  updateSkyData(val) {
    console.log('Inside updateSkyData from App.js...');
    console.log(val);
    this.setState({
      isLoaded: false,
      currentLat: val['googleLat'],
      currentLng: val['googleLng'],
      currentLocation: val['googleName']
    },
      // call sky data function with new values
      this.getSkyData);
  }

  // fallback function
  fallback() {
    this.setState({
      // fallback
      currentLocation: 'Wellington, New Zealand',
      currentLat: -41.2865,
      currentLng: 174.7762
    }, this.getSkyData);
  }

  // START component mounted
  componentDidMount() {
    // set component mounted
    this._isMounted = true;
    console.log('Inside componentDidMount from App.js: Mounted = ' + this._isMounted);
    // check firebase for user
    var user = firebase.auth().currentUser;
    if (user) {
      // user is signed in
      // load firebase data
      const db = firebase.firestore();
      const dbRT = firebase.database();
      const ref = dbRT.ref(user.uid);
      const homeRef = ref.child("home");
      var docRef = db.collection("users").doc(user.uid);
      // check if the signed in user has data saved
      docRef.get().then(function (doc) {
        if (doc.exists) {
          console.log("User", doc.data().name, "is logged in");
        } else {
          console.log("No docs exist...");
        }
      }).catch(function (error) {
        console.log("Error getting document:", error);
      });
      // get signed in users saved data on load
      homeRef.on('value', snapshot => {
        if (snapshot.exists()) {
          let home = snapshot.val();
          console.log(home);
          var homeLat = home.lat;
          var homeLng = home.lng;
          var homeLocation = home.location;
          this.setState({
            currentLat: homeLat,
            currentLng: homeLng,
            currentLocation: homeLocation
          }, this.getSkyData);
        } else {
          console.log('No home saved...');
        }
      })
      // no user
    } else {
      console.log('No user is currently logged in...');
      // run fallback function
      this.fallback();
    }
  }
  // END component mounted

  // START sky data function
  getSkyData() {
    var myLat = this.state.currentLat;
    var myLng = this.state.currentLng;
    console.log('FROM getSkyData (App.js) ' + myLat);
    console.log('FROM getSkyData (App.js) ' + myLng);
    // fetch sky data
    fetch(
      'https://api.darksky.net/forecast/' +
      sky +
      '/' +
      myLat +
      ',' +
      myLng +
      '?units=ca'
    )
      // log HTTP response error or success for data call
      .then((res) => {
        if (!res.ok) {
          throw new Error('DarkSky Failed with HTTP code ' + res.status);
        } else {
          console.log('DarkSky Success with HTTP code ' + res.status);
        }
        return res;
      })
      // convert raw data call into json
      .then((result) => result.json())
      .then((skyData) => {
        if (this._isMounted) {
          this.setState({
            skyWeather: skyData,
            temp: Math.round(skyData.currently.temperature),
            high: Math.round(skyData.daily.data[0].temperatureMax),
            low: Math.round(skyData.daily.data[0].temperatureMin)
          });
          // currentTemp = Math.round(skyData.currently.temperature);
        }
      });
    // daily weather data
    fetch(
      'https://api.openweathermap.org/data/2.5/forecast?lat=' +
      myLat +
      '&lon=' +
      myLng +
      '&units=metric&APPID=' +
      open
    )
      // log HTTP response error or success for data call
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            'Open Weather DAILY Failed with HTTP code ' + res.status
          );
        } else {
          console.log(
            'Open Weather DAILY Success with HTTP code ' + res.status
          );
        }
        return res;
      })
      // convert raw data call into json
      .then((result) => result.json())
      .then((data) => {
        if (this._isMounted) {
          this.setState({
            weather: data
          });
        }
        // current weather data
        fetch(
          'https://api.openweathermap.org/data/2.5/weather?lat=' +
          myLat +
          '&lon=' +
          myLng +
          '&units=metric&APPID=' +
          open
        )
          // log HTTP response error or success for data call
          .then((res) => {
            if (!res.ok) {
              throw new Error(
                'Open Weather CURRENT Failed with HTTP code ' + res.status
              );
            } else {
              console.log(
                'Open Weather CURRENT Success with HTTP code ' + res.status
              );
            }
            return res;
          })
          // convert raw data call into json
          .then((openResponse) => openResponse.json())
          .then((openResponseJson) => {
            if (this._isMounted) {
              this.setState(
                {
                  // weather wrapper
                  openWeather: openResponseJson,
                  // icon id
                  openWeatherId: openResponseJson.weather[0].id,
                  // weather and location data
                  desc: openResponseJson.weather[0].description,
                  humidity: openResponseJson.main.humidity,
                  wind: openResponseJson.wind.speed,
                  icon: openResponseJson.weather[0].icon,
                  sunset: openResponseJson.sys.sunset
                },
                () => {
                  this.nightOrDay();
                }
              );
            }
          });
      })
      // catch and log errors
      .catch((error) => {
        if (error.res) {
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('error ', error.message);
        }
        console.log(error.config);
      });
  }
  // END sky data fucntion

  // check night or day function
  nightOrDay() {
    console.log('Icon = ' + this.state.icon + ' from App.js');
    // night icon conditions
    var conditions = ["01n", "02n", "03n", "04n", "09n", "10n", "11n", "13n", "50n"];
    // loop conditions
    var checkNight = conditions.some(e => this.state.icon.includes(e));
    console.log('Night = ' + checkNight + ' from App.js');
    // apply function based on result
    checkNight ? (this.setState({ night: true }), this.setBgNight()) :
      (this.setState({ night: false }), this.setBgDay());
  }

  // night colour bg logic
  setBgNight() {
    console.log('Night function running...');
    imageBg = colours.night;
    this.setState({
      weekBg: colours.night,
      weekBarBg: colours.nightDark
    });
    this.handleLoaded();
  }

  // day colour bg logic
  setBgDay() {
    // console.log(this.state.temp);

    let currentBg;
    let currentBarBg;
    var currentTemp = this.state.temp;
    console.log('Day function running...');
    console.log(currentTemp + ' From day function');

    if (currentTemp <= -20) {
      currentBg = temperatures.tempBelow20;
      currentBarBg = temperatures.tempBelow20d;
    } else if ((currentTemp <= -10) && (currentTemp > -20)) {
      currentBg = temperatures.tempBelow10;
      currentBarBg = temperatures.tempBelow10d;
    } else if (currentTemp === 0) {
      currentBg = temperatures.temp0;
      currentBarBg = temperatures.temp0d;
    } else if (currentTemp === 1) {
      currentBg = temperatures.temp1;
      currentBarBg = temperatures.temp1d;
    } else if (currentTemp === 2) {
      currentBg = temperatures.temp2;
      currentBarBg = temperatures.temp2d;
    } else if (currentTemp === 3) {
      currentBg = temperatures.temp3;
      currentBarBg = temperatures.temp3d;
    } else if (currentTemp === 4) {
      currentBg = temperatures.temp4;
      currentBarBg = temperatures.temp4d;
    } else if (currentTemp === 5) {
      currentBg = temperatures.temp5;
      currentBarBg = temperatures.temp5d;
    } else if (currentTemp === 6) {
      currentBg = temperatures.temp6;
      currentBarBg = temperatures.temp6d;
    } else if (currentTemp === 7) {
      currentBg = temperatures.temp7;
      currentBarBg = temperatures.temp7d;
    } else if (currentTemp === 8) {
      currentBg = temperatures.temp8;
      currentBarBg = temperatures.temp8d;
    } else if (currentTemp === 9) {
      currentBg = temperatures.temp9;
      currentBarBg = temperatures.temp9d;
    } else if (currentTemp === 11) {
      currentBg = temperatures.temp11;
      currentBarBg = temperatures.temp11d;
    } else if (currentTemp === 12) {
      currentBg = temperatures.temp12;
      currentBarBg = temperatures.temp12d;
    } else if (currentTemp === 13) {
      currentBg = temperatures.temp13;
      currentBarBg = temperatures.temp13d;
    } else if (currentTemp === 14) {
      currentBg = temperatures.temp14;
      currentBarBg = temperatures.temp14d;
    } else if (currentTemp === 15) {
      currentBg = temperatures.temp15;
      currentBarBg = temperatures.temp15d;
    } else if (currentTemp === 16) {
      currentBg = temperatures.temp16;
      currentBarBg = temperatures.temp16d;
    } else if (currentTemp === 17) {
      currentBg = temperatures.temp17;
      currentBarBg = temperatures.temp17d;
    } else if (currentTemp === 18) {
      currentBg = temperatures.temp18;
      currentBarBg = temperatures.temp18d;
    } else if (currentTemp === 19) {
      currentBg = temperatures.temp19;
      currentBarBg = temperatures.temp19d;
    } else if (currentTemp === 20) {
      currentBg = temperatures.temp20;
      currentBarBg = temperatures.temp20d;
    } else if (currentTemp === 21) {
      currentBg = temperatures.temp21;
      currentBarBg = temperatures.temp21d;
    } else if (currentTemp === 22) {
      currentBg = temperatures.temp22;
      currentBarBg = temperatures.temp22d;
    } else if (currentTemp === 23) {
      currentBg = temperatures.temp23;
      currentBarBg = temperatures.temp23d;
    } else if (currentTemp === 24) {
      currentBg = temperatures.temp24;
      currentBarBg = temperatures.temp24d;
    } else if (currentTemp === 25) {
      currentBg = temperatures.temp25;
      currentBarBg = temperatures.temp25d;
    } else if (currentTemp === 26) {
      currentBg = temperatures.temp26;
      currentBarBg = temperatures.temp26d;
    } else if (currentTemp === 27) {
      currentBg = temperatures.temp27;
      currentBarBg = temperatures.temp27d;
    } else if (currentTemp === 28) {
      currentBg = temperatures.temp28;
      currentBarBg = temperatures.temp28d;
    } else if (currentTemp === 29) {
      currentBg = temperatures.temp29;
      currentBarBg = temperatures.temp29d;
    } else if ((currentTemp >= 40) && (currentTemp < 50)) {
      currentBg = temperatures.tempAbove40;
      currentBarBg = temperatures.tempAbove40d;
    } else if (currentTemp >= 50) {
      currentBg = temperatures.tempAbove50;
      currentBarBg = temperatures.tempAbove50d;
    }
    
    imageBg = currentBg;

    this.setState({
      weekBg: currentBg,
      weekBarBg: currentBarBg
    });

    //  run app loaded function
    this.handleLoaded();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // START render App
  render() {
    // declare loading variables in current state
    var { isLoaded } = this.state;

    // START loading function
    if (!isLoaded) {
      console.log('Inside RENDER NOT COMPLETE from App.js...');
      return (
        // START loading display
        <View style={appStyles.loader}>
          <LottieView
            style={{
              height: 250,
              width: 250,
            }}
            ref={animation => {
              this.animation = animation;
            }}
            source={require('./assets/animations/loader.json')}
            autoPlay={true}
          />
        </View>
        // END loading display
      );
      // END loading function
    } else {
      console.log('Inside RENDER COMPLETE from App.js...');
      return (
        // START main container
        <View
          keyboardShouldPersistTaps='handled'
          style={{ alignItems: 'center', backgroundColor: colours.spotGreyMed, flex: 1 }}>
          {/* top bar */}
          <View style={{ height: 22 }} />
          <ScrollView
            loop={false}
            width={window.width}
            keyboardShouldPersistTaps='handled'
            showsButtons={false}
            horizontal={false}
            showsPagination={false}>
            {/* header */}
            <FirebaseProvider value={Firebase}>
              <Header
                navigation={this.props.navigation}
                currentLocation={this.state.currentLocation}
                updateSkyData={this.updateSkyData}
                currentLat={this.state.currentLat}
                currentLng={this.state.currentLng}
              />
              {/* current */}
              <View style={{ backgroundColor: imageBg }}>
                <Current
                  navigation={this.props.navigation}
                  keyboardShouldPersistTaps='handled'
                  weatherCode={this.state.openWeatherId}
                  currentBg={this.state.weekBarBg}
                  updateSkyData={this.updateSkyData}
                  errorMessage={this.state.errorMessag}
                  currentLocation={this.state.currentLocation}
                  currentLat={this.state.currentLat}
                  currentLng={this.state.currentLng}
                  wind={this.state.wind}
                  humidity={this.state.humidity}
                  temp={this.state.temp}
                  high={this.state.high}
                  low={this.state.low}
                  desc={this.state.desc}
                  icon={this.state.icon}
                  sunset={this.state.sunset}
                  night={this.state.night}
                  skyWeather={this.state.skyWeather}
                />
              </View>
            </FirebaseProvider>
            {/* week */}
            <Week
              style={{ backgroundColor: imageBg }}
              weekBg={this.state.weekBg}
              weekBarBg={this.state.weekBarBg}
              weatherCode={this.state.openWeatherId}
              weather={this.state.weather.list}
              skyWeather={this.state.skyWeather.daily.data}
            />
            {/* footer */}
            <Footer />
          </ScrollView>
        </View>
        // END main container
      );
    }
  }
  // END render App
}
// END App

export default withFirebaseHOC(App);

// register button functionality
AppRegistry.registerComponent('basic-weather', () => ButtonBasics);

// register swiper functionality
AppRegistry.registerComponent('basic-weather', () => SwiperComponent);

// style
const appStyles = StyleSheet.create({
  loader: {
    alignItems: 'center',
    backgroundColor: colours.spotGreyMed,
    flex: 1,
    justifyContent: 'center'
  }
});