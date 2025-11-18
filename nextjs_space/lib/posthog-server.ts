
import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getPostHogClient() {
  if (!posthogClient) {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    // Return null if placeholders are still in place
    if (!key || key.startsWith('phc_XXXX') || !host) {
      return null;
    }

    posthogClient = new PostHog(key, {
      host: host,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}
