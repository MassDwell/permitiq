"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Globe, MapPin, Mail, Clock, Copy, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AHJContact {
  code: string;
  name: string;
  shortName: string;
  office: string;
  phone: string;
  email?: string;
  hours?: string;
  portalLabel: string;
  portalUrl: string;
  secondaryLinks?: Array<{ label: string; url: string }>;
  notes?: string;
}

const AHJ_DIRECTORY: AHJContact[] = [
  {
    code: "BOSTON_ISD",
    name: "Boston ISD (Inspectional Services Department)",
    shortName: "Boston ISD",
    office: "1010 Massachusetts Ave, Boston, MA 02118",
    phone: "(617) 635-5300",
    hours: "Mon–Fri 8:30am–4:30pm",
    portalLabel: "boston.gov/inspectional-services",
    portalUrl: "https://www.boston.gov/departments/inspectional-services",
    secondaryLinks: [
      { label: "Online Permit Portal (Accela)", url: "https://aca-prod.accela.com/BOSTON/" },
    ],
  },
  {
    code: "BOSTON_BPDA",
    name: "BPDA (Boston Planning & Development Agency)",
    shortName: "Boston BPDA",
    office: "Boston City Hall, 9th Floor, 1 City Hall Square, Boston, MA 02201",
    phone: "(617) 722-4300",
    email: "info@bostonplans.org",
    portalLabel: "bostonplans.org",
    portalUrl: "https://www.bostonplans.org",
    secondaryLinks: [
      { label: "Article 80 Development Review", url: "https://www.bostonplans.org/projects/development-review" },
    ],
  },
  {
    code: "BOSTON_ZBA",
    name: "Boston ZBA (Zoning Board of Appeal)",
    shortName: "Boston ZBA",
    office: "1 City Hall Square, Room 801, Boston, MA 02201",
    phone: "(617) 635-4775",
    portalLabel: "boston.gov/zoning-board-appeal",
    portalUrl: "https://www.boston.gov/departments/zoning-board-appeal",
    notes: "Filing deadline: 10 days before hearing date",
  },
  {
    code: "CAMBRIDGE_MA",
    name: "Cambridge Inspectional Services",
    shortName: "Cambridge ISD",
    office: "831 Massachusetts Ave, Cambridge, MA 02139",
    phone: "(617) 349-6100",
    portalLabel: "cambridgema.gov/inspection",
    portalUrl: "https://www.cambridgema.gov/inspection",
  },
  {
    code: "NEWTON_MA",
    name: "Newton Inspectional Services",
    shortName: "Newton ISD",
    office: "1000 Commonwealth Ave, Newton, MA 02459",
    phone: "(617) 796-1060",
    portalLabel: "newtonma.gov/inspectional-services",
    portalUrl: "https://www.newtonma.gov/government/inspectional-services",
  },
  {
    code: "SOMERVILLE_MA",
    name: "Somerville Inspectional Services",
    shortName: "Somerville ISD",
    office: "133 Holland St, Somerville, MA 02144",
    phone: "(617) 625-6600 x2500",
    portalLabel: "somervillema.gov/inspectional-services",
    portalUrl: "https://www.somervillema.gov/departments/inspectional-services",
  },
];

// Map jurisdiction codes to relevant AHJ codes
function getRelevantAHJs(jurisdiction: string | null | undefined): string[] {
  if (!jurisdiction) return [];
  const j = jurisdiction.toUpperCase();
  if (j === "BOSTON_ISD") return ["BOSTON_ISD"];
  if (j === "BOSTON_BPDA") return ["BOSTON_BPDA", "BOSTON_ISD"];
  if (j === "BOSTON_ZBA") return ["BOSTON_ZBA", "BOSTON_ISD"];
  if (j === "CAMBRIDGE_MA") return ["CAMBRIDGE_MA"];
  if (j === "NEWTON_MA") return ["NEWTON_MA"];
  if (j === "SOMERVILLE_MA") return ["SOMERVILLE_MA"];
  return [];
}

interface AHJCardProps {
  contact: AHJContact;
  isPrimary: boolean;
}

function AHJCard({ contact, isPrimary }: AHJCardProps) {
  const copyPhone = () => {
    navigator.clipboard.writeText(contact.phone);
    toast.success("Phone number copied");
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isPrimary ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">{contact.name}</h3>
            {isPrimary && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">Primary</Badge>
            )}
          </div>
        </div>
        <a
          href={contact.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline shrink-0"
        >
          <Globe className="h-3 w-3" />
          Portal
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <span>{contact.office}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
          <span>{contact.phone}</span>
          <button
            onClick={copyPhone}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy phone number"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <a href={`mailto:${contact.email}`} className="hover:underline text-blue-600">
              {contact.email}
            </a>
          </div>
        )}
        {contact.hours && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{contact.hours}</span>
          </div>
        )}
      </div>

      {(contact.secondaryLinks?.length || contact.notes) && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
          {contact.secondaryLinks?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {link.label}
            </a>
          ))}
          {contact.notes && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
              {contact.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface AHJContactDirectoryProps {
  jurisdiction?: string | null;
}

export function AHJContactDirectory({ jurisdiction }: AHJContactDirectoryProps) {
  const [showOthers, setShowOthers] = useState(false);

  const relevantCodes = getRelevantAHJs(jurisdiction);
  const primaryContacts = AHJ_DIRECTORY.filter((c) => relevantCodes.includes(c.code));
  const otherContacts = AHJ_DIRECTORY.filter((c) => !relevantCodes.includes(c.code));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">AHJ Contact Directory</CardTitle>
        <p className="text-sm text-gray-500">
          Official contacts for permit applications and inquiries
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {primaryContacts.length > 0 ? (
          <>
            {primaryContacts.map((contact) => (
              <AHJCard key={contact.code} contact={contact} isPrimary={true} />
            ))}
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Set a jurisdiction in project settings to highlight the relevant AHJ contacts.
          </p>
        )}

        {otherContacts.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-gray-700 -mx-1"
              onClick={() => setShowOthers(!showOthers)}
            >
              {showOthers ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide other jurisdictions
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show {otherContacts.length} other jurisdictions
                </>
              )}
            </Button>
            {showOthers && (
              <div className="mt-2 space-y-2">
                {otherContacts.map((contact) => (
                  <AHJCard key={contact.code} contact={contact} isPrimary={false} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
