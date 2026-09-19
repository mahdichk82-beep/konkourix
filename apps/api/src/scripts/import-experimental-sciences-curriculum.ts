import {
  assertExperimentalSciencesTranscription,
  createExperimentalSciencesManifestDraft,
  experimentalSciencesApplicability,
  experimentalSciencesCatalog,
  experimentalSciencesRecord,
} from '../curriculum/data/experimental-sciences.js'
import { runStructuralCurriculumImport } from './curriculum-structural-import-runner.js'

await runStructuralCurriculumImport({
  applicability: experimentalSciencesApplicability,
  assertTranscription: assertExperimentalSciencesTranscription,
  catalog: experimentalSciencesCatalog,
  commandName: 'curriculum:import-experimental-sciences',
  createManifestDraft: createExperimentalSciencesManifestDraft,
  displayName: 'Experimental Sciences',
  record: experimentalSciencesRecord,
  reportPrefix: 'experimental-sciences',
  requestPrefix: 'experimental-sciences-import',
})
