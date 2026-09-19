import {
  assertMathematicsPhysicsTranscription,
  createMathematicsPhysicsManifestDraft,
  mathematicsPhysicsApplicability,
  mathematicsPhysicsCatalog,
  mathematicsPhysicsRecord,
} from '../curriculum/data/mathematics-physics.js'
import { runStructuralCurriculumImport } from './curriculum-structural-import-runner.js'

await runStructuralCurriculumImport({
  applicability: mathematicsPhysicsApplicability,
  assertTranscription: assertMathematicsPhysicsTranscription,
  catalog: mathematicsPhysicsCatalog,
  commandName: 'curriculum:import-mathematics-physics',
  createManifestDraft: createMathematicsPhysicsManifestDraft,
  displayName: 'Mathematics & Physics',
  record: mathematicsPhysicsRecord,
  reportPrefix: 'mathematics-physics',
  requestPrefix: 'mathematics-physics-import',
})
