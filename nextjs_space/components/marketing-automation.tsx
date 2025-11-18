
'use client';

import { AIChatbot } from './ai-chatbot';
import { WelcomePopup } from './welcome-popup';
import { ExitIntentPopup } from './exit-intent-popup';

export function MarketingAutomation() {
  return (
    <>
      <AIChatbot />
      <WelcomePopup />
      <ExitIntentPopup />
    </>
  );
}
