import { useState } from 'react';

import { toSlug } from '../../utils/slug';

const EXTENSIONS = ['jpg', 'png', 'webp'];

function ImageWithFallback({ folder, slug, alt, className, fallback }) {
    const [extensionIndex, setExtensionIndex] = useState(0);

    if (extensionIndex >= EXTENSIONS.length) {
        return fallback;
    }

    return (
        <img
            className={className}
            src={`/images/${folder}/${slug}.${EXTENSIONS[extensionIndex]}`}
            alt={alt}
            loading="lazy"
            onError={() => setExtensionIndex((index) => index + 1)}
        />
    );
}

// Ảnh nằm ở public/images/<folder>/<slug-của-name>.(jpg|png|webp).
// Không có ảnh thì hiện `fallback` (icon).
function LocalImage({ folder, name, alt = '', className, fallback = null }) {
    const slug = toSlug(name);

    if (!slug) {
        return fallback;
    }

    return (
        <ImageWithFallback
            key={`${folder}/${slug}`}
            folder={folder}
            slug={slug}
            alt={alt}
            className={className}
            fallback={fallback}
        />
    );
}

export default LocalImage;
