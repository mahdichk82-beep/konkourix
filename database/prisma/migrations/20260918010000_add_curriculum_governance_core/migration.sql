-- Phase 20: additive Canonical Curriculum governance and core persistence.
-- Existing M19 tables are referenced only; no existing column or constraint is changed.

CREATE TYPE "CurriculumVersionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'SUPERSEDED');
CREATE TYPE "CurriculumNodeAvailability" AS ENUM ('ACTIVE', 'DEPRECATED', 'RETIRED');
CREATE TYPE "CurriculumRelationshipType" AS ENUM ('PREREQUISITE', 'APPLICABILITY', 'EQUIVALENCE', 'PREDECESSOR', 'SUCCESSOR', 'SPLIT', 'MERGE', 'REPLACEMENT');
CREATE TYPE "CurriculumRelationshipStatus" AS ENUM ('PROPOSED', 'APPROVED', 'SUPERSEDED');
CREATE TYPE "CurriculumValidationStatus" AS ENUM ('RUNNING', 'PASSED', 'FAILED');
CREATE TYPE "CurriculumReviewOutcome" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED');
CREATE TYPE "CurriculumCapability" AS ENUM (
    'CURRICULUM_DRAFT_READ',
    'CURRICULUM_DRAFT_EDIT',
    'CURRICULUM_IMPORT_OPERATE',
    'CURRICULUM_SOURCE_READ',
    'CURRICULUM_ISSUE_RESOLVE',
    'CURRICULUM_REVIEW_DECIDE',
    'CURRICULUM_PUBLISH',
    'CURRICULUM_MAPPING_APPROVE',
    'CURRICULUM_AUDIT_READ',
    'CURRICULUM_PERMISSION_MANAGE'
);
CREATE TYPE "CurriculumCapabilityScope" AS ENUM ('GLOBAL');
CREATE TYPE "CurriculumAuditOutcome" AS ENUM ('SUCCEEDED', 'REJECTED', 'FAILED');

CREATE TABLE "curriculum_capability_grants" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "capability" "CurriculumCapability" NOT NULL,
    "scope" "CurriculumCapabilityScope" NOT NULL DEFAULT 'GLOBAL',
    "expiresAt" TIMESTAMP(3),
    "grantedById" UUID NOT NULL,
    "grantReason" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedById" UUID,
    "revokeReason" TEXT,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "curriculum_capability_grants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_capability_grants_revocation_complete" CHECK (
        ("revokedAt" IS NULL AND "revokedById" IS NULL AND "revokeReason" IS NULL)
        OR ("revokedAt" IS NOT NULL AND "revokedById" IS NOT NULL AND length(trim("revokeReason")) > 0)
    ),
    CONSTRAINT "curriculum_capability_grants_no_self_grant" CHECK ("userId" <> "grantedById"),
    CONSTRAINT "curriculum_capability_grants_reason_nonempty" CHECK (length(trim("grantReason")) > 0)
);

CREATE TABLE "curriculum_versions" (
    "id" UUID NOT NULL,
    "versionLabel" TEXT NOT NULL,
    "status" "CurriculumVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "basedOnVersionId" UUID,
    "effectiveFrom" TIMESTAMP(3),
    "sourceSummary" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "publishedById" UUID,
    "publishedAt" TIMESTAMP(3),
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_versions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_versions_revision_nonnegative" CHECK ("revision" >= 0),
    CONSTRAINT "curriculum_versions_label_nonempty" CHECK (length(trim("versionLabel")) > 0),
    CONSTRAINT "curriculum_versions_publication_fields" CHECK (
        ("status" IN ('DRAFT', 'IN_REVIEW') AND "publishedAt" IS NULL AND "publishedById" IS NULL AND "supersededAt" IS NULL)
        OR ("status" = 'PUBLISHED' AND "publishedAt" IS NOT NULL AND "publishedById" IS NOT NULL AND "supersededAt" IS NULL)
        OR ("status" = 'SUPERSEDED' AND "publishedAt" IS NOT NULL AND "publishedById" IS NOT NULL AND "supersededAt" IS NOT NULL)
    )
);

CREATE TABLE "curriculum_node_types" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "displayNameFa" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowedParentCodes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_node_types_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_node_types_code_nonempty" CHECK (length(trim("code")) > 0),
    CONSTRAINT "curriculum_node_types_name_nonempty" CHECK (length(trim("displayName")) > 0)
);

CREATE TABLE "curriculum_nodes" (
    "id" UUID NOT NULL,
    "identityNote" TEXT,
    "tombstonedAt" TIMESTAMP(3),
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "curriculum_node_revisions" (
    "curriculumVersionId" UUID NOT NULL,
    "curriculumNodeId" UUID NOT NULL,
    "nodeTypeId" UUID NOT NULL,
    "parentNodeId" UUID,
    "displayName" TEXT NOT NULL,
    "sourceDisplayName" TEXT NOT NULL,
    "searchName" TEXT NOT NULL,
    "siblingPosition" INTEGER NOT NULL,
    "sourceOrder" INTEGER,
    "availabilityStatus" "CurriculumNodeAvailability" NOT NULL DEFAULT 'ACTIVE',
    "deprecationReason" TEXT,
    "provenance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_node_revisions_pkey" PRIMARY KEY ("curriculumVersionId", "curriculumNodeId"),
    CONSTRAINT "curriculum_node_revisions_position_nonnegative" CHECK ("siblingPosition" >= 0),
    CONSTRAINT "curriculum_node_revisions_source_order_nonnegative" CHECK ("sourceOrder" IS NULL OR "sourceOrder" >= 0),
    CONSTRAINT "curriculum_node_revisions_no_self_parent" CHECK ("parentNodeId" IS NULL OR "parentNodeId" <> "curriculumNodeId"),
    CONSTRAINT "curriculum_node_revisions_names_nonempty" CHECK (
        length(trim("displayName")) > 0 AND length(trim("sourceDisplayName")) > 0
    ),
    CONSTRAINT "curriculum_node_revisions_deprecation_reason" CHECK (
        "availabilityStatus" = 'ACTIVE' OR length(trim("deprecationReason")) > 0
    )
);

CREATE TABLE "curriculum_node_relationships" (
    "id" UUID NOT NULL,
    "curriculumVersionId" UUID NOT NULL,
    "sourceVersionId" UUID NOT NULL,
    "sourceNodeId" UUID NOT NULL,
    "targetVersionId" UUID NOT NULL,
    "targetNodeId" UUID NOT NULL,
    "type" "CurriculumRelationshipType" NOT NULL,
    "status" "CurriculumRelationshipStatus" NOT NULL DEFAULT 'PROPOSED',
    "rationale" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "supersededById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_node_relationships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_relationships_not_self" CHECK (
        "sourceVersionId" <> "targetVersionId" OR "sourceNodeId" <> "targetNodeId"
    ),
    CONSTRAINT "curriculum_relationships_rationale_nonempty" CHECK (length(trim("rationale")) > 0),
    CONSTRAINT "curriculum_relationships_approval_complete" CHECK (
        ("status" = 'PROPOSED' AND "approvedAt" IS NULL AND "approvedById" IS NULL)
        OR ("status" IN ('APPROVED', 'SUPERSEDED') AND "approvedAt" IS NOT NULL AND "approvedById" IS NOT NULL)
    )
);

CREATE TABLE "curriculum_validation_runs" (
    "id" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "draftRevision" INTEGER NOT NULL,
    "initiatedById" UUID NOT NULL,
    "status" "CurriculumValidationStatus" NOT NULL DEFAULT 'RUNNING',
    "blockerCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "curriculum_validation_runs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_validation_counts_nonnegative" CHECK ("blockerCount" >= 0 AND "warningCount" >= 0),
    CONSTRAINT "curriculum_validation_completion" CHECK (
        ("status" = 'RUNNING' AND "completedAt" IS NULL)
        OR ("status" IN ('PASSED', 'FAILED') AND "completedAt" IS NOT NULL)
    )
);

CREATE TABLE "curriculum_review_decisions" (
    "id" UUID NOT NULL,
    "versionId" UUID NOT NULL,
    "draftRevision" INTEGER NOT NULL,
    "validationRunId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "decision" "CurriculumReviewOutcome" NOT NULL,
    "findings" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invalidatedAt" TIMESTAMP(3),
    "invalidatedReason" TEXT,
    CONSTRAINT "curriculum_review_decisions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_review_findings_nonempty" CHECK (length(trim("findings")) > 0),
    CONSTRAINT "curriculum_review_invalidation_complete" CHECK (
        ("invalidatedAt" IS NULL AND "invalidatedReason" IS NULL)
        OR ("invalidatedAt" IS NOT NULL AND length(trim("invalidatedReason")) > 0)
    )
);

CREATE TABLE "curriculum_audit_logs" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "actorKind" TEXT NOT NULL DEFAULT 'USER',
    "capability" "CurriculumCapability",
    "action" TEXT NOT NULL,
    "outcome" "CurriculumAuditOutcome" NOT NULL,
    "targetKind" TEXT NOT NULL,
    "targetId" TEXT,
    "versionId" UUID,
    "nodeId" UUID,
    "importId" UUID,
    "mappingId" UUID,
    "grantId" UUID,
    "reason" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "requestId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "curriculum_audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_audit_action_nonempty" CHECK (length(trim("action")) > 0),
    CONSTRAINT "curriculum_audit_target_nonempty" CHECK (length(trim("targetKind")) > 0)
);

CREATE UNIQUE INDEX "curriculum_versions_versionLabel_key" ON "curriculum_versions"("versionLabel");
CREATE UNIQUE INDEX "curriculum_versions_one_published_idx" ON "curriculum_versions"(("status")) WHERE "status" = 'PUBLISHED';
CREATE INDEX "curriculum_versions_status_idx" ON "curriculum_versions"("status");
CREATE INDEX "curriculum_versions_basedOnVersionId_idx" ON "curriculum_versions"("basedOnVersionId");
CREATE UNIQUE INDEX "curriculum_node_types_code_key" ON "curriculum_node_types"("code");
CREATE INDEX "curriculum_nodes_createdById_idx" ON "curriculum_nodes"("createdById");
CREATE UNIQUE INDEX "curriculum_node_revisions_parent_position_key" ON "curriculum_node_revisions"("curriculumVersionId", "parentNodeId", "siblingPosition");
CREATE UNIQUE INDEX "curriculum_node_revisions_root_position_key" ON "curriculum_node_revisions"("curriculumVersionId", "siblingPosition") WHERE "parentNodeId" IS NULL;
CREATE INDEX "curriculum_node_revisions_type_idx" ON "curriculum_node_revisions"("curriculumVersionId", "nodeTypeId");
CREATE INDEX "curriculum_node_revisions_search_idx" ON "curriculum_node_revisions"("curriculumVersionId", "searchName");
CREATE UNIQUE INDEX "curriculum_node_relationships_endpoint_key" ON "curriculum_node_relationships"("curriculumVersionId", "sourceVersionId", "sourceNodeId", "targetVersionId", "targetNodeId", "type");
CREATE INDEX "curriculum_node_relationships_source_idx" ON "curriculum_node_relationships"("sourceVersionId", "sourceNodeId");
CREATE INDEX "curriculum_node_relationships_target_idx" ON "curriculum_node_relationships"("targetVersionId", "targetNodeId");
CREATE INDEX "curriculum_validation_runs_version_revision_idx" ON "curriculum_validation_runs"("versionId", "draftRevision");
CREATE INDEX "curriculum_review_decisions_version_revision_idx" ON "curriculum_review_decisions"("versionId", "draftRevision", "decision");
CREATE INDEX "curriculum_audit_logs_actor_time_idx" ON "curriculum_audit_logs"("actorUserId", "occurredAt");
CREATE INDEX "curriculum_audit_logs_version_time_idx" ON "curriculum_audit_logs"("versionId", "occurredAt");
CREATE INDEX "curriculum_audit_logs_target_time_idx" ON "curriculum_audit_logs"("targetKind", "targetId", "occurredAt");
CREATE INDEX "curriculum_capability_grants_user_capability_idx" ON "curriculum_capability_grants"("userId", "capability", "scope");
CREATE INDEX "curriculum_capability_grants_effective_idx" ON "curriculum_capability_grants"("capability", "revokedAt", "expiresAt");
CREATE UNIQUE INDEX "curriculum_capability_grants_active_key" ON "curriculum_capability_grants"("userId", "capability", "scope") WHERE "revokedAt" IS NULL;

ALTER TABLE "curriculum_capability_grants" ADD CONSTRAINT "curriculum_capability_grants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_capability_grants" ADD CONSTRAINT "curriculum_capability_grants_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_capability_grants" ADD CONSTRAINT "curriculum_capability_grants_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_basedOnVersionId_fkey" FOREIGN KEY ("basedOnVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_nodes" ADD CONSTRAINT "curriculum_nodes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_revisions" ADD CONSTRAINT "curriculum_node_revisions_version_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_revisions" ADD CONSTRAINT "curriculum_node_revisions_node_fkey" FOREIGN KEY ("curriculumNodeId") REFERENCES "curriculum_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_revisions" ADD CONSTRAINT "curriculum_node_revisions_type_fkey" FOREIGN KEY ("nodeTypeId") REFERENCES "curriculum_node_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_revisions" ADD CONSTRAINT "curriculum_node_revisions_parent_fkey" FOREIGN KEY ("curriculumVersionId", "parentNodeId") REFERENCES "curriculum_node_revisions"("curriculumVersionId", "curriculumNodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_version_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_source_version_fkey" FOREIGN KEY ("sourceVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_target_version_fkey" FOREIGN KEY ("targetVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_source_fkey" FOREIGN KEY ("sourceVersionId", "sourceNodeId") REFERENCES "curriculum_node_revisions"("curriculumVersionId", "curriculumNodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_target_fkey" FOREIGN KEY ("targetVersionId", "targetNodeId") REFERENCES "curriculum_node_revisions"("curriculumVersionId", "curriculumNodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_relationships" ADD CONSTRAINT "curriculum_relationships_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "curriculum_node_relationships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_validation_runs" ADD CONSTRAINT "curriculum_validation_runs_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_validation_runs" ADD CONSTRAINT "curriculum_validation_runs_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_review_decisions" ADD CONSTRAINT "curriculum_review_decisions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_review_decisions" ADD CONSTRAINT "curriculum_review_decisions_validationRunId_fkey" FOREIGN KEY ("validationRunId") REFERENCES "curriculum_validation_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_review_decisions" ADD CONSTRAINT "curriculum_review_decisions_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_audit_logs" ADD CONSTRAINT "curriculum_audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_audit_logs" ADD CONSTRAINT "curriculum_audit_logs_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "curriculum_node_types" ("id", "code", "displayName", "displayNameFa", "isActive", "createdAt", "updatedAt") VALUES
('20000000-0000-4000-8000-000000000001', 'CURRICULUM_ROOT', 'Curriculum root', 'برنامه درسی', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000002', 'FIELD', 'Field / major scope', 'رشته', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000003', 'GRADE', 'Grade', 'پایه', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000004', 'SUBJECT', 'Subject', 'درس', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000005', 'CHAPTER', 'Chapter', 'فصل', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000006', 'TOPIC', 'Topic', 'موضوع', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000007', 'CONCEPT', 'Concept', 'مفهوم', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-4000-8000-000000000008', 'SUBCONCEPT', 'Sub-concept', 'زیرمفهوم', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

CREATE FUNCTION curriculum_guard_published_version() RETURNS trigger AS $$
BEGIN
    IF OLD."status" IN ('PUBLISHED', 'SUPERSEDED') THEN
        IF TG_OP = 'DELETE' THEN
            RAISE EXCEPTION 'published curriculum versions are immutable';
        END IF;
        IF NEW."status" = 'SUPERSEDED'
           AND OLD."status" = 'PUBLISHED'
           AND NEW."supersededAt" IS NOT NULL
           AND ROW(NEW."id", NEW."versionLabel", NEW."basedOnVersionId", NEW."effectiveFrom", NEW."sourceSummary", NEW."revision", NEW."createdById", NEW."reviewedAt", NEW."publishedById", NEW."publishedAt", NEW."createdAt")
               IS NOT DISTINCT FROM
               ROW(OLD."id", OLD."versionLabel", OLD."basedOnVersionId", OLD."effectiveFrom", OLD."sourceSummary", OLD."revision", OLD."createdById", OLD."reviewedAt", OLD."publishedById", OLD."publishedAt", OLD."createdAt") THEN
            RETURN NEW;
        END IF;
        RAISE EXCEPTION 'published curriculum versions are immutable';
    END IF;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_versions_immutable" BEFORE UPDATE OR DELETE ON "curriculum_versions" FOR EACH ROW EXECUTE FUNCTION curriculum_guard_published_version();

CREATE FUNCTION curriculum_guard_version_content() RETURNS trigger AS $$
DECLARE protected_status "CurriculumVersionStatus";
BEGIN
    SELECT "status" INTO protected_status FROM "curriculum_versions" WHERE "id" = COALESCE(OLD."curriculumVersionId", NEW."curriculumVersionId");
    IF protected_status IN ('PUBLISHED', 'SUPERSEDED') THEN
        RAISE EXCEPTION 'published curriculum content is immutable';
    END IF;
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_node_revisions_immutable" BEFORE UPDATE OR DELETE ON "curriculum_node_revisions" FOR EACH ROW EXECUTE FUNCTION curriculum_guard_version_content();
CREATE TRIGGER "curriculum_node_relationships_immutable" BEFORE UPDATE OR DELETE ON "curriculum_node_relationships" FOR EACH ROW EXECUTE FUNCTION curriculum_guard_version_content();

CREATE FUNCTION curriculum_guard_completed_validation() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' OR OLD."status" <> 'RUNNING' THEN
        RAISE EXCEPTION 'completed curriculum validation evidence is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_validation_runs_immutable" BEFORE UPDATE OR DELETE ON "curriculum_validation_runs" FOR EACH ROW EXECUTE FUNCTION curriculum_guard_completed_validation();

CREATE FUNCTION curriculum_reject_mutation() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_review_decisions_append_only" BEFORE UPDATE OR DELETE ON "curriculum_review_decisions" FOR EACH ROW EXECUTE FUNCTION curriculum_reject_mutation();
CREATE TRIGGER "curriculum_audit_logs_append_only" BEFORE UPDATE OR DELETE ON "curriculum_audit_logs" FOR EACH ROW EXECUTE FUNCTION curriculum_reject_mutation();
