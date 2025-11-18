
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { trackRedditEvent } from "@/lib/reddit-tracking";

const TEST_ID = "t2_20lcxjcqah";

const EVENT_TYPES = [
  { value: "SignUp", label: "SignUp" },
  { value: "Lead", label: "Lead" },
  { value: "Purchase", label: "Purchase" },
  { value: "AddToCart", label: "AddToCart" },
  { value: "ViewContent", label: "ViewContent" },
  { value: "custom", label: "Custom Event" },
];

export default function RedditTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const [eventType, setEventType] = useState("SignUp");
  const [customEventName, setCustomEventName] = useState("");
  const [email, setEmail] = useState("test@example.com");
  const [value, setValue] = useState("99.00");
  const [currency, setCurrency] = useState("USD");
  const [testId, setTestId] = useState(TEST_ID);

  const handleSendTestEvent = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const options: any = {
        email,
        testId: testId || undefined,
      };

      if (eventType === "custom" && customEventName) {
        options.customEventName = customEventName;
      }

      if (eventType === "Purchase" || eventType === "AddToCart") {
        options.value = parseFloat(value);
        options.currency = currency;
      }

      // Send the event
      const conversionId = await trackRedditEvent(eventType, options);

      setResult({
        success: true,
        conversionId,
        message: "Test event sent successfully!",
        details: {
          eventType,
          testId: testId || "None (Production Mode)",
          email,
          conversionId,
        },
      });
    } catch (err: any) {
      console.error("Error sending test event:", err);
      setError(err.message || "Failed to send test event");
    } finally {
      setLoading(false);
    }
  };

  const handleSendDirectAPITest = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/analytics/reddit-conversion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType,
          customEventName: eventType === "custom" ? customEventName : undefined,
          testId: testId || undefined,
          eventMetadata: {
            conversionId: `test-${Date.now()}-${eventType}`,
            email,
            value: eventType === "Purchase" ? parseFloat(value) : undefined,
            currency: eventType === "Purchase" ? currency : undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error information
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        throw new Error(data.error + errorDetails || "Failed to send test event");
      }

      setResult({
        success: true,
        message: "Test event sent via direct API call!",
        details: data,
      });
    } catch (err: any) {
      console.error("Error sending test event:", err);
      setError(err.message || "Failed to send test event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Reddit Conversions API Tester
          </h1>
          <p className="text-white/70">
            Send test events to verify your Reddit Pixel and Conversions API integration
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">Test Configuration</CardTitle>
            <CardDescription className="text-white/70">
              Configure and send test events with the test_id parameter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test ID */}
            <div className="space-y-2">
              <Label htmlFor="testId" className="text-white">
                Test ID (Reddit provided)
              </Label>
              <Input
                id="testId"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="t2_20lcxjcqah"
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-xs text-white/50">
                Leave this as is to use the provided test ID. Events with test_id will appear in
                Reddit&apos;s test events panel.
              </p>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="eventType" className="text-white">
                Event Type
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Event Name */}
            {eventType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customEventName" className="text-white">
                  Custom Event Name
                </Label>
                <Input
                  id="customEventName"
                  value={customEventName}
                  onChange={(e) => setCustomEventName(e.target.value)}
                  placeholder="MyCustomEvent"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email (Match Key)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* Value and Currency */}
            {(eventType === "Purchase" || eventType === "AddToCart") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-white">
                    Value
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="99.00"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-white">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSendTestEvent}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-charcoal"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Event (Full Flow)
                  </>
                )}
              </Button>

              <Button
                onClick={handleSendDirectAPITest}
                disabled={loading}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Event (API Only)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Display */}
        {result && (
          <Alert className="bg-green-500/10 border-green-500/50 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-white">
              <div className="space-y-2">
                <p className="font-semibold">{result.message}</p>
                {result.details && (
                  <pre className="bg-white/5 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-white">
              <p className="font-semibold">Error sending test event</p>
              <p className="text-sm">{error}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white/70">
            <div>
              <h3 className="font-semibold text-white mb-2">How to Test:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Keep the Test ID field as provided: <code className="bg-white/10 px-2 py-0.5 rounded">t2_20lcxjcqah</code></li>
                <li>Select an event type (SignUp, Lead, Purchase, etc.)</li>
                <li>Fill in test data (email, value, etc.)</li>
                <li><strong>Full Flow:</strong> Sends via BOTH client-side Pixel + server-side API (deduplication works)</li>
                <li><strong>API Only:</strong> Sends ONLY via server-side API (no client-side pixel, tests server tracking)</li>
                <li>Check Reddit Ads Manager &gt; Pixels &gt; Test Events panel</li>
                <li>If the event appears, your integration is working correctly!</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">What Gets Sent:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>test_id:</strong> {testId}</li>
                <li><strong>conversion_id:</strong> Unique ID for deduplication</li>
                <li><strong>event_type:</strong> Selected event type</li>
                <li><strong>user data:</strong> Email, IP address, User Agent</li>
                <li><strong>metadata:</strong> Value, currency (for Purchase events)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Production vs Test Mode:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>With test_id:</strong> Events appear in Test Events panel (not counted)</li>
                <li><strong>Without test_id:</strong> Events are sent to production and counted</li>
                <li>Remove or clear test_id to send production events</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs">
                <strong>Note:</strong> Test events may take 1-2 minutes to appear in Reddit&apos;s dashboard.
                If events don&apos;t appear, check the browser console and server logs for errors.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
