import { ShareModal, ShareModalRef } from "@/components/common/share-modal";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import * as MediaLibrary from "expo-media-library";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, Share } from "react-native";

interface ShareContextType {
  shareSuggestion: (suggestion: Suggestion, currentPhotoIndex: number) => void;
  getPhotoIndex: (suggestionId: string) => number;
  isSharing: boolean;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

interface ShareProviderProps {
  children: ReactNode;
  getPhotoUri: (suggestionId: string, photoName: string) => string | undefined;
}

export function ShareProvider({ children, getPhotoUri }: ShareProviderProps) {
  const { displayToast } = useToast();
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(
    null
  );
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
  const photoIndicesRef = useRef<Record<string, number>>({});
  const shareModalRef = useRef<ShareModalRef>(null);

  useEffect(() => {
    photoIndicesRef.current = photoIndices;
  }, [photoIndices]);

  const currentPhotoIndex = useMemo(() => {
    return currentSuggestion ? photoIndices[currentSuggestion.id] ?? 0 : 0;
  }, [currentSuggestion, photoIndices]);

  const shareImage = useCallback(async () => {
    try {
      if (!currentSuggestion || !shareModalRef.current) {
        setIsModalVisible(false);
        setIsSharing(false);
        displayToast({ message: "yikes! capture failed" });
        return;
      }

      setIsSharing(true);

      const uri = await shareModalRef.current.capture();

      if (!uri) {
        setIsModalVisible(false);
        setIsSharing(false);
        displayToast({ message: "yikes! capture failed" });
        return;
      }

      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          setIsModalVisible(false);
          setCurrentSuggestion(null);
          displayToast({ message: "oof! permission denied" });
          return;
        }

        await MediaLibrary.saveToLibraryAsync(uri);
        setIsModalVisible(false);
        setCurrentSuggestion(null);
        displayToast({ message: "Saved" });
      } else {
        const result = await Share.share({ url: uri });

        setIsModalVisible(false);
        setCurrentSuggestion(null);

        if (result.action === Share.sharedAction) {
          displayToast({ message: "Shared" });
        } else {
          displayToast({ message: "u cancelled" });
        }
      }
    } catch {
      setIsModalVisible(false);
      setCurrentSuggestion(null);
      displayToast({
        message:
          Platform.OS === "android" ? "oof! save failed" : "oof! share failed",
      });
    } finally {
      setIsSharing(false);
    }
  }, [currentSuggestion, displayToast]);

  const shareLink = useCallback(async () => {
    try {
      if (!currentSuggestion) {
        setIsModalVisible(false);
        setIsSharing(false);
        return;
      }

      setIsSharing(true);

      // TODO: Add back when proper deep linking is implemented
      // const shareUrl = getShareUrl(currentSuggestion.id);
      const shareUrl = currentSuggestion.shareLink;
      const message = `Found our spot: ${currentSuggestion.name}\n\n👉 ${shareUrl}`;

      const shareOptions: {
        message: string;
        title: string;
      } = {
        message,
        title: currentSuggestion.name,
      };

      const result = await Share.share(shareOptions);

      setIsModalVisible(false);
      setCurrentSuggestion(null);

      if (result.action === Share.sharedAction) {
        displayToast({ message: "Shared" });
      } else {
        displayToast({ message: "u cancelled" });
      }
    } catch {
      setIsModalVisible(false);
      setCurrentSuggestion(null);
      displayToast({ message: "oof! share failed" });
    } finally {
      setIsSharing(false);
    }
  }, [currentSuggestion, displayToast]);

  const shareSuggestion = useCallback(
    (suggestion: Suggestion, currentPhotoIndex: number) => {
      setPhotoIndices((prev) => ({
        ...prev,
        [suggestion.id]: currentPhotoIndex,
      }));
      setCurrentSuggestion(suggestion);
      setIsModalVisible(true);
    },
    []
  );

  const getPhotoIndex = useCallback((suggestionId: string) => {
    return photoIndicesRef.current[suggestionId] ?? 0;
  }, []);

  const handleClose = useCallback(() => {
    setIsModalVisible(false);
    setIsSharing(false);
    setCurrentSuggestion(null);
  }, []);

  return (
    <ShareContext.Provider
      value={{
        shareSuggestion,
        getPhotoIndex,
        isSharing,
      }}
    >
      {children}
      <ShareModal
        ref={shareModalRef}
        visible={isModalVisible}
        onClose={handleClose}
        onShareImage={shareImage}
        onShareLink={shareLink}
        suggestion={currentSuggestion}
        currentPhotoIndex={currentPhotoIndex}
        getPhotoUri={getPhotoUri}
      />
    </ShareContext.Provider>
  );
}

export function useShare() {
  const context = useContext(ShareContext);
  if (context === undefined) {
    throw new Error("useShare must be used within a ShareProvider");
  }
  return context;
}
