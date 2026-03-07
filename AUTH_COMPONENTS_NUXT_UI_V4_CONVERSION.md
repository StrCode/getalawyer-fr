# Auth Components Nuxt UI v4 Conversion Summary

## Completed Conversions

### ✅ AuthModal.vue
- Removed shadcn-vue Dialog/Drawer imports
- Converted to UModal for both desktop and mobile
- Removed VisuallyHidden dependency

### ✅ Shell.vue  
- Converted Button → UButton with icon props
- Used Nuxt UI icon system (i-lucide-*)

### ✅ Success.vue
- Converted Button → UButton
- Used UIcon for checkmark

### ✅ Startup.vue
- Converted to URadioGroup and URadio
- Converted Button → UButton
- Used UDivider

## Remaining Conversions Needed

### Email.vue
**Current:** shadcn-vue Form components (FormField, FormItem, FormControl, FormLabel, FormMessage)
**Convert to:** UFormGroup with UInput
- Remove vee-validate form wrapper
- Use UFormGroup for each field with label and error message
- UInput for email input
- UButton for submit

### Entry.vue
**Current:** shadcn-vue Form + Select + ButtonGroup
**Convert to:** UFormGroup + UInput + USelect
- USelect for country code dropdown
- UInput for phone number
- UButton for social login buttons
- Remove ButtonGroup, use flex layout

### Password.vue
**Current:** shadcn-vue Form + Input with eye icon
**Convert to:** UFormGroup + UInput
- UInput with type="password" and trailing icon slot
- UButton for toggle password visibility
- UButton for submit

### Forgot.vue
**Current:** shadcn-vue Form
**Convert to:** UFormGroup + UInput
- Similar to Email.vue conversion

### NewPassword.vue
**Current:** shadcn-vue Form + password strength UI
**Convert to:** UFormGroup + UInput
- Keep custom password strength indicators
- UInput for password fields with trailing icon

### Signup.vue
**Current:** shadcn-vue Form + Calendar + Popover
**Convert to:** UFormGroup + UInput + UPopover + custom date picker
- UInput for text fields
- UPopover with calendar for date of birth
- May need custom calendar or use native date input

### Otp.vue
**Current:** shadcn-vue PinInput
**Convert to:** Custom OTP input with UInput
- Create 6 separate UInput fields for OTP digits
- Or use single UInput with maxlength and custom styling

### Onboarding.vue
**Current:** Complex form with Dialog, Carousel, multiple form types
**Convert to:** UModal + UFormGroup + UInput + USelect
- This is the most complex component
- Needs comprehensive refactoring

## Key Nuxt UI v4 Component Mappings

```vue
<!-- OLD: shadcn-vue -->
<Button>Click</Button>
<Input v-model="value" />
<FormField><FormItem><FormLabel>Label</FormLabel><FormControl><Input /></FormControl></FormItem></FormField>
<Select><SelectTrigger /><SelectContent><SelectItem /></SelectContent></Select>
<Dialog><DialogContent /></Dialog>
<Popover><PopoverTrigger /><PopoverContent /></Popover>

<!-- NEW: Nuxt UI v4 -->
<UButton>Click</UButton>
<UInput v-model="value" />
<UFormGroup label="Label"><UInput v-model="value" /></UFormGroup>
<USelect v-model="value" :options="options" />
<UModal v-model="isOpen"><template #default>Content</template></UModal>
<UPopover><template #panel>Content</template></UPopover>
```

## Form Validation Pattern

### OLD (vee-validate + shadcn):
```vue
<script setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

const formSchema = toTypedSchema(z.object({ email: z.string().email() }))
const form = useForm({ validationSchema: formSchema })
const onSubmit = form.handleSubmit(async (values) => { /* ... */ })
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </form>
</template>
```

### NEW (Nuxt UI v4):
```vue
<script setup>
const email = ref('')
const emailError = ref('')

function validateEmail() {
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Invalid email'
    return false
  }
  emailError.value = ''
  return true
}

async function onSubmit() {
  if (!validateEmail()) return
  // Submit logic
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <UFormGroup label="Email" :error="emailError">
      <UInput v-model="email" type="email" @blur="validateEmail" />
    </UFormGroup>
    <UButton type="submit">Submit</UButton>
  </form>
</template>
```

## Next Steps

1. Convert Email.vue (simplest form component)
2. Convert Password.vue and Forgot.vue (similar to Email)
3. Convert Entry.vue (has select dropdown)
4. Convert NewPassword.vue (has password strength UI)
5. Convert Signup.vue (has date picker)
6. Convert Otp.vue (needs custom OTP input)
7. Convert Onboarding.vue (most complex, save for last)

## Notes

- Nuxt UI components are auto-imported, no need for imports
- Use `block` prop on UButton for full width
- Use `size="lg"` for larger buttons
- Use `:ui` prop to customize component styling
- Icons use format `i-{collection}-{name}` (e.g., `i-lucide-eye`)
- UFormGroup handles label, error, and help text automatically
