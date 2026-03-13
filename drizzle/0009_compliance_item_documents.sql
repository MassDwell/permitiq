CREATE TABLE IF NOT EXISTS "compliance_item_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compliance_item_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "compliance_item_documents_compliance_item_id_document_id_unique" UNIQUE("compliance_item_id","document_id")
);
--> statement-breakpoint
ALTER TABLE "compliance_item_documents" ADD CONSTRAINT "compliance_item_documents_compliance_item_id_compliance_items_id_fk" FOREIGN KEY ("compliance_item_id") REFERENCES "public"."compliance_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "compliance_item_documents" ADD CONSTRAINT "compliance_item_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
