import React, { useEffect, useState } from "react";
import { Text, useWindowDimensions, View, FlatList } from "react-native";
import { useTailwind } from "tailwind-rn";
import { pure } from "react-recompose";
import PageContainer from "../components/pageContainer";
import { getBreakPoint } from "../utils/screen";
import { MenuCard } from "../components/cards";
import { detailStore } from "../api/detail";

const MenuView = ({ route }) => {
  const tailwind = useTailwind();
  const numColumns = { sm: 2, md: 3, lg: 4, xl: 5 };
  const window = useWindowDimensions();
  const [menuData, setMenuData] = useState();
  const [pageData, setPageData] = useState(
    menuData === undefined ? undefined : [menuData.menu[0]]
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      setMenuData(
        await detailStore({
          postmates: route.params.postmates,
          grubhub: route.params.grubhub,
          doordash: route.params.doordash,
        })
      );
    })();
  }, []);

  useEffect(() => {
    if (menuData != undefined) {
      setPageData([menuData.menu[0]]);
    }
  }, [menuData]);

  return (
    <PageContainer style={tailwind("m-2")}>
      {menuData != undefined ? (
        <>
          <View>
            <Text style={tailwind("text-3xl font-extrabold")}>
              {menuData.name}
            </Text>
          </View>
          <>
            {pageData != undefined ? (
              <FlatList
                data={pageData}
                onEndReached={() => {
                  if (page != menuData.menu.length) {
                    setPage(page + 1);
                    setPageData([...pageData, ...[menuData.menu[page]]]);
                  }
                }}
                renderItem={({ item }) => {
                  return (
                    <>
                      {/* pageData[pageData.length - 1].items.length != 0 */}
                      <Text style={tailwind("font-extrabold text-2xl")}>
                        {item.category}
                      </Text>
                      <FlatList
                        data={item.items}
                        renderItem={({ item }) => {
                          return (
                            <View style={[tailwind("flex flex-1 ")]}>
                              <MenuCard
                                style={tailwind("m-2")}
                                title={item.name}
                                desc={item.description}
                                image={item.image}
                                price={item.prices}
                              />
                            </View>
                          );
                        }}
                        key={getBreakPoint(window.width)}
                        numColumns={numColumns[getBreakPoint(window.width)]}
                        keyExtractor={(_, index) => index}
                      />
                    </>
                  );
                }}
              />
            ) : (
              <></>
            )}
          </>
        </>
      ) : (
        <></>
      )}
    </PageContainer>
  );
};

export default pure(MenuView);
