-- Allow an approved cross-version mapping to be corrected by an immutable
-- superseding record while still preventing duplicate effective decisions.
DROP INDEX "curriculum_node_mappings_endpoint_key";

CREATE UNIQUE INDEX "curriculum_node_mappings_effective_endpoint_key"
ON "curriculum_node_mappings"(
    "fromVersionId",
    "fromNodeId",
    "toVersionId",
    "toNodeId",
    "mappingType"
)
WHERE "status" <> 'SUPERSEDED';
