import type { TypedSchema, TypedSchemaError } from 'vee-validate'

/**
 * Minimal Standard Schema v1 surface (implemented by zod 4) — enough to
 * validate without depending on @standard-schema/spec.
 */
interface StandardSchemaV1<TInput = unknown, TOutput = TInput> {
  '~standard': {
    version: 1
    vendor: string
    validate: (value: unknown) =>
      | StandardResult<TOutput>
      | Promise<StandardResult<TOutput>>
  }
}

type StandardResult<TOutput> =
  | { value: TOutput; issues?: undefined }
  | { issues: ReadonlyArray<StandardIssue> }

interface StandardIssue {
  message: string
  path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>
}

/**
 * Adapt any Standard Schema (zod 4, valibot, arktype…) to vee-validate's
 * TypedSchema. The official @vee-validate/zod adapter peers on zod 3, and
 * vee-validate 4.15 core predates the Standard Schema spec — this bridges
 * the gap in ~30 lines.
 */
export function toTypedSchema<TInput, TOutput>(
  schema: StandardSchemaV1<TInput, TOutput>
): TypedSchema<Partial<TInput>, TOutput> {
  return {
    __type: 'VVTypedSchema',
    async parse(values) {
      const result = await schema['~standard'].validate(values)
      if (result.issues) {
        const byPath = new Map<string, string[]>()
        for (const issue of result.issues) {
          const path = (issue.path ?? [])
            .map(seg => (typeof seg === 'object' && seg !== null ? seg.key : seg))
            .join('.')
          const messages = byPath.get(path) ?? []
          messages.push(issue.message)
          byPath.set(path, messages)
        }
        const errors: TypedSchemaError[] = [...byPath.entries()].map(
          ([path, messages]) => ({ path: path || undefined, errors: messages })
        )
        return { errors }
      }
      return { value: result.value, errors: [] }
    }
  }
}
