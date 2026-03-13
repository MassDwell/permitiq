import { SignUp } from "@clerk/nextjs";
import { Building2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* MeritLayer branding above Clerk widget */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">MeritLayer</span>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl bg-white",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium",
              socialButtonsBlockButtonText: "text-gray-700 font-medium",
              socialButtonsIconButton:
                "bg-white border border-gray-300 hover:bg-gray-50",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
              formFieldInput:
                "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500",
              formFieldLabel: "text-gray-700",
              footerActionLink: "text-blue-600 hover:text-blue-700",
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white",
            },
          }}
        />
      </div>
    </div>
  );
}
