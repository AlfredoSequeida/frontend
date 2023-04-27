import { useState, useRef, useContext } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTailwind } from "tailwind-rn";

import { addressDetailsContext } from "../contexts/AddressContext";

import FoodTypes from "../screens/foodTypes";
import SearchBar from "./searchBar";
import ModalView from "./modal";

const Header = ({ setPopularRestaurants }) => {
  const navigation = useNavigation();
  const tailwind = useTailwind();

  const [visible, setVisible] = useState(false);
  const [foodTypeScreen, showFoodTypeScreen] = useState(false);
  const address = useContext(addressDetailsContext);
  console.log(
    address[0]?.address?.address1 === "Set Location" ||
      !address[0]?.address?.address1
  );

  const foodTypesRef = useRef(null);

  return (
    <View>
      {address[0]?.address?.address1 != "Set Location" ||
      !address[0]?.address?.address1 ? (
        <>
          <ModalView
            visible={visible}
            setVisible={setVisible}
            setPopularRestaurants={setPopularRestaurants}
          />
          <View style={tailwind("flex flex-row justify-between mb-4")}>
            <View>
              <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                <Image
                  style={tailwind("h-14 w-36")}
                  resizeMode="contain"
                  source={require("../assets/logos/logo.png")}
                />
              </TouchableOpacity>
            </View>
            <View style={tailwind("flex flex-row")}>
              <TouchableOpacity onPress={() => navigation.navigate("Checkout")}>
                <Image
                  style={tailwind("w-10 h-10 mr-4")}
                  resizeMode="contain"
                  source={require("../assets/icons/black/cart.png")}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Image
                  style={tailwind("w-10 h-10 rounded-full")}
                  resizeMode="contain"
                  source={require("../assets/icons/black/user.png")}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={tailwind("my-2")}>
            <Text style={tailwind("text-2xl font-bold")}>
              Give yourself a treat!🥘
            </Text>
          </View>

          <View style={tailwind("flex flex-row")}>
            <TouchableOpacity
              // Shows up the modal for the location setup when clicked on the location button
              onPress={() => setVisible(true)}
              style={tailwind("flex-row")}
            >
              <Image
                style={tailwind("w-4 h-4")}
                resizeMode="contain"
                source={require("../assets/icons/black/location.png")}
              />
              <Text style={tailwind("font-light ml-2")}>
                {/* {address?.address?.address1} */}
                {address[0].address.address1}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={tailwind("flex flex-row items-center")}>
            <SearchBar
              isFoodTypesOpen={foodTypeScreen}
              openFoodTypes={showFoodTypeScreen}
            />
          </View>

          {foodTypeScreen ? (
            <View ref={foodTypesRef}>
              <FoodTypes closeFoodTypes={() => showFoodTypeScreen(false)} />
            </View>
          ) : (
            <View
              style={[
                tailwind("flex flex-row justify-between"),
                {
                  alignItems: "center",
                  alignContent: "center",
                  paddingBottom: 15,
                },
              ]}
            ></View>
          )}
        </>
      ) : (
        <></>
      )}
    </View>
  );
};

export default Header;
