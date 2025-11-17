import { AbsoluteView } from "@/components/common/AbsoluteView";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { FixedView } from "@/components/common/FixedView";
import { IconButton } from "@/components/common/IconButton";
import { SafeView } from "@/components/common/SafeView";
import {
  SwipeableCard,
  SwipeableCardRef,
} from "@/components/swipe/SwipeableCard";
import { Colors } from "@/constants/theme";
import { useSuggestions } from "@/contexts/SuggestionsContext";
import { useSurvey } from "@/contexts/SurveyContext";
import { useToast } from "@/contexts/ToastContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Swipe() {
  const router = useRouter();
  const { choices } = useSurvey();
  const { handleStartOver } = useSurvey();
  const { isLoading, suggestions, currentIndex, fetchSuggestions, error } =
    useSuggestions();
  const { displayToast } = useToast();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const cardRef = useRef<SwipeableCardRef>(null);

  useEffect(() => {
    if (choices.length === 0) {
      router.navigate("/survey");
      return;
    }

    if (suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [suggestions.length]);

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
      router.navigate("/survey");
    }
  }, [error]);

  const currentSuggestion =
    suggestions.length > 0 ? suggestions[currentIndex] : null;

  const handleSkip = () => {
    cardRef.current?.swipeLeft();
  };

  const handleProceed = () => {
    cardRef.current?.swipeRight();
  };

  const handleViewMore = () => {
    setIsModalVisible(true);
  };

  const handleBack = () => {
    handleStartOver();
    router.navigate("/survey");
  };

  return (
    <FixedView className='h-screen w-screen bg-neonGreen'>
      <AnimatedBackground />
      <SafeView className='h-full w-full justify-center items-center'>
        {isLoading ? (
          <>
            <AbsoluteView top={16} left={16}>
              <IconButton
                onPress={handleBack}
                icon='arrow-back'
                variant='white'
                size='sm'
              />
            </AbsoluteView>
            <View className='items-center gap-4'>
              <ActivityIndicator color={Colors.black} />
              <Text className='text-3xl font-groen font-semibold text-black'>
                Finding yo' spots...
              </Text>
            </View>
          </>
        ) : (
          <View className='h-full w-full flex-1 flex-col'>
            {currentSuggestion && (
              <>
                <View className='flex-row justify-start items-center gap-6 px-4 pt-4'>
                  <IconButton
                    onPress={handleBack}
                    size='sm'
                    icon='arrow-back'
                  />
                </View>
                <View className='flex-1'>
                  <SwipeableCard
                    ref={cardRef}
                    key={`swipeable-card-${currentIndex}`}
                    suggestion={currentSuggestion}
                  />
                </View>
                <View className='flex-row justify-center items-center gap-6 px-8 pt-4 pb-8'>
                  <IconButton
                    onPress={handleSkip}
                    icon='close'
                    variant='pink'
                  />
                  <IconButton
                    onPress={handleViewMore}
                    icon='eye'
                    variant='white'
                  />
                  <IconButton
                    onPress={handleProceed}
                    icon='checkmark'
                    variant='black'
                  />
                </View>
              </>
            )}
          </View>
        )}
      </SafeView>
      <Modal
        visible={isModalVisible}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className='flex-1 bg-white'>
          <SafeView className='flex-1'>
            <View className='flex-row justify-between items-center p-4 border-b border-gray-200'>
              <Text className='text-2xl font-groen font-bold text-black'>
                {currentSuggestion?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className='w-10 h-10 items-center justify-center'
              >
                <Ionicons name='close' size={28} color={Colors.black} />
              </TouchableOpacity>
            </View>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
              {currentSuggestion && (
                <View className='p-6 gap-6'>
                  {currentSuggestion.photos.length > 0 && (
                    <View className='gap-4'>
                      <View className='flex-row items-center justify-between'>
                        <Text className='text-xl font-groen font-semibold text-black'>
                          ⭐ {currentSuggestion.rating}
                        </Text>
                        {currentSuggestion.distanceInKm && (
                          <Text className='text-lg text-black opacity-70'>
                            {currentSuggestion.distanceInKm.toFixed(1)} km away
                          </Text>
                        )}
                      </View>
                      {currentSuggestion.priceLevel && (
                        <Text className='text-lg text-black opacity-70'>
                          Price: {"$".repeat(currentSuggestion.priceLevel)}
                        </Text>
                      )}
                    </View>
                  )}
                  <View className='gap-2'>
                    <Text className='text-lg font-groen font-semibold text-black'>
                      Address
                    </Text>
                    <Text className='text-base text-black opacity-70'>
                      {currentSuggestion.address}
                    </Text>
                  </View>
                  {currentSuggestion.description && (
                    <View className='gap-2'>
                      <Text className='text-lg font-groen font-semibold text-black'>
                        Description
                      </Text>
                      <Text className='text-base text-black opacity-80'>
                        {currentSuggestion.description}
                      </Text>
                    </View>
                  )}
                  {currentSuggestion.openingHours && (
                    <View className='gap-2'>
                      <Text className='text-lg font-groen font-semibold text-black'>
                        Opening Hours
                      </Text>
                      {(currentSuggestion.openingHours.opensAt ||
                        currentSuggestion.openingHours.closesAt) && (
                        <View className='flex-row items-center justify-between'>
                          {currentSuggestion.openingHours.opensAt && (
                            <Text className='text-base text-black opacity-70'>
                              Opens at {currentSuggestion.openingHours.opensAt}
                            </Text>
                          )}
                          {currentSuggestion.openingHours.closesAt && (
                            <Text className='text-base text-black opacity-70'>
                              Closes at{" "}
                              {currentSuggestion.openingHours.closesAt}
                            </Text>
                          )}
                        </View>
                      )}
                      {currentSuggestion.openingHours.weekdayText && (
                        <View className='mt-2 gap-1'>
                          {currentSuggestion.openingHours.weekdayText.map(
                            (day, idx) => (
                              <Text
                                key={idx}
                                className='text-sm text-black opacity-70'
                              >
                                {day}
                              </Text>
                            )
                          )}
                        </View>
                      )}
                    </View>
                  )}
                  {currentSuggestion.types.length > 0 && (
                    <View className='gap-2'>
                      <Text className='text-lg font-groen font-semibold text-black'>
                        Categories
                      </Text>
                      <View className='flex-row flex-wrap mt-2'>
                        {currentSuggestion.types
                          .filter((type) => type !== "establishment")
                          .map((type, idx) => (
                            <View
                              key={idx}
                              className='bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2'
                            >
                              <Text className='text-xs text-black capitalize'>
                                {type.replace(/_/g, " ")}
                              </Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </SafeView>
        </View>
      </Modal>
    </FixedView>
  );
}
