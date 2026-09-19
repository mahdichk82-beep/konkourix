export const curriculumNodeParentPolicy: Readonly<Record<string, readonly string[]>> = {
  CURRICULUM_ROOT: [],
  FIELD: ['CURRICULUM_ROOT'],
  GRADE: ['CURRICULUM_ROOT', 'FIELD'],
  SUBJECT: ['CURRICULUM_ROOT', 'FIELD', 'GRADE'],
  CHAPTER: ['CURRICULUM_ROOT', 'FIELD', 'GRADE', 'SUBJECT'],
  TOPIC: ['CURRICULUM_ROOT', 'FIELD', 'GRADE', 'SUBJECT', 'CHAPTER'],
  CONCEPT: ['CURRICULUM_ROOT', 'FIELD', 'GRADE', 'SUBJECT', 'CHAPTER', 'TOPIC'],
  SUBCONCEPT: ['CURRICULUM_ROOT', 'FIELD', 'GRADE', 'SUBJECT', 'CHAPTER', 'TOPIC', 'CONCEPT'],
}

export const curriculumParentTypeIsAllowed = (
  childType: string,
  parentType: string | null,
): boolean => {
  const allowed = curriculumNodeParentPolicy[childType]
  if (!allowed) return false
  return parentType === null ? childType === 'CURRICULUM_ROOT' : allowed.includes(parentType)
}
