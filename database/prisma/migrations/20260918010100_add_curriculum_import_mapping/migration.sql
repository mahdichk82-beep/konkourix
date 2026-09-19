-- Phase 20: additive import, provenance, mapping, and compatibility persistence.

CREATE TYPE "CurriculumImportStatus" AS ENUM ('CREATED', 'VALIDATING', 'COMPLETED', 'FAILED');
CREATE TYPE "CurriculumSourceDisposition" AS ENUM ('PENDING', 'ACCEPTED', 'UNCHANGED', 'AMBIGUOUS', 'REJECTED', 'EXCLUDED');
CREATE TYPE "CurriculumIssueSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');
CREATE TYPE "CurriculumIssueDisposition" AS ENUM ('OPEN', 'RESOLVED', 'EXCLUDED', 'MORE_EVIDENCE_REQUIRED');
CREATE TYPE "CurriculumMappingType" AS ENUM ('SAME_IDENTITY', 'REPLACED_BY', 'SPLIT_INTO', 'MERGED_INTO', 'EQUIVALENT_TO');
CREATE TYPE "CurriculumMappingStatus" AS ENUM ('PROPOSED', 'APPROVED', 'SUPERSEDED');
CREATE TYPE "LegacyCurriculumKind" AS ENUM ('STUDY_SUBJECT', 'TOPIC');
CREATE TYPE "LegacyCurriculumDecision" AS ENUM ('PROPOSED', 'CONFIRMED', 'AMBIGUOUS', 'LEGACY_ONLY');

CREATE TABLE "curriculum_imports" (
    "id" UUID NOT NULL,
    "targetVersionId" UUID NOT NULL,
    "manifestSchemaVersion" TEXT NOT NULL,
    "manifestChecksum" TEXT NOT NULL,
    "sourceArtifactName" TEXT NOT NULL,
    "sourceArtifactSha256" TEXT NOT NULL,
    "transcriptionId" TEXT NOT NULL,
    "transcriptionSha256" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadChecksum" TEXT NOT NULL,
    "status" "CurriculumImportStatus" NOT NULL DEFAULT 'CREATED',
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "unchangedCount" INTEGER NOT NULL DEFAULT 0,
    "ambiguousCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "excludedCount" INTEGER NOT NULL DEFAULT 0,
    "report" JSONB,
    "failureCode" TEXT,
    "importedById" UUID NOT NULL,
    "retryOfImportId" UUID,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_imports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_imports_counts_nonnegative" CHECK (
        "acceptedCount" >= 0 AND "unchangedCount" >= 0 AND "ambiguousCount" >= 0
        AND "rejectedCount" >= 0 AND "excludedCount" >= 0
    ),
    CONSTRAINT "curriculum_imports_completion_state" CHECK (
        ("status" IN ('CREATED', 'VALIDATING') AND "completedAt" IS NULL AND "failedAt" IS NULL)
        OR ("status" = 'COMPLETED' AND "completedAt" IS NOT NULL AND "failedAt" IS NULL)
        OR ("status" = 'FAILED' AND "failedAt" IS NOT NULL AND "failureCode" IS NOT NULL)
    ),
    CONSTRAINT "curriculum_imports_sha256_format" CHECK (
        "sourceArtifactSha256" ~ '^[0-9a-f]{64}$'
        AND "transcriptionSha256" ~ '^[0-9a-f]{64}$'
        AND "manifestChecksum" ~ '^[0-9a-f]{64}$'
        AND "payloadChecksum" ~ '^[0-9a-f]{64}$'
    )
);

CREATE TABLE "curriculum_source_records" (
    "id" UUID NOT NULL,
    "importId" UUID NOT NULL,
    "sourceRecordKey" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "displayLabel" TEXT NOT NULL,
    "sourceLocator" TEXT NOT NULL,
    "sourceOrder" INTEGER NOT NULL,
    "proposedNodeTypeCode" TEXT,
    "parentSourceRecordKey" TEXT,
    "structuralHints" JSONB,
    "ambiguityMarkers" JSONB,
    "checksum" TEXT NOT NULL,
    "disposition" "CurriculumSourceDisposition" NOT NULL DEFAULT 'PENDING',
    "matchedCurriculumVersionId" UUID,
    "matchedCurriculumNodeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "curriculum_source_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_source_records_order_nonnegative" CHECK ("sourceOrder" >= 0),
    CONSTRAINT "curriculum_source_records_key_nonempty" CHECK (length(trim("sourceRecordKey")) > 0),
    CONSTRAINT "curriculum_source_records_match_complete" CHECK (
        ("matchedCurriculumVersionId" IS NULL AND "matchedCurriculumNodeId" IS NULL)
        OR ("matchedCurriculumVersionId" IS NOT NULL AND "matchedCurriculumNodeId" IS NOT NULL)
    ),
    CONSTRAINT "curriculum_source_records_checksum_format" CHECK ("checksum" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "curriculum_import_issues" (
    "id" UUID NOT NULL,
    "importId" UUID NOT NULL,
    "sourceRecordId" UUID,
    "code" TEXT NOT NULL,
    "severity" "CurriculumIssueSeverity" NOT NULL,
    "details" JSONB NOT NULL,
    "isBlocking" BOOLEAN NOT NULL DEFAULT true,
    "disposition" "CurriculumIssueDisposition" NOT NULL DEFAULT 'OPEN',
    "resolution" JSONB,
    "resolutionReason" TEXT,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "curriculum_import_issues_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_import_issues_code_nonempty" CHECK (length(trim("code")) > 0),
    CONSTRAINT "curriculum_import_issues_resolution_complete" CHECK (
        ("disposition" = 'OPEN' AND "resolution" IS NULL AND "resolutionReason" IS NULL AND "resolvedById" IS NULL AND "resolvedAt" IS NULL)
        OR ("disposition" <> 'OPEN' AND "resolution" IS NOT NULL AND length(trim("resolutionReason")) > 0 AND "resolvedById" IS NOT NULL AND "resolvedAt" IS NOT NULL)
    )
);

CREATE TABLE "curriculum_node_mappings" (
    "id" UUID NOT NULL,
    "fromVersionId" UUID NOT NULL,
    "fromNodeId" UUID NOT NULL,
    "toVersionId" UUID NOT NULL,
    "toNodeId" UUID NOT NULL,
    "mappingType" "CurriculumMappingType" NOT NULL,
    "status" "CurriculumMappingStatus" NOT NULL DEFAULT 'PROPOSED',
    "confidence" DOUBLE PRECISION,
    "rationale" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "supersededById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "curriculum_node_mappings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "curriculum_node_mappings_different_endpoints" CHECK ("fromVersionId" <> "toVersionId" OR "fromNodeId" <> "toNodeId"),
    CONSTRAINT "curriculum_node_mappings_confidence_range" CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1)),
    CONSTRAINT "curriculum_node_mappings_rationale_nonempty" CHECK (length(trim("rationale")) > 0),
    CONSTRAINT "curriculum_node_mappings_approval_complete" CHECK (
        ("status" = 'PROPOSED' AND "approvedAt" IS NULL AND "approvedById" IS NULL)
        OR ("status" IN ('APPROVED', 'SUPERSEDED') AND "approvedAt" IS NOT NULL AND "approvedById" IS NOT NULL)
    )
);

CREATE TABLE "legacy_curriculum_mappings" (
    "id" UUID NOT NULL,
    "legacyKind" "LegacyCurriculumKind" NOT NULL,
    "studySubjectId" UUID,
    "topicId" UUID,
    "curriculumVersionId" UUID,
    "curriculumNodeId" UUID,
    "decision" "LegacyCurriculumDecision" NOT NULL,
    "rationale" TEXT NOT NULL,
    "createdById" UUID NOT NULL,
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "supersededById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "legacy_curriculum_mappings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "legacy_curriculum_mappings_kind_target" CHECK (
        ("legacyKind" = 'STUDY_SUBJECT' AND "studySubjectId" IS NOT NULL AND "topicId" IS NULL)
        OR ("legacyKind" = 'TOPIC' AND "topicId" IS NOT NULL AND "studySubjectId" IS NULL)
    ),
    CONSTRAINT "legacy_curriculum_mappings_canonical_pair" CHECK (
        ("curriculumVersionId" IS NULL AND "curriculumNodeId" IS NULL)
        OR ("curriculumVersionId" IS NOT NULL AND "curriculumNodeId" IS NOT NULL)
    ),
    CONSTRAINT "legacy_curriculum_mappings_confirmed_target" CHECK (
        "decision" <> 'CONFIRMED' OR ("curriculumVersionId" IS NOT NULL AND "curriculumNodeId" IS NOT NULL)
    ),
    CONSTRAINT "legacy_curriculum_mappings_review_complete" CHECK (
        ("decision" = 'PROPOSED' AND "reviewedById" IS NULL AND "reviewedAt" IS NULL)
        OR ("decision" <> 'PROPOSED' AND "reviewedById" IS NOT NULL AND "reviewedAt" IS NOT NULL)
    ),
    CONSTRAINT "legacy_curriculum_mappings_rationale_nonempty" CHECK (length(trim("rationale")) > 0)
);

CREATE UNIQUE INDEX "curriculum_imports_target_idempotency_key" ON "curriculum_imports"("targetVersionId", "idempotencyKey");
CREATE INDEX "curriculum_imports_target_status_idx" ON "curriculum_imports"("targetVersionId", "status");
CREATE UNIQUE INDEX "curriculum_source_records_import_key" ON "curriculum_source_records"("importId", "sourceRecordKey");
CREATE UNIQUE INDEX "curriculum_source_records_import_order_key" ON "curriculum_source_records"("importId", "sourceOrder");
CREATE INDEX "curriculum_source_records_match_idx" ON "curriculum_source_records"("matchedCurriculumVersionId", "matchedCurriculumNodeId");
CREATE INDEX "curriculum_import_issues_queue_idx" ON "curriculum_import_issues"("importId", "disposition", "isBlocking");
CREATE INDEX "curriculum_import_issues_source_idx" ON "curriculum_import_issues"("sourceRecordId");
CREATE UNIQUE INDEX "curriculum_node_mappings_endpoint_key" ON "curriculum_node_mappings"("fromVersionId", "fromNodeId", "toVersionId", "toNodeId", "mappingType");
CREATE INDEX "curriculum_node_mappings_target_idx" ON "curriculum_node_mappings"("toVersionId", "toNodeId");
CREATE INDEX "legacy_curriculum_mappings_legacy_idx" ON "legacy_curriculum_mappings"("legacyKind", "studySubjectId", "topicId");
CREATE INDEX "legacy_curriculum_mappings_target_idx" ON "legacy_curriculum_mappings"("curriculumVersionId", "curriculumNodeId");
CREATE UNIQUE INDEX "legacy_curriculum_mappings_active_subject_key" ON "legacy_curriculum_mappings"("studySubjectId") WHERE "studySubjectId" IS NOT NULL AND "supersededById" IS NULL;
CREATE UNIQUE INDEX "legacy_curriculum_mappings_active_topic_key" ON "legacy_curriculum_mappings"("topicId") WHERE "topicId" IS NOT NULL AND "supersededById" IS NULL;

ALTER TABLE "curriculum_imports" ADD CONSTRAINT "curriculum_imports_targetVersionId_fkey" FOREIGN KEY ("targetVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_imports" ADD CONSTRAINT "curriculum_imports_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_imports" ADD CONSTRAINT "curriculum_imports_retryOfImportId_fkey" FOREIGN KEY ("retryOfImportId") REFERENCES "curriculum_imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_source_records" ADD CONSTRAINT "curriculum_source_records_importId_fkey" FOREIGN KEY ("importId") REFERENCES "curriculum_imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_source_records" ADD CONSTRAINT "curriculum_source_records_match_version_fkey" FOREIGN KEY ("matchedCurriculumVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_source_records" ADD CONSTRAINT "curriculum_source_records_match_node_fkey" FOREIGN KEY ("matchedCurriculumNodeId") REFERENCES "curriculum_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_source_records" ADD CONSTRAINT "curriculum_source_records_match_revision_fkey" FOREIGN KEY ("matchedCurriculumVersionId", "matchedCurriculumNodeId") REFERENCES "curriculum_node_revisions"("curriculumVersionId", "curriculumNodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_import_issues" ADD CONSTRAINT "curriculum_import_issues_importId_fkey" FOREIGN KEY ("importId") REFERENCES "curriculum_imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_import_issues" ADD CONSTRAINT "curriculum_import_issues_sourceRecordId_fkey" FOREIGN KEY ("sourceRecordId") REFERENCES "curriculum_source_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_import_issues" ADD CONSTRAINT "curriculum_import_issues_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_mappings" ADD CONSTRAINT "curriculum_node_mappings_from_version_fkey" FOREIGN KEY ("fromVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_mappings" ADD CONSTRAINT "curriculum_node_mappings_to_version_fkey" FOREIGN KEY ("toVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_mappings" ADD CONSTRAINT "curriculum_node_mappings_from_revision_fkey" FOREIGN KEY ("fromVersionId", "fromNodeId") REFERENCES "curriculum_node_revisions"("curriculumVersionId", "curriculumNodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_mappings" ADD CONSTRAINT "curriculum_node_mappings_to_revision_fkey" FOREIGN KEY ("toVersionId", "toNodeId") REFERENCES "curriculum_node_revisions"("curriculumVersionId", "curriculumNodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_mappings" ADD CONSTRAINT "curriculum_node_mappings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_mappings" ADD CONSTRAINT "curriculum_node_mappings_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_node_mappings" ADD CONSTRAINT "curriculum_node_mappings_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "curriculum_node_mappings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legacy_curriculum_mappings" ADD CONSTRAINT "legacy_curriculum_mappings_studySubjectId_fkey" FOREIGN KEY ("studySubjectId") REFERENCES "study_subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legacy_curriculum_mappings" ADD CONSTRAINT "legacy_curriculum_mappings_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "study_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legacy_curriculum_mappings" ADD CONSTRAINT "legacy_curriculum_mappings_version_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "curriculum_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legacy_curriculum_mappings" ADD CONSTRAINT "legacy_curriculum_mappings_revision_fkey" FOREIGN KEY ("curriculumVersionId", "curriculumNodeId") REFERENCES "curriculum_node_revisions"("curriculumVersionId", "curriculumNodeId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legacy_curriculum_mappings" ADD CONSTRAINT "legacy_curriculum_mappings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legacy_curriculum_mappings" ADD CONSTRAINT "legacy_curriculum_mappings_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "legacy_curriculum_mappings" ADD CONSTRAINT "legacy_curriculum_mappings_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "legacy_curriculum_mappings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_audit_logs" ADD CONSTRAINT "curriculum_audit_logs_importId_fkey" FOREIGN KEY ("importId") REFERENCES "curriculum_imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "curriculum_audit_logs" ADD CONSTRAINT "curriculum_audit_logs_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "curriculum_capability_grants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION curriculum_guard_completed_import() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' OR OLD."status" IN ('COMPLETED', 'FAILED') THEN
        RAISE EXCEPTION 'completed curriculum import evidence is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_imports_immutable" BEFORE UPDATE OR DELETE ON "curriculum_imports" FOR EACH ROW EXECUTE FUNCTION curriculum_guard_completed_import();

CREATE FUNCTION curriculum_guard_source_record() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'curriculum source records are retained';
    END IF;
    IF ROW(NEW."importId", NEW."sourceRecordKey", NEW."rawText", NEW."displayLabel", NEW."sourceLocator", NEW."sourceOrder", NEW."checksum", NEW."createdAt")
       IS DISTINCT FROM
       ROW(OLD."importId", OLD."sourceRecordKey", OLD."rawText", OLD."displayLabel", OLD."sourceLocator", OLD."sourceOrder", OLD."checksum", OLD."createdAt") THEN
        RAISE EXCEPTION 'curriculum source provenance is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_source_records_immutable" BEFORE UPDATE OR DELETE ON "curriculum_source_records" FOR EACH ROW EXECUTE FUNCTION curriculum_guard_source_record();

CREATE FUNCTION curriculum_guard_issue_finding() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'curriculum import issues are retained';
    END IF;
    IF ROW(NEW."importId", NEW."sourceRecordId", NEW."code", NEW."severity", NEW."details", NEW."isBlocking", NEW."createdAt")
       IS DISTINCT FROM
       ROW(OLD."importId", OLD."sourceRecordId", OLD."code", OLD."severity", OLD."details", OLD."isBlocking", OLD."createdAt") THEN
        RAISE EXCEPTION 'curriculum issue findings are immutable';
    END IF;
    IF OLD."disposition" <> 'OPEN' THEN
        RAISE EXCEPTION 'resolved curriculum issues are immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_import_issues_immutable" BEFORE UPDATE OR DELETE ON "curriculum_import_issues" FOR EACH ROW EXECUTE FUNCTION curriculum_guard_issue_finding();
