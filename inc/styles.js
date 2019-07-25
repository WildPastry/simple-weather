import { StyleSheet } from "react-native";

// get phone width and height
// const { width, height } = Dimensions.get('window');

// START stylesheet
const myStylesheet = StyleSheet.create({
  // loading page
  loader: {
    alignItems: "center",
    backgroundColor: "#303030",
    flex: 1,
    justifyContent: "center"
  },
  headingLoader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center"
  },

  // main container
  container: {
    alignItems: "center",
    backgroundColor: "#114180",
    flex: 1
    // justifyContent: "center"
  },

  // header component
  headerWrap: {
    alignSelf: "stretch",
    flex: 1
  },
  headerTopBar: {
    backgroundColor: "#66a9d7",
    height: 22,
    marginBottom: 8
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "300",
    textAlign: "center"
  },

  // location component
  locationWrap: {
    alignSelf: "stretch",
    backgroundColor: "#303030",
    flex: 1,
    marginTop: 8
  },
  locationText: {
    color: "#fff",
    fontSize: 20,
    padding: 5,
    textAlign: "center"
  },

  // current component
  currentWrap: {
    alignSelf: "stretch",
    flex: 2,
    backgroundColor: "#303030",
    marginTop: 8
  },
  currentTextWrap: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  currentText: {
    color: "#fff",
    fontSize: 20,
    padding: 5,
    textAlign: "center"
  },

  // week component
  weekWrap: {
    alignSelf: "stretch",
    backgroundColor: "#303030",
    flex: 4,
    marginTop: 8
  },
  weekText: {
    color: "#fff",
    fontSize: 20,
    padding: 5,
    textAlign: "center"
  },

  // footer component
  footerWrap: {
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    marginTop: 8
  },
  footerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "300",
    padding: 5,
    textAlign: "center"
  }

  // button
  // button: {
  //   backgroundColor: "#fff",
  //   borderRadius: 15,
  //   color: "#114180",
  //   marginTop: 20,
  //   padding: 5
  // },
  // buttonBorder: {
  //   borderColor: "#114180",
  //   borderWidth: 1
  // }
});
// END stylesheet

module.exports = myStylesheet;
