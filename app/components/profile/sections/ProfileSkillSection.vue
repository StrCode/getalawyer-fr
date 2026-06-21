<script setup lang="ts">
import ProfileDeleteConfirmDialog from '@/components/profile/ProfileDeleteConfirmDialog.vue'
import ProfileEntryDialog from '@/components/profile/ProfileEntryDialog.vue'
import { PhPencilSimple, PhPlus, PhX } from '@phosphor-icons/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { CreateSkillInput, LawyerProfileSkill } from '~/types/lawyer-profile-editor'

const props = defineProps<{
  items: LawyerProfileSkill[]
  disabled?: boolean
  saving?: boolean
  onCreate: (payload: CreateSkillInput) => Promise<void>
  onUpdate: (payload: { id: string; data: Partial<CreateSkillInput> }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}>()

const dialogOpen = ref(false)
const deleteOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteId = ref<string | null>(null)
const name = ref('')

function openCreate() {
  editingId.value = null
  name.value = ''
  dialogOpen.value = true
}

function openEdit(item: LawyerProfileSkill) {
  editingId.value = item.id
  name.value = item.name
  dialogOpen.value = true
}

function openDelete(id: string) {
  deleteId.value = id
  deleteOpen.value = true
}

const canSave = computed(() => name.value.trim().length > 0)

const dialogTitle = computed(() =>
  editingId.value ? 'Edit skill' : 'Add skill',
)

async function onSave() {
  if (!canSave.value) return
  const payload = { name: name.value.trim() }
  try {
    if (editingId.value) {
      await props.onUpdate({ id: editingId.value, data: payload })
    } else {
      await props.onCreate(payload)
    }
    dialogOpen.value = false
    editingId.value = null
  } catch {
    // Parent shows toast
  }
}

async function onDeleteConfirm() {
  if (!deleteId.value) return
  try {
    await props.onDelete(deleteId.value)
    deleteOpen.value = false
    deleteId.value = null
  } catch {
    // Parent shows toast
  }
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between gap-3">
        <div>
          <CardTitle class="text-base">
            Skills
          </CardTitle>
          <CardDescription>
            Expertise and tools you want clients to know about.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          :disabled="disabled"
          @click="openCreate"
        >
          <PhPlus class="size-4" />
          Add
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <p
        v-if="items.length === 0"
        class="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground"
      >
        No skills added yet.
      </p>
      <div
        v-else
        class="flex flex-wrap gap-2"
      >
        <Badge
          v-for="item in items"
          :key="item.id"
          variant="secondary"
          class="gap-1.5 py-1.5 pl-3 pr-1.5 text-sm font-medium"
        >
          {{ item.name }}
          <button
            type="button"
            class="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            :disabled="disabled"
            aria-label="Edit skill"
            @click="openEdit(item)"
          >
            <PhPencilSimple class="size-3.5" />
          </button>
          <button
            type="button"
            class="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
            :disabled="disabled"
            aria-label="Remove skill"
            @click="openDelete(item.id)"
          >
            <PhX class="size-3.5" />
          </button>
        </Badge>
      </div>
    </CardContent>
  </Card>

  <ProfileEntryDialog
    v-model:open="dialogOpen"
    :title="dialogTitle"
    description="Add a skill or area of expertise."
    :save-label="editingId ? 'Update' : 'Add'"
    :saving="saving"
    :save-disabled="!canSave"
    @save="onSave"
  >
    <Field>
      <FieldLabel for="skill-name">
        Skill name
      </FieldLabel>
      <Input
        id="skill-name"
        v-model="name"
        maxlength="80"
        placeholder="e.g. Contract negotiation"
        @keydown.enter.prevent="onSave"
      />
    </Field>
  </ProfileEntryDialog>

  <ProfileDeleteConfirmDialog
    v-model:open="deleteOpen"
    title="Remove skill?"
    description="This skill will no longer appear on your public profile."
    :deleting="saving"
    @confirm="onDeleteConfirm"
  />
</template>
