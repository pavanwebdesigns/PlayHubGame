export async function shareOrCopy(input: {
  title: string;
  url: string;
  text?: string;
}): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: input.title,
        url: input.url,
        text: input.text,
      });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }
  try {
    await navigator.clipboard.writeText(input.text ? `${input.text} ${input.url}` : input.url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
