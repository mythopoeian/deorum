import { browser } from '$app/environment';
import { PORTRAITS_IMAGE_PATH } from '$lib/config';

export const request = async (url: string) => {
  try {
    const res = await fetch(url, {
      headers: { 'content-type': 'application/json' }
    });

    return res.json();
  } catch (error) {
    console.error(error);
  }
};

export function preloadImage({ id, image }: { id: string; image: string }) {
  if (browser) {
    const nextImage = new Image();
    nextImage.fetchPriority = 'low';
    nextImage.src = `${PORTRAITS_IMAGE_PATH}/${id}/${image}`;
  }
}