import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AuthApiError } from '../auth/auth-client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ContentState } from '../components/ui/ContentState'
import { planningClient, type StudySubject } from '../planning/planning-client'
import { topicClient, type Topic } from '../subjects/topic-client'
import '../subjects/subjects.css'

const numberFormatter = new Intl.NumberFormat('fa-IR')

const errorMessage = (error: unknown): string => {
  if (error instanceof AuthApiError) {
    if (error.code === 'SUBJECT_CONFLICT') return 'درسی با این نام از قبل وجود دارد.'
    if (error.code === 'TOPIC_CONFLICT') return 'مبحثی با این عنوان در این درس وجود دارد.'
    if (error.code === 'SUBJECT_ARCHIVED') return 'برای درس بایگانی‌شده نمی‌توان مبحث تازه ساخت.'
    if (error.code === 'SUBJECT_NOT_FOUND') return 'این درس پیدا نشد یا به حساب شما تعلق ندارد.'
    if (error.code === 'TOPIC_NOT_FOUND') return 'این مبحث پیدا نشد یا به حساب شما تعلق ندارد.'
  }
  return 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.'
}

const mergeById = <T extends { id: string }>(items: T[]): T[] =>
  [...new Map(items.map((item) => [item.id, item])).values()]

const loadAllSubjects = async (): Promise<StudySubject[]> => {
  const items: StudySubject[] = []
  let cursor: string | undefined
  do {
    const page = await planningClient.listSubjects(cursor)
    items.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return mergeById(items)
}

const loadAllTopics = async (subjectId: string): Promise<Topic[]> => {
  const items: Topic[] = []
  let cursor: string | undefined
  do {
    const page = await topicClient.list(subjectId, cursor)
    items.push(...page.items)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return mergeById(items)
}

export function SubjectTopicsPage() {
  const [subjects, setSubjects] = useState<StudySubject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [subjectName, setSubjectName] = useState('')
  const [topicTitle, setTopicTitle] = useState('')
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [subjectError, setSubjectError] = useState<string | null>(null)
  const [topicError, setTopicError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [isCreatingSubject, setIsCreatingSubject] = useState(false)
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [topicRefreshKey, setTopicRefreshKey] = useState(0)
  const [updatingTopicIds, setUpdatingTopicIds] = useState<Set<string>>(new Set())

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects],
  )

  const refreshSubjects = async () => {
    setSubjectError(null)
    setIsLoadingSubjects(true)
    try {
      const items = await loadAllSubjects()
      setSubjects(items)
      setSelectedSubjectId((current) =>
        current && items.some((subject) => subject.id === current) ? current : null,
      )
    } catch (error) {
      setSubjectError(errorMessage(error))
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  useEffect(() => {
    let active = true
    void loadAllSubjects().then((items) => {
      if (!active) return
      setSubjects(items)
    }).catch((error: unknown) => {
      if (active) setSubjectError(errorMessage(error))
    }).finally(() => {
      if (active) setIsLoadingSubjects(false)
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedSubjectId) return

    let active = true
    const fetchTopics = async () => {
      await Promise.resolve()
      if (!active) return
      setIsLoadingTopics(true)
      setTopicError(null)
      setTopics([])
      try {
        const items = await loadAllTopics(selectedSubjectId)
        if (active) setTopics(items)
      } catch (error) {
        if (active) setTopicError(errorMessage(error))
      } finally {
        if (active) setIsLoadingTopics(false)
      }
    }
    void fetchTopics()

    return () => {
      active = false
    }
  }, [selectedSubjectId, topicRefreshKey])

  const handleSubjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubjectError(null)
    setSuccess(null)
    const name = subjectName.trim()
    if (!name) {
      setSubjectError('نام درس را وارد کنید.')
      return
    }

    setIsCreatingSubject(true)
    try {
      const created = await planningClient.createSubject(name)
      setSubjects((current) => mergeById([created, ...current]))
      setSubjectName('')
      setSelectedSubjectId(created.id)
      setSuccess(`درس «${created.name}» ساخته شد. حالا می‌توانید مباحث آن را اضافه کنید.`)
    } catch (error) {
      setSubjectError(errorMessage(error))
    } finally {
      setIsCreatingSubject(false)
    }
  }

  const handleTopicSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSubject) return
    setTopicError(null)
    setSuccess(null)
    const title = topicTitle.trim()
    if (!title) {
      setTopicError('عنوان مبحث را وارد کنید.')
      return
    }

    setIsCreatingTopic(true)
    try {
      const created = await topicClient.create(selectedSubject.id, title)
      setTopics((current) => mergeById([created, ...current]))
      setTopicTitle('')
      setSuccess(`مبحث «${created.title}» به درس ${selectedSubject.name} اضافه شد.`)
    } catch (error) {
      setTopicError(errorMessage(error))
    } finally {
      setIsCreatingTopic(false)
    }
  }

  const beginRename = (topic: Topic) => {
    setEditingTopicId(topic.id)
    setEditingTitle(topic.title)
    setTopicError(null)
    setSuccess(null)
  }

  const handleRename = async (event: FormEvent<HTMLFormElement>, topic: Topic) => {
    event.preventDefault()
    const title = editingTitle.trim()
    if (!title) {
      setTopicError('عنوان مبحث را وارد کنید.')
      return
    }

    setUpdatingTopicIds((current) => new Set(current).add(topic.id))
    setTopicError(null)
    setSuccess(null)
    try {
      const updated = await topicClient.update(topic.id, { title })
      setTopics((current) => current.map((item) => item.id === updated.id ? updated : item))
      setEditingTopicId(null)
      setEditingTitle('')
      setSuccess(`عنوان مبحث به «${updated.title}» تغییر کرد.`)
    } catch (error) {
      setTopicError(errorMessage(error))
    } finally {
      setUpdatingTopicIds((current) => {
        const next = new Set(current)
        next.delete(topic.id)
        return next
      })
    }
  }

  const handleArchive = async (topic: Topic) => {
    const restoring = topic.archivedAt !== null
    if (!restoring && !window.confirm(`مبحث «${topic.title}» بایگانی شود؟`)) return

    setUpdatingTopicIds((current) => new Set(current).add(topic.id))
    setTopicError(null)
    setSuccess(null)
    try {
      const updated = await topicClient.update(topic.id, { archived: !restoring })
      setTopics((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSuccess(restoring ? 'مبحث از بایگانی خارج شد.' : 'مبحث بایگانی شد و حذف دائمی نشد.')
    } catch (error) {
      setTopicError(errorMessage(error))
    } finally {
      setUpdatingTopicIds((current) => {
        const next = new Set(current)
        next.delete(topic.id)
        return next
      })
    }
  }

  return (
    <div className="page-stack subjects-page">
      <Card className="subjects-hero">
        <div>
          <p className="eyebrow">ساختار مطالعه من</p>
          <h2>درس‌ها و مباحث را یک‌جا مرتب کنید</h2>
          <p>هر مبحث زیر درس متعلق به خودتان نگهداری می‌شود و بعداً پایه برنامه‌ریزی دقیق‌تر خواهد بود.</p>
        </div>
        <span className="subjects-hero__count">
          {numberFormatter.format(subjects.length)} درس
        </span>
      </Card>

      {success && <p className="form-success subjects-message" role="status">{success}</p>}

      <div className="subjects-workspace">
        <Card className="subjects-panel">
          <div className="subjects-panel__heading">
            <div>
              <h2>درس‌های من</h2>
              <p>یک درس را باز کنید تا مباحثش نمایش داده شود.</p>
            </div>
          </div>

          <form className="subject-create-form" onSubmit={handleSubjectSubmit}>
            <label htmlFor="new-subject-name">
              نام درس تازه
              <input
                id="new-subject-name"
                maxLength={200}
                onChange={(event) => setSubjectName(event.target.value)}
                placeholder="مثلاً ریاضی"
                value={subjectName}
              />
            </label>
            <Button disabled={isCreatingSubject} type="submit">
              {isCreatingSubject ? 'در حال ساخت…' : 'ساخت درس'}
            </Button>
          </form>

          {subjectError && <p className="form-error" role="alert">{subjectError}</p>}

          {isLoadingSubjects ? (
            <ContentState kind="loading" title="در حال دریافت درس‌ها" description="فهرست امن درس‌های شما دریافت می‌شود." />
          ) : subjectError && subjects.length === 0 ? (
            <ContentState kind="error" title="درس‌ها دریافت نشد" description={subjectError} action={<Button onClick={() => void refreshSubjects()}>تلاش دوباره</Button>} />
          ) : subjects.length === 0 ? (
            <ContentState kind="empty" title="هنوز درسی ندارید" description="نام اولین درس را در فرم بالا وارد کنید." />
          ) : (
            <div className="subject-list">
              {subjects.map((subject) => (
                <button
                  className={`subject-row${selectedSubjectId === subject.id ? ' subject-row--selected' : ''}`}
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubjectId(subject.id)
                    setSuccess(null)
                  }}
                  type="button"
                >
                  <span>{subject.name}</span>
                  <small>{subject.archivedAt ? 'بایگانی‌شده' : 'فعال'}</small>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="topics-panel">
          {!selectedSubject ? (
            <ContentState kind="empty" title="یک درس را باز کنید" description="با انتخاب یک درس، فهرست مباحث و ابزارهای مدیریت آن اینجا نمایش داده می‌شود." />
          ) : (
            <>
              <div className="topics-heading">
                <div>
                  <p className="eyebrow">مباحث درس</p>
                  <h2>{selectedSubject.name}</h2>
                </div>
                {selectedSubject.archivedAt && <span className="archive-badge">درس بایگانی‌شده</span>}
              </div>

              <form className="topic-create-form" onSubmit={handleTopicSubmit}>
                <label htmlFor="new-topic-title">
                  عنوان مبحث تازه
                  <input
                    disabled={selectedSubject.archivedAt !== null}
                    id="new-topic-title"
                    maxLength={200}
                    onChange={(event) => setTopicTitle(event.target.value)}
                    placeholder="مثلاً تابع و نمودار"
                    value={topicTitle}
                  />
                </label>
                <Button disabled={isCreatingTopic || selectedSubject.archivedAt !== null} type="submit">
                  {isCreatingTopic ? 'در حال افزودن…' : 'افزودن مبحث'}
                </Button>
              </form>
              {selectedSubject.archivedAt && <p className="helper-text">برای درس بایگانی‌شده امکان ساخت مبحث تازه وجود ندارد.</p>}
              {topicError && <p className="form-error" role="alert">{topicError}</p>}

              {isLoadingTopics ? (
                <ContentState kind="loading" title="در حال دریافت مباحث" description={`مباحث درس ${selectedSubject.name} دریافت می‌شود.`} />
              ) : topicError && topics.length === 0 ? (
                <ContentState kind="error" title="مباحث دریافت نشد" description={topicError} action={<Button onClick={() => setTopicRefreshKey((current) => current + 1)}>تلاش دوباره</Button>} />
              ) : topics.length === 0 ? (
                <ContentState kind="empty" title="این درس هنوز مبحثی ندارد" description="عنوان اولین مبحث را در فرم بالا وارد کنید." />
              ) : (
                <div className="topic-list">
                  {topics.map((topic) => {
                    const isUpdating = updatingTopicIds.has(topic.id)
                    const isEditing = editingTopicId === topic.id
                    return (
                      <article className={`topic-row${topic.archivedAt ? ' topic-row--archived' : ''}`} key={topic.id}>
                        {isEditing ? (
                          <form className="topic-rename-form" onSubmit={(event) => void handleRename(event, topic)}>
                            <label htmlFor={`topic-title-${topic.id}`}>
                              عنوان مبحث
                              <input
                                autoFocus
                                id={`topic-title-${topic.id}`}
                                maxLength={200}
                                onChange={(event) => setEditingTitle(event.target.value)}
                                value={editingTitle}
                              />
                            </label>
                            <div className="topic-actions">
                              <Button disabled={isUpdating} type="submit">ذخیره</Button>
                              <Button disabled={isUpdating} onClick={() => setEditingTopicId(null)} variant="ghost">انصراف</Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="topic-row__title">
                              <h3>{topic.title}</h3>
                              <span>{topic.archivedAt ? 'بایگانی‌شده' : 'فعال'}</span>
                            </div>
                            <div className="topic-actions">
                              <Button disabled={isUpdating} onClick={() => beginRename(topic)} variant="ghost">تغییر نام</Button>
                              <Button disabled={isUpdating} onClick={() => void handleArchive(topic)} variant={topic.archivedAt ? 'secondary' : 'danger'}>
                                {isUpdating ? 'در حال ثبت…' : topic.archivedAt ? 'بازگردانی' : 'بایگانی'}
                              </Button>
                            </div>
                          </>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
