import type { z } from 'zod';
import type { Rule } from 'antd/es/form';

/**
 * Safe type check using constructor.name.
 * Works across multiple zod instances and zod v3/v4.
 */
function isType(schema: any, name: string): boolean {
  // constructor.name works across zod instances and versions
  if (schema?.constructor?.name === name) return true;
  // Fallback: zod v3 _def.typeName
  if (schema?._def?.typeName === name) return true;
  return false;
}

/**
 * Recursively unwrap ZodEffects (.refine(), .transform(), etc.)
 */
function unwrapEffects(schema: any): any {
  let current = schema;
  while (isType(current, 'ZodEffects')) {
    current = current._def.schema;
  }
  return current;
}

/**
 * Check if a schema is optional (handles nested effects)
 */
function isOptional(schema: any): boolean {
  if (isType(schema, 'ZodOptional') || isType(schema, 'ZodNullable') || isType(schema, 'ZodDefault')) return true;
  if (isType(schema, 'ZodEffects')) return isOptional(schema._def.schema);
  return false;
}

/**
 * Get the shape of a ZodObject, handling both v3 and v4
 */
function getShape(schema: any): Record<string, any> | null {
  // v3: .shape is a plain object, or ._def.shape() is a function
  // v4: ._def.shape is a plain object, or .shape is a plain object
  if (schema.shape && typeof schema.shape === 'object' && !('parse' in schema.shape)) {
    return schema.shape;
  }
  if (typeof schema._def?.shape === 'function') {
    return schema._def.shape();
  }
  if (schema._def?.shape && typeof schema._def.shape === 'object') {
    return schema._def.shape;
  }
  return null;
}

/**
 * Get the inner type from optional/nullable wrappers (v3 + v4)
 */
function getInnerType(schema: any): any {
  return schema._def?.innerType ?? schema._def?.unwrapped ?? schema;
}

/**
 * Build Ant Design rules for a single Zod field
 */
function fieldToRules(schema: any, fieldName: string): Rule[] {
  const rules: Rule[] = [];

  if (!isOptional(schema)) {
    rules.push({
      required: true,
      message: `${fieldName} is required`,
    });
  }

  rules.push({
    validator: async (_, value) => {
      if (value === undefined || value === null || value === '') return;
      const result = await schema.safeParseAsync(value);
      if (!result.success) {
        // v3: .errors, v4: .issues
        const issues = result.error.errors ?? result.error.issues ?? [];
        throw new Error(issues[0]?.message ?? 'Validation failed');
      }
    },
  });

  return rules;
}

/**
 * Recursively convert a Zod object schema into a nested rules map
 * that mirrors Ant Design's `Form.Item` `name` path structure.
 *
 * Supports arbitrarily deep nesting:
 *   zodToAntdRules(schema).address.city  →  Rule[]
 */
export function zodToAntdRules(schema: z.ZodSchema<any>): Record<string, any> {
  const rules: Record<string, any> = {};
  const unwrapped = unwrapEffects(schema);

  if (!isType(unwrapped, 'ZodObject')) return rules;

  const shape = getShape(unwrapped);
  if (!shape) return rules;

  for (const [key, fieldSchema] of Object.entries(shape)) {
    let inner = fieldSchema as any;

    // Peel optional/nullable wrappers for nested-object detection
    if (isType(inner, 'ZodOptional') || isType(inner, 'ZodNullable')) {
      inner = getInnerType(inner);
    }

    const unwrappedField = unwrapEffects(inner);

    if (isType(unwrappedField, 'ZodObject')) {
      rules[key] = zodToAntdRules(unwrappedField);
    } else {
      rules[key] = fieldToRules(fieldSchema as any, key);
    }
  }

  return rules;
}
