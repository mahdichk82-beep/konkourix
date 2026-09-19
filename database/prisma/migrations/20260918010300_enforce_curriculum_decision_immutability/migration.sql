-- Preserve approved mapping and capability-grant history at the database boundary.
-- Superseding decisions are inserted in the same transaction, so their
-- self-referential foreign keys are checked at transaction commit.

ALTER TABLE "curriculum_node_mappings"
DROP CONSTRAINT "curriculum_node_mappings_supersededById_fkey";

ALTER TABLE "curriculum_node_mappings"
ADD CONSTRAINT "curriculum_node_mappings_supersededById_fkey"
FOREIGN KEY ("supersededById") REFERENCES "curriculum_node_mappings"("id")
ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "legacy_curriculum_mappings"
DROP CONSTRAINT "legacy_curriculum_mappings_supersededById_fkey";

ALTER TABLE "legacy_curriculum_mappings"
ADD CONSTRAINT "legacy_curriculum_mappings_supersededById_fkey"
FOREIGN KEY ("supersededById") REFERENCES "legacy_curriculum_mappings"("id")
ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

CREATE FUNCTION curriculum_guard_node_mapping() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'curriculum mapping decisions are retained';
    END IF;
    IF OLD."status" = 'APPROVED'
       AND NEW."status" = 'SUPERSEDED'
       AND NEW."supersededById" IS NOT NULL
       AND ROW(NEW."id", NEW."fromVersionId", NEW."fromNodeId", NEW."toVersionId", NEW."toNodeId", NEW."mappingType", NEW."confidence", NEW."rationale", NEW."createdById", NEW."approvedById", NEW."approvedAt", NEW."createdAt")
           IS NOT DISTINCT FROM
           ROW(OLD."id", OLD."fromVersionId", OLD."fromNodeId", OLD."toVersionId", OLD."toNodeId", OLD."mappingType", OLD."confidence", OLD."rationale", OLD."createdById", OLD."approvedById", OLD."approvedAt", OLD."createdAt") THEN
        RETURN NEW;
    END IF;
    RAISE EXCEPTION 'approved curriculum mapping decisions are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_node_mappings_immutable"
BEFORE UPDATE OR DELETE ON "curriculum_node_mappings"
FOR EACH ROW EXECUTE FUNCTION curriculum_guard_node_mapping();

CREATE FUNCTION curriculum_guard_legacy_mapping() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'legacy curriculum mapping decisions are retained';
    END IF;
    IF OLD."supersededById" IS NULL
       AND NEW."supersededById" IS NOT NULL
       AND ROW(NEW."id", NEW."legacyKind", NEW."studySubjectId", NEW."topicId", NEW."curriculumVersionId", NEW."curriculumNodeId", NEW."decision", NEW."rationale", NEW."createdById", NEW."reviewedById", NEW."reviewedAt", NEW."createdAt")
           IS NOT DISTINCT FROM
           ROW(OLD."id", OLD."legacyKind", OLD."studySubjectId", OLD."topicId", OLD."curriculumVersionId", OLD."curriculumNodeId", OLD."decision", OLD."rationale", OLD."createdById", OLD."reviewedById", OLD."reviewedAt", OLD."createdAt") THEN
        RETURN NEW;
    END IF;
    RAISE EXCEPTION 'legacy curriculum mapping decisions are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "legacy_curriculum_mappings_immutable"
BEFORE UPDATE OR DELETE ON "legacy_curriculum_mappings"
FOR EACH ROW EXECUTE FUNCTION curriculum_guard_legacy_mapping();

CREATE FUNCTION curriculum_guard_capability_grant() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'curriculum capability grants are retained';
    END IF;
    IF OLD."revokedAt" IS NULL
       AND NEW."revokedAt" IS NOT NULL
       AND NEW."revokedById" IS NOT NULL
       AND length(trim(NEW."revokeReason")) > 0
       AND ROW(NEW."id", NEW."userId", NEW."capability", NEW."scope", NEW."expiresAt", NEW."grantedById", NEW."grantReason", NEW."grantedAt")
           IS NOT DISTINCT FROM
           ROW(OLD."id", OLD."userId", OLD."capability", OLD."scope", OLD."expiresAt", OLD."grantedById", OLD."grantReason", OLD."grantedAt") THEN
        RETURN NEW;
    END IF;
    RAISE EXCEPTION 'curriculum capability grant facts are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "curriculum_capability_grants_immutable"
BEFORE UPDATE OR DELETE ON "curriculum_capability_grants"
FOR EACH ROW EXECUTE FUNCTION curriculum_guard_capability_grant();
