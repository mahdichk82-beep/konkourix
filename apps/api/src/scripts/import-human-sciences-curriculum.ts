import {
  assertHumanSciencesTranscription,
  createHumanSciencesManifestDraft,
  humanSciencesApplicability,
  humanSciencesCatalog,
  humanSciencesRecord,
} from '../curriculum/data/human-sciences.js'
import { runStructuralCurriculumImport } from './curriculum-structural-import-runner.js'

await runStructuralCurriculumImport({
  applicability: humanSciencesApplicability,
  assertTranscription: assertHumanSciencesTranscription,
  catalog: humanSciencesCatalog,
  commandName: 'curriculum:import-human-sciences',
  createManifestDraft: createHumanSciencesManifestDraft,
  displayName: 'Human Sciences',
  record: humanSciencesRecord,
  reportPrefix: 'human-sciences',
  requestPrefix: 'human-sciences-import',
})
