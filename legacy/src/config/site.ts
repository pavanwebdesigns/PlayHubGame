export const SITE_NAME = 'PlayHubPlace';
export const SITE_URL = 'https://playhubplace.com/';
export const DEFAULT_TITLE = 'PlayHubPlace - Free Online Games';
export const DEFAULT_DESCRIPTION = 'PlayHubPlace - Play thousands of free online games instantly.';

/** Replace this sentinel with a real address before the contact link goes live. */
export const CONTACT_EMAIL = 'TODO(Pavan)';

export function contactEmailPublished(): boolean {
  return CONTACT_EMAIL.length > 0 && !CONTACT_EMAIL.startsWith('TODO');
}

export function setDocumentMeta(title: string, description: string): void {
  document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', description);
}
