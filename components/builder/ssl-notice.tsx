
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SslNoticeProps {
  subdomain?: string;
  showDetails?: boolean;
}

export function SslNotice({ subdomain, showDetails = false }: SslNoticeProps) {
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900 font-semibold">
        Site Preview Available
      </AlertTitle>
      <AlertDescription className="text-blue-800">
        {subdomain ? (
          <>
            Your site is ready at <strong>{subdomain}.cdmsuite.com</strong>!
            <br />
            <span className="text-sm">
              Preview it within the dashboard below. Public SSL access coming soon.
            </span>
          </>
        ) : (
          <>
            Preview your site within the dashboard. Direct subdomain access requires SSL
            configuration.
          </>
        )}
        
        {showDetails && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium">Why can't I access my subdomain directly?</p>
            <p className="text-sm">
              Dynamic subdomains require wildcard SSL certificates for secure HTTPS access.
              We're working on enabling this for all users. In the meantime, you can:
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Preview your site in the dashboard (always works)</li>
              <li>Export your site and host it on your own domain</li>
              <li>Upgrade to Pro for custom domain support with your own SSL</li>
            </ul>
            <div className="pt-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/billing">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn About Custom Domains
                </Link>
              </Button>
            </div>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
