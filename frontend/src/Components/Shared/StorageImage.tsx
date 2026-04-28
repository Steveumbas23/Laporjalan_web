import React, { useEffect, useState } from "react";
import { resolveStorageUrlCandidates } from "../../lib/api";

const PLACEHOLDER_SRC = "/images/report-placeholder.svg";

type StorageImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
};

const StorageImage: React.FC<StorageImageProps> = ({
  src,
  alt,
  className,
  fallbackLabel = "IMG",
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const candidates = resolveStorageUrlCandidates(src);
  const activeSrc = showPlaceholder
    ? PLACEHOLDER_SRC
    : candidates[candidateIndex] || "";

  useEffect(() => {
    setCandidateIndex(0);
    setShowPlaceholder(false);
  }, [src]);

  if (!activeSrc) {
    return (
      <img
        className={className}
        src={PLACEHOLDER_SRC}
        alt={alt}
        data-fallback-label={fallbackLabel}
      />
    );
  }

  return (
    <img
      className={className}
      src={activeSrc}
      alt={alt}
      onError={() => {
        if (showPlaceholder) {
          return;
        }

        if (candidateIndex + 1 < candidates.length) {
          setCandidateIndex(candidateIndex + 1);
          return;
        }

        setShowPlaceholder(true);
      }}
    />
  );
};

export default StorageImage;
