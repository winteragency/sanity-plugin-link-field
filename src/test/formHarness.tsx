import {createClient, type SanityClient} from '@sanity/client'
import {LayerProvider, PortalProvider, ThemeProvider} from '@sanity/ui'
import {ToastProvider} from '@sanity/ui/toast'
import {render, type RenderResult} from '@testing-library/react'
import {type ReactNode, useCallback, useMemo, useState} from 'react'
import {of} from 'rxjs'
import {DocumentPaneContext} from 'sanity/_singletons'
import {
  ChangeIndicatorsTracker,
  CopyPasteProvider,
  createPatchChannel,
  createWorkspaceFromConfig,
  defaultTheme,
  EMPTY_ARRAY,
  FormBuilder,
  LocaleProvider,
  PerspectiveProvider,
  type ObjectSchemaType,
  type Path,
  type PatchEvent,
  ResourceCacheProvider,
  type SanityDocument,
  SourceProvider,
  useFormState,
  type Workspace,
  WorkspaceProvider,
  type SingleWorkspace,
} from 'sanity'

/**
 * Test-only helpers that render a document form using the real Sanity Studio
 * form builder, so the plugin's input components are exercised exactly as they
 * are in a running Studio.
 */

const currentUser = {
  id: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  role: 'administrator',
  roles: [{name: 'administrator', title: 'Administrator'}],
}

/** Keeps the harness fully offline: no project lookup, no auth round-trip. */
function createMockAuthStore(client: SanityClient) {
  return {
    state: of({authenticated: true, currentUser, client}),
    token: of(null),
  } as never
}

export async function createTestWorkspace(config: Partial<SingleWorkspace>): Promise<Workspace> {
  const client = createClient({
    projectId: 'test',
    dataset: 'test',
    apiVersion: '2024-01-01',
    useCdn: false,
    useProjectHostname: false,
    requestTagPrefix: 'test',
  })

  return createWorkspaceFromConfig({
    dataset: 'test',
    ...config,
    projectId: 'test',
    auth: createMockAuthStore(client),
  } as SingleWorkspace)
}

function TestProvider({workspace, children}: {workspace: Workspace; children: ReactNode}) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <ToastProvider>
        <LayerProvider>
          <PortalProvider>
            <WorkspaceProvider workspace={workspace}>
              <SourceProvider source={workspace as never}>
                <LocaleProvider>
                  <ResourceCacheProvider>
                    <PerspectiveProvider
                      selectedPerspectiveName={undefined}
                      excludedPerspectives={EMPTY_ARRAY}
                    >
                      <CopyPasteProvider>
                        <ChangeIndicatorsTracker>{children}</ChangeIndicatorsTracker>
                      </CopyPasteProvider>
                    </PerspectiveProvider>
                  </ResourceCacheProvider>
                </LocaleProvider>
              </SourceProvider>
            </WorkspaceProvider>
          </PortalProvider>
        </LayerProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

const patchChannel = createPatchChannel()

function DocumentForm(props: {
  schemaType: ObjectSchemaType
  documentValue: SanityDocument
  onChange?: (event: PatchEvent) => void
}) {
  const [focusPath, setFocusPath] = useState<Path>([])
  const [openPath, setOpenPath] = useState<Path>([])

  const formState = useFormState({
    schemaType: props.schemaType,
    documentValue: props.documentValue,
    comparisonValue: props.documentValue,
    focusPath,
    openPath,
    presence: [],
    validation: [],
    perspective: {selectedPerspectiveName: undefined} as never,
    hasUpstreamVersion: false,
  })

  const noop = useCallback(() => {}, [])
  const handleChange = useCallback(
    (event: PatchEvent) => props.onChange?.(event),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onChange],
  )

  const value = useMemo(() => props.documentValue, [props.documentValue])

  // Enough of the document pane contract for plugins that read it (eg.
  // sanity-plugin-internationalized-array) to render inside the harness.
  const documentPane = useMemo(
    () => ({
      formState,
      onChange: handleChange,
      isDeleted: false,
      isDeleting: false,
      isInitialValueLoading: false,
      ready: true,
    }),
    [formState, handleChange],
  )

  if (!formState) return null

  return (
    <DocumentPaneContext.Provider value={documentPane as never}>
      <FormBuilder
        __internal_patchChannel={patchChannel}
        changed={formState.changed}
        collapsedFieldSets={undefined}
        collapsedPaths={undefined}
        hasUpstreamVersion={false}
        focusPath={focusPath}
        focused={formState.focused}
        groups={formState.groups}
        id="root"
        members={formState.members}
        onChange={handleChange}
        onFieldGroupSelect={noop}
        onPathBlur={noop}
        onPathFocus={setFocusPath}
        onPathOpen={setOpenPath}
        onSetFieldSetCollapsed={noop}
        onSetPathCollapsed={noop}
        openPath={openPath}
        presence={[]}
        readOnly={false}
        schemaType={formState.schemaType}
        validation={[]}
        value={value as never}
      />
    </DocumentPaneContext.Provider>
  )
}

/**
 * Labels, legends and field test ids currently rendered by the form, in document
 * order. Gives tests a readable snapshot of a form's structure.
 */
export function renderedFormOutline(): string[] {
  return Array.from(document.querySelectorAll('legend, label, [data-testid^="fieldset-"]')).map(
    (element) => {
      const fieldsetName = element.getAttribute('data-testid')
      if (fieldsetName) return fieldsetName
      return `${element.tagName.toLowerCase()}:${element.textContent?.trim() ?? ''}`
    },
  )
}

export async function renderDocumentForm(options: {
  config: Partial<SingleWorkspace>
  documentType: string
  documentValue?: Record<string, unknown>
  onChange?: (event: PatchEvent) => void
}): Promise<RenderResult> {
  const workspace = await createTestWorkspace(options.config)
  const schemaType = workspace.schema.get(options.documentType) as ObjectSchemaType

  if (!schemaType) {
    throw new Error(`Unknown document type: ${options.documentType}`)
  }

  const documentValue = {
    _id: 'test-document',
    _type: options.documentType,
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'test',
    ...options.documentValue,
  } as SanityDocument

  return render(
    <TestProvider workspace={workspace}>
      <DocumentForm
        schemaType={schemaType}
        documentValue={documentValue}
        onChange={options.onChange}
      />
    </TestProvider>,
  )
}
