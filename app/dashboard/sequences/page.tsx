
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Sequences | CDM Suite Dashboard",
  description: "Manage your marketing automation sequences",
};

export default async function SequencesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sequences</h1>
        <p className="text-slate-600">
          Manage your marketing automation sequences and email campaigns
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-12 text-center border-2 border-dashed border-blue-200">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            Sequences Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            Automated marketing sequences and email campaigns are currently under development. 
            This feature will allow you to create and manage multi-step email sequences to nurture your leads automatically.
          </p>
          <div className="bg-white rounded-lg p-4 text-left space-y-2">
            <p className="font-semibold text-sm text-gray-900">What's Coming:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create multi-step email sequences</li>
              <li>• Track engagement and open rates</li>
              <li>• A/B test your campaigns</li>
              <li>• Automated follow-ups</li>
              <li>• Performance analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
