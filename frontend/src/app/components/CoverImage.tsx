"use client";

import { useState } from "react";
import Image from "next/image";
import PlaceholderCover from "./PlaceholderCover";

interface CoverImageProps {
    src?: string | null;
    alt: string;
    fill?: boolean;
    style?: React.CSSProperties;
    className?: string;
    priority?: boolean;
    unoptimized?: boolean;
    sizes?: string;
}

export default function CoverImage({
    src,
    alt,
    fill = true,
    style,
    className,
    priority = false,
    unoptimized = true,
    sizes
}: CoverImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return <PlaceholderCover />;
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            style={{ objectFit: "cover", ...style }}
            className={className}
            priority={priority}
            unoptimized={unoptimized}
            onError={() => setError(true)}
            sizes={sizes}
        />
    );
}
