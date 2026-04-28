import React, { useEffect, useState } from "react";
import { resolveStorageUrlCandidates } from "../../lib/api";

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

  const candidates = resolveStorageUrlCandidates(src);
  const activeSrc = candidates[candidateIndex] || "";

  useEffect(() => {
    setCandidateIndex(0);
  }, [src]);

  if (!activeSrc || candidateIndex >= candidates.length) {
    return <div className={className}>{fallbackLabel}</div>;
  }

  return (
    <img
      className={className}
      src={activeSrc}
      alt={alt}
      onError={() => {
        setCandidateIndex((current) =>
          current + 1 < candidates.length ? current + 1 : current,
        );
      }}
    />
  );
};

export default StorageImage;
