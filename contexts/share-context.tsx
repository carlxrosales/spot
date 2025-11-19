import { ShareModal, ShareModalRef } from "@/components/swipe/share-modal";
import { Suggestion } from "@/data/suggestions";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Share } from "react-native";
import { useToast } from "./toast-context";

interface ShareContextType {
  shareSuggestion: (suggestion: Suggestion) => void;
  isSharing: boolean;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

interface ShareProviderProps {
  children: ReactNode;
}

export function ShareProvider({ children }: ShareProviderProps) {
  const { displayToast } = useToast();
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(
    null
  );
  const shareModalRef = useRef<ShareModalRef>(null);

  const shareImage = useCallback(async () => {
    try {
      if (!currentSuggestion || !shareModalRef.current) {
        setIsModalVisible(false);
        setIsSharing(false);
        displayToast({ message: "Yikes! Capture failed" });
        return;
      }

      setIsSharing(true);

      const uri = await shareModalRef.current.capture();

      if (!uri) {
        setIsModalVisible(false);
        setIsSharing(false);
        displayToast({ message: "Yikes! Capture failed" });
        return;
      }

      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${currentSuggestion.id}`;
      const message = `Found our spot: ${currentSuggestion.name}\n\n👉 ${googleMapsUrl}`;

      const shareOptions: {
        message: string;
        title: string;
        url: string;
      } = {
        message,
        title: currentSuggestion.name,
        url: uri,
      };

      const result = await Share.share(shareOptions);

      setIsModalVisible(false);
      setCurrentSuggestion(null);

      if (result.action === Share.sharedAction) {
        displayToast({ message: "Shared" });
      } else {
        displayToast({ message: "Cancelled" });
      }
    } catch (error) {
      console.error("Share error:", error);
      setIsModalVisible(false);
      setCurrentSuggestion(null);
      displayToast({ message: "Oof! Share failed" });
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

      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${currentSuggestion.id}`;
      const message = `Found our spot: ${currentSuggestion.name}\n\n👉 ${googleMapsUrl}`;

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
        displayToast({ message: "Cancelled" });
      }
    } catch (error) {
      console.error("Share error:", error);
      setIsModalVisible(false);
      setCurrentSuggestion(null);
      displayToast({ message: "Oof! Share failed" });
    } finally {
      setIsSharing(false);
    }
  }, [currentSuggestion, displayToast]);

  const shareSuggestion = useCallback((suggestion: Suggestion) => {
    setCurrentSuggestion(suggestion);
    setIsModalVisible(true);
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
