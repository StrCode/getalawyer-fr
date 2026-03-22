import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentManager from '../DocumentManager.vue'

// Mock the composables
vi.mock('~/composables/useDocuments', () => ({
  useDocuments: () => ({
    documents: ref([]),
    loading: ref(false),
    uploadingDocuments: ref([]),
    fetchCaseDocuments: vi.fn(),
    uploadDocument: vi.fn(),
    getDownloadUrl: vi.fn(),
    deleteDocument: vi.fn()
  })
}))

vi.mock('~/composables/useApiErrorHandler', () => ({
  useApiErrorHandler: () => ({
    handleApiError: vi.fn()
  })
}))

describe('DocumentManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the document manager interface', () => {
    const wrapper = mount(DocumentManager, {
      props: {
        caseId: 'test-case-id'
      }
    })

    expect(wrapper.find('h3').text()).toContain('Document Manager')
    expect(wrapper.find('[data-testid="upload-area"]').exists()).toBe(true)
  })

  it('validates file size limits', async () => {
    const wrapper = mount(DocumentManager, {
      props: {
        caseId: 'test-case-id'
      }
    })

    // Create a mock file that exceeds 25MB
    const largeFile = new File(['x'.repeat(26 * 1024 * 1024)], 'large-file.pdf', {
      type: 'application/pdf'
    })

    const component = wrapper.vm as any
    await component.handleFiles([largeFile])

    // Should show error for file size
    expect(wrapper.vm.uploadErrors).toHaveLength(1)
    expect(wrapper.vm.uploadErrors[0].message).toContain('25MB limit')
  })

  it('validates file types', async () => {
    const wrapper = mount(DocumentManager, {
      props: {
        caseId: 'test-case-id'
      }
    })

    // Create a mock file with unsupported type
    const unsupportedFile = new File(['content'], 'test.exe', {
      type: 'application/x-executable'
    })

    const component = wrapper.vm as any
    await component.handleFiles([unsupportedFile])

    // Should show error for file type
    expect(wrapper.vm.uploadErrors).toHaveLength(1)
    expect(wrapper.vm.uploadErrors[0].message).toContain('not supported')
  })

  it('accepts valid file types', async () => {
    const { uploadDocument } = useDocuments()
    
    const wrapper = mount(DocumentManager, {
      props: {
        caseId: 'test-case-id'
      }
    })

    // Create a valid PDF file
    const validFile = new File(['pdf content'], 'document.pdf', {
      type: 'application/pdf'
    })

    const component = wrapper.vm as any
    await component.handleFiles([validFile])

    // Should call upload function
    expect(uploadDocument).toHaveBeenCalledWith('test-case-id', validFile)
  })
})