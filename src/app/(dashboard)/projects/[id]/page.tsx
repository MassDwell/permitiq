"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Building2,
  Plus,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { DocumentUploadZone } from "@/components/document-upload-zone";
import { AddComplianceItemDialog } from "@/components/add-compliance-item-dialog";

function getStatusBadge(status: string) {
  switch (status) {
    case "met":
      return <Badge className="bg-green-100 text-green-800">Met</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "overdue":
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    case "not_applicable":
      return <Badge className="bg-gray-100 text-gray-800">N/A</Badge>;
    default:
      return null;
  }
}

function getProcessingBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800">Processing...</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    default:
      return null;
  }
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [addItemOpen, setAddItemOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: project, isLoading } = trpc.projects.get.useQuery({
    id: projectId,
  });

  const updateComplianceItem = trpc.compliance.update.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
      toast.success("Document deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const processDocument = trpc.documents.processDocument.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ id: projectId });
      toast.success("Document processed successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (itemId: string, newStatus: "met" | "pending") => {
    updateComplianceItem.mutate({ id: itemId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Project not found
        </h1>
        <p className="text-gray-500 mb-4">
          This project doesn't exist or you don't have access to it.
        </p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.healthStatus === "green" && (
              <Badge className="bg-green-100 text-green-800">On Track</Badge>
            )}
            {project.healthStatus === "yellow" && (
              <Badge className="bg-yellow-100 text-yellow-800">
                Needs Attention
              </Badge>
            )}
            {project.healthStatus === "red" && (
              <Badge className="bg-red-100 text-red-800">At Risk</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {project.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {project.address}
              </span>
            )}
            {project.jurisdiction && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {project.jurisdiction}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {format(new Date(project.createdAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this project? This cannot be undone."
                  )
                ) {
                  deleteProject.mutate({ id: projectId });
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">{project.healthScore}%</div>
              <Progress value={project.healthScore} className="flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Requirements Met
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {project.metItems}
              <span className="text-gray-400 text-lg">/{project.totalItems}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {project.pendingItems}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {project.overdueItems}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="compliance">
        <TabsList>
          <TabsTrigger value="compliance">
            Compliance Checklist ({project.complianceItems.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({project.documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Compliance Checklist</CardTitle>
                <CardDescription>
                  Track all requirements for this project
                </CardDescription>
              </div>
              <Button onClick={() => setAddItemOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {project.complianceItems.length > 0 ? (
                <div className="space-y-3">
                  {project.complianceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <Checkbox
                        checked={item.status === "met"}
                        disabled={item.status === "overdue"}
                        onCheckedChange={(checked) =>
                          handleStatusChange(
                            item.id,
                            checked ? "met" : "pending"
                          )
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium ${
                              item.status === "met"
                                ? "line-through text-gray-400"
                                : ""
                            }`}
                          >
                            {item.description}
                          </p>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="capitalize">
                            {item.requirementType.replace(/_/g, " ")}
                          </span>
                          {item.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due {format(new Date(item.deadline), "MMM d, yyyy")}
                            </span>
                          )}
                          {item.document && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {item.document.filename}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No compliance items yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Upload documents to auto-extract requirements, or add them
                    manually.
                  </p>
                  <Button onClick={() => setAddItemOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Compliance Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Upload permits, inspections, and compliance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadZone projectId={projectId} />

              {project.documents.length > 0 && (
                <div className="mt-6 space-y-3">
                  {project.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{doc.filename}</p>
                          {getProcessingBadge(doc.processingStatus)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          {doc.docType && (
                            <span className="capitalize">
                              {doc.docType.replace(/_/g, " ")}
                            </span>
                          )}
                          <span>
                            Uploaded {format(new Date(doc.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.processingStatus === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              processDocument.mutate({ documentId: doc.id })
                            }
                            disabled={processDocument.isPending}
                          >
                            {processDocument.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Process"
                            )}
                          </Button>
                        )}
                        <a
                          href={doc.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this document?"
                              )
                            ) {
                              deleteDocument.mutate({ id: doc.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddComplianceItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        projectId={projectId}
      />
    </div>
  );
}
