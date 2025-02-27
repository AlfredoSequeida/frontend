import { useEffect, useState, useContext } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { useTailwind } from "tailwind-rn";
import Toast from "react-native-toast-message";
import { autocompleteLocation } from "../api/autocomplete";
import { detailLocation } from "../api/detail";
import { setLocation } from "../api/set";
import { popularPicks } from "../api/get";
import { getLocalStorage, setLocalStorage } from "../api/localStorage";
import { addressDetailsContext } from "../contexts/AddressContext";
import { AccordionList } from "./lists";
import { CheckBox, RadioButton } from "./buttons";

const LocationModalView = ({ visible, setVisible, setPopularRestaurants }) => {
  const tailwind = useTailwind();
  const window = useWindowDimensions();
  const [addressInput, setAddressInput] = useState("");
  const [addressArray, setAddressArray] = useState([]);
  const address = useContext(addressDetailsContext);

  // Fetch call to the backend to get the autocomplete location
  useEffect(() => {
    autocompleteLocation(addressInput).then((x) => setAddressArray(x));
  }, [addressInput]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setVisible(false);
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            margin: 20,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 35,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 5,
            maxHeight:
              Platform.OS === "web" ? window.height * 0.6 : window.height * 0.4,
            maxWidth: Platform.OS === "web" ? null : window.width * 0.99,
          }}
        >
          <View
            style={[
              tailwind(
                "flex flex-row rounded-full justify-center items-center p-4 mb-4"
              ),
            ]}
          >
            <Image
              style={[
                tailwind("mx-4"),
                { width: window.width * 0.09, height: window.height * 0.06 },
              ]}
              source={require("../assets/icons/black/location.png")}
              resizeMode="contain"
            />
            <TextInput
              style={[
                tailwind("w-full h-full outline-none"),
                { fontSize: window.width * 0.04 },
              ]}
              placeholder="Enter delivery address"
              placeholderTextColor={"#ababab"}
              onChangeText={(text) => setAddressInput(text)}
            />
          </View>
          <FlatList
            style={{
              borderWidth: 1,
              borderRadius: 10,
              minWidth:
                Platform.OS === "web"
                  ? window.width - window.width * 0.3
                  : window.width - window.width * 0.1,
              maxHeight:
                Platform.OS === "web"
                  ? window.height - window.height * 0.3
                  : null,
            }}
            data={addressArray}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={async () => {
                  const detailData = await detailLocation(addressArray[index]);
                  await setLocation(detailData);
                  address[1](detailData);
                  await setLocalStorage("address", detailData);
                  const results = await popularPicks();
                  setPopularRestaurants(results);
                  setVisible(false);
                }}
              >
                <View
                  style={{
                    padding: 10,
                    borderBottomWidth: index === 4 ? 0 : 1,
                  }}
                >
                  <Text style={{ fontSize: 25 }}>
                    {item.addressLine1 + ", " + item.addressLine2}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>
    </Modal>
  );
};

const RecursivePopulation = ({ data }) => {
  const [radioSelect, setRadioSelect] = useState({});
  const [checkboxSelect, setCheckboxSelect] = useState([]);
  const tailwind = useTailwind();
  // if (data.maxPermitted == 1 && data.minPermitted == 1) {
  //   setRequired([...required, { uuid: data.uuid, title: data.title }]);
  // }

  return (
    <>
      {(data?.options?.length || data?.childCustomizationList?.length) &&
      data.maxPermitted == 1 &&
      data.minPermitted == 1 ? (
        <>
          <RadioButton
            data={
              data?.options?.length ? data.options : data.childCustomizationList
            }
            selectedButton={(e) => setRadioSelect(e)}
            deactiveCircleColor="black"
            box
          />

          {radioSelect?.childCustomizationList?.length
            ? radioSelect.childCustomizationList.map((y) => {
                return (
                  <AccordionList
                    title={y.title}
                    key={y.uuid + "4"}
                    listStyle={tailwind("bg-white mt-3.5 rounded")}
                    listBgColor={tailwind("bg-white")}
                  >
                    <RecursivePopulation data={y} key={y.uuid} />
                  </AccordionList>
                );
              })
            : null}
          {radioSelect?.options?.length
            ? radioSelect.options.map((y) => {
                return (
                  <AccordionList
                    title={y.title}
                    key={y.uuid + "3"}
                    listStyle={tailwind("bg-white mt-3.5 rounded")}
                    listBgColor={tailwind("bg-white")}
                  >
                    <RecursivePopulation data={y} key={y.uuid} />
                  </AccordionList>
                );
              })
            : null}
        </>
      ) : (data?.options?.length || data?.childCustomizationList?.length) &&
        data.maxPermitted >= 1 ? (
        <>
          <CheckBox
            data={
              data?.options?.length ? data.options : data.childCustomizationList
            }
            selectedBoxes={(e) => setCheckboxSelect(e)}
            box
            deactiveBoxColor="black"
          />

          {checkboxSelect?.length
            ? checkboxSelect.map((x) => {
                return x?.childCustomizationList?.length
                  ? x.childCustomizationList.map((y) => {
                      return (
                        <AccordionList
                          title={y.title}
                          key={y.uuid + "1"}
                          listStyle={tailwind("bg-white mt-3.5 rounded")}
                          listBgColor={tailwind("bg-white")}
                        >
                          <RecursivePopulation data={y} key={y.uuid} />
                        </AccordionList>
                      );
                    })
                  : null;
              })
            : null}
          {checkboxSelect?.length
            ? checkboxSelect.map((x) => {
                return x?.options?.length
                  ? x.options.map((y) => {
                      return (
                        <AccordionList
                          title={y.title}
                          key={y.uuid + "2"}
                          listStyle={tailwind("bg-white mt-3.5 rounded")}
                          listBgColor={tailwind("bg-white")}
                        >
                          <RecursivePopulation data={y} key={y.uuid} />
                        </AccordionList>
                      );
                    })
                  : null;
              })
            : null}
        </>
      ) : null}
    </>
  );
};

const CustomizationModal = ({ modalVisible, setModalVisible, data }) => {
  const tailwind = useTailwind();
  const [count, setCount] = useState(1);
  const [required, setRequired] = useState([]);

  const handleItemAdd = async () => {
    const menu = await getLocalStorage("cart");
    if (menu) {
      let postmatesIndex = menu.findIndex((item) => {
        return item.service == "postmates";
      });
      let grubhubIndex = menu.findIndex((item) => {
        return item.service == "grubhub";
      });
      let doordashIndex = menu.findIndex((item) => {
        return item.service == "doordash";
      });
      if (data.uuid["postmates"]) {
        let itemIndex = menu[postmatesIndex].items.findIndex((item) => {
          return item.id == data.uuid["postmates"];
        });
        if (itemIndex != -1) {
          menu[postmatesIndex].items[itemIndex].quantity += count;
        } else {
          menu[postmatesIndex].items = [
            ...menu[postmatesIndex].items,
            ...[
              {
                name: data.title,
                image: data.imageUrl,
                price: data.price,
                quantity: count,
                id: data.uuid["postmates"],
              },
            ],
          ];
        }
      } else {
        menu.push({
          service: "postmates",
          items: [
            {
              name: data.title,
              image: data.imageUrl,
              price: data.price,
              quantity: count,
              id: data.uuid["postmates"],
            },
          ],
        });
      }
      if (data.uuid["grubhub"]) {
        let itemIndex = menu[grubhubIndex].items.findIndex((item) => {
          return item.id == data.uuid["grubhub"];
        });
        if (itemIndex != -1) {
          menu[grubhubIndex].items[itemIndex].quantity += count;
        } else {
          menu[grubhubIndex].items = [
            ...menu[grubhubIndex].items,
            ...[
              {
                name: data.title,
                image: data.imageUrl,
                price: data.price,
                quantity: count,
                id: data.uuid["grubhub"],
              },
            ],
          ];
        }
      } else {
        menu.push({
          service: "grubhub",
          items: [
            {
              name: data.title,
              image: data.imageUrl,
              price: data.price,
              quantity: count,
              id: data.uuid["grubhub"],
            },
          ],
        });
      }
      if (data.uuid["doordash"]) {
        let itemIndex = menu[doordashIndex].items.findIndex((item) => {
          return item.id == data.uuid["doordash"];
        });
        if (itemIndex != -1) {
          menu[doordashIndex].items[itemIndex].quantity += count;
        } else {
          menu[doordashIndex].items = [
            ...menu[doordashIndex].items,
            ...[
              {
                name: data.title,
                image: data.imageUrl,
                price: data.price,
                quantity: count,
                id: data.uuid["doordash"],
              },
            ],
          ];
        }
      } else {
        menu.push({
          service: "doordash",
          items: [
            {
              name: data.title,
              image: data.imageUrl,
              price: data.price,
              quantity: count,
              id: data.uuid["doordash"],
            },
          ],
        });
      }
      await setLocalStorage("cart", menu);
    } else {
      let menu = [];
      if (data.uuid["postmates"]) {
        menu.push({
          service: "postmates",
          items: [
            {
              name: data.title,
              image: data.imageUrl,
              price: data.price,
              quantity: count,
              id: data.uuid["postmates"],
            },
          ],
          eta: "5 min",
          deliveryFee: 700,
        });
      }
      if (data.uuid["grubhub"]) {
        menu.push({
          service: "grubhub",
          items: [
            {
              name: data.title,
              image: data.imageUrl,
              price: data.price,
              quantity: count,
              id: data.uuid["grubhub"],
            },
          ],
          eta: "5 min",
          deliveryFee: 700,
        });
      }
      if (data.uuid["doordash"]) {
        menu.push({
          service: "doordash",
          items: [
            {
              name: data.title,
              image: data.imageUrl,
              price: data.price,
              quantity: count,
              id: data.uuid["doordash"],
            },
          ],
          eta: "5 min",
          deliveryFee: 700,
        });
      }
      await setLocalStorage("cart", menu);
    }
    Toast.show({
      type: "success",
      text1: "Item added to cart",
    });
  };

  return (
    <>
      <Toast />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={tailwind("flex flex-1 justify-center items-center")}>
          <View
            style={[
              tailwind("m-10 bg-white p-5 pt-10 rounded-xl items-center h-4/6"),
              {
                height: Platform.OS === "web" ? "75%" : "66.67%",
                width: Platform.OS === "web" ? "60%" : "90%",
                shadowColor: "black",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              },
            ]}
          >
            <Text style={tailwind("font-bold text-xl mb-2")}>{data.title}</Text>

            <ScrollView
              style={[
                tailwind("my-3 rounded-lg"),
                Platform.OS === "web" ? tailwind("w-11/12") : tailwind("w-72"),
              ]}
              indicatorStyle="black"
              showsVerticalScrollIndicator={true}
            >
              {data.customizationsList.map((data, index) => {
                return (
                  <AccordionList
                    title={data.title}
                    key={index}
                    required={
                      data.maxPermitted == 1 && data.minPermitted == 1
                        ? true
                        : false
                    }
                    listBgColor={tailwind("bg-neutral-200")}
                  >
                    <RecursivePopulation
                      data={data}
                      key={index + 1}
                      setRequired={setRequired}
                      required={required}
                    />
                  </AccordionList>
                );
              })}
            </ScrollView>
            <View
              style={[
                tailwind("flex min-w-full flex-row items-center max-h-9"),
                {
                  minWidth: Platform.OS === "web" ? "32%" : "85%",
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text style={tailwind("text-lg font-bold")}>Quantity: </Text>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 100,
                  backgroundColor: "rgba(82, 250, 100, 0.2)",
                }}
                onPress={() => {
                  count == 0 ? setCount(0) : setCount(count - 1);
                }}
              >
                <Image
                  style={tailwind("w-4 h-4")}
                  resizeMode="contain"
                  source={require("../assets/icons/black/minus.png")}
                />
              </TouchableOpacity>
              <Text style={tailwind("text-2xl font-bold mx-3")}>{count}</Text>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 100,
                  backgroundColor: "rgba(82, 250, 100, 0.2)",
                }}
                onPress={() => {
                  setCount(count + 1);
                }}
              >
                <Image
                  style={tailwind("w-4 h-4")}
                  resizeMode="contain"
                  source={require("../assets/icons/black/plus.png")}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                tailwind("flex flex-row justify-center"),
                { minWidth: "100%" },
              ]}
            >
              <Pressable
                style={[
                  tailwind("rounded-3xl p-3 bg-sky-600 m-2"),
                  { elevation: 2 },
                ]}
                onPress={() => handleItemAdd()}
              >
                <Text style={tailwind("text-white font-bold text-center")}>
                  Add to Cart!
                </Text>
              </Pressable>
              <Pressable
                style={[
                  tailwind("rounded-3xl p-3 bg-sky-600 m-2"),
                  { elevation: 2 },
                ]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={tailwind("text-white font-bold text-center")}>
                  Back
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export { LocationModalView, CustomizationModal };
